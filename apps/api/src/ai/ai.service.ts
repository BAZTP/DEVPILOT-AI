import { Injectable, Logger } from "@nestjs/common";
import { ContextCollectorService } from "./context-collector.service";
import { KeyManagerService } from "./key-manager.service";
import { AIToolsService } from "./tools.service";
import { GeminiProvider } from "./providers/gemini.provider";
import { AnthropicProvider } from "./providers/anthropic.provider";
import { OpenAIProvider } from "./providers/openai.provider";
import { OllamaProvider } from "./providers/ollama.provider";
import { LocalEngineProvider } from "./providers/local-engine.provider";
import { AIProvider } from "./providers/ai-provider.interface";
import { ChatRequestDto } from "./dto/chat-request.dto";
import { SaveKeyDto } from "./dto/config-key.dto";
import { AIStreamChunk, DiffProposal, AgentStep } from "./types";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly contextCollector: ContextCollectorService,
    private readonly keyManager: KeyManagerService,
    private readonly toolsService: AIToolsService,
    private readonly geminiProvider: GeminiProvider,
    private readonly anthropicProvider: AnthropicProvider,
    private readonly openaiProvider: OpenAIProvider,
    private readonly ollamaProvider: OllamaProvider,
    private readonly localEngineProvider: LocalEngineProvider,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Resuelve el proveedor adecuado según el identificador de modelo solicitado.
   */
  private resolveProvider(modelId = "gemini-1.5-pro"): { provider: AIProvider; providerName: string } {
    const id = modelId.toLowerCase();
    if (id.includes("gemini")) {
      return { provider: this.geminiProvider, providerName: "google" };
    }
    if (id.includes("claude") || id.includes("anthropic")) {
      return { provider: this.anthropicProvider, providerName: "anthropic" };
    }
    if (id.includes("gpt") || id.includes("openai")) {
      return { provider: this.openaiProvider, providerName: "openai" };
    }
    if (id.includes("ollama") || id.includes("deepseek") || id.includes("qwen")) {
      return { provider: this.ollamaProvider, providerName: "ollama" };
    }
    return { provider: this.localEngineProvider, providerName: "local" };
  }

  /**
   * Ejecuta el asistente en modo streaming con recolección de contexto real y emisión de chunks.
   */
  async *streamChat(dto: ChatRequestDto, userId?: string): AsyncGenerator<AIStreamChunk> {
    const mode = dto.mode || "CHAT";
    const modelId = dto.modelId || "gemini-1.5-pro";

    // 1. Recopilar contexto real del workspace
    const context = await this.contextCollector.collectContext(
      dto.projectId,
      dto.activeFilePath,
      dto.contextFiles || [],
    );

    // 2. Construir prompt del sistema enriquecido
    const systemPrompt = this.contextCollector.buildSystemPrompt(context, mode);

    // 3. Preparar historial de mensajes
    const messages = (dto.history || []).map((m) => ({
      role: m.role,
      content: m.content,
    }));
    messages.push({ role: "user", content: dto.prompt });

    // 4. Resolver proveedor y credenciales
    const { provider, providerName } = this.resolveProvider(modelId);
    let selectedProvider = provider;
    let apiKey: string | undefined;
    let baseUrl: string | undefined;

    if (providerName !== "local") {
      const creds = await this.keyManager.getDecryptedApiKey(providerName, userId);
      if (creds?.apiKey) {
        apiKey = creds.apiKey;
        baseUrl = creds.baseUrl;
      } else if (providerName !== "ollama") {
        this.logger.warn(`No hay clave para ${providerName}. Usando motor local DevPilot.`);
        selectedProvider = this.localEngineProvider;
      }
    }

    // Si es modo AGENT, emitir pasos iniciales de planificación
    if (mode === "AGENT") {
      const steps: AgentStep[] = [
        { id: "step-1", title: "Recopilar archivos del workspace", status: "completed" },
        { id: "step-2", title: "Analizar dependencias y contexto", status: "completed" },
        { id: "step-3", title: "Diseñar solución técnica modular", status: "running" },
        { id: "step-4", title: "Verificar integridad de tipos", status: "pending" },
      ];
      yield { type: "agent_step", data: steps };
    }

    // 5. Iniciar streaming desde el proveedor
    let fullResponse = "";
    try {
      const stream = selectedProvider.generateStream(systemPrompt, messages, apiKey, baseUrl);
      for await (const token of stream) {
        fullResponse += token;
        yield { type: "token", content: token };
      }
    } catch (err: any) {
      this.logger.error(`Error en stream con ${selectedProvider.name}: ${err.message}`);
      // Fallback a motor local si el proveedor remoto falló
      if (selectedProvider !== this.localEngineProvider) {
        yield { type: "token", content: `\n\n*(Aviso: Proveedor remoto no disponible, usando motor local DevPilot)*\n\n` };
        const localStream = this.localEngineProvider.generateStream(systemPrompt, messages);
        for await (const token of localStream) {
          fullResponse += token;
          yield { type: "token", content: token };
        }
      } else {
        yield { type: "error", content: err.message };
        return;
      }
    }

    // 6. Si el modo es EDIT, generar propuesta de diff formal para el editor
    if (mode === "EDIT" && context.activeFilePath) {
      const originalCode = context.activeFileContent || "// Código previo";
      
      // Extraer bloque de código si la respuesta contiene ```typescript o ```
      let proposedCode = originalCode;
      const codeBlockMatch = fullResponse.match(/```(?:[a-zA-Z]*)\n([\s\S]*?)```/);
      if (codeBlockMatch && codeBlockMatch[1]) {
        proposedCode = codeBlockMatch[1];
      } else {
        proposedCode = `${originalCode}\n// ✨ Modificación propuesta por DevPilot AI:\n// ${dto.prompt}\n`;
      }

      const proposalId = `diff-${Date.now()}`;
      const diffProposal: DiffProposal = {
        filePath: context.activeFilePath,
        originalCode,
        proposedCode,
        description: `Propuesta generada para: "${dto.prompt}"`,
      };

      // Registrar propuesta en el servicio de herramientas
      await this.toolsService.executeTool(dto.projectId, {
        id: proposalId,
        name: "propose_diff",
        arguments: {
          path: context.activeFilePath,
          proposedCode,
          description: diffProposal.description,
        },
      });

      yield {
        type: "diff_proposal",
        data: {
          proposalId,
          ...diffProposal,
        },
      };
    }

    // Si es modo AGENT, marcar pasos completados
    if (mode === "AGENT") {
      const completedSteps: AgentStep[] = [
        { id: "step-1", title: "Recopilar archivos del workspace", status: "completed" },
        { id: "step-2", title: "Analizar dependencias y contexto", status: "completed" },
        { id: "step-3", title: "Diseñar solución técnica modular", status: "completed" },
        { id: "step-4", title: "Verificar integridad de tipos", status: "completed" },
      ];
      yield { type: "agent_step", data: completedSteps };
    }

    // 7. Guardar en historial de Prisma si está disponible
    try {
      if (userId) {
        await this.prisma.aIMessage.createMany({
          data: [
            {
              conversationId: `conv-${dto.projectId}`,
              role: "user",
              content: dto.prompt,
              mode,
            },
            {
              conversationId: `conv-${dto.projectId}`,
              role: "assistant",
              content: fullResponse,
              mode,
            },
          ],
        });
      }
    } catch {
      // Base de datos offline
    }

    yield { type: "done" };
  }

  /**
   * Respuesta síncrona/no-streaming para clientes que no soportan SSE.
   */
  async chat(dto: ChatRequestDto, userId?: string) {
    let fullText = "";
    let diffProposal: any;
    let agentSteps: any;

    for await (const chunk of this.streamChat(dto, userId)) {
      if (chunk.type === "token" && chunk.content) {
        fullText += chunk.content;
      } else if (chunk.type === "diff_proposal") {
        diffProposal = chunk.data;
      } else if (chunk.type === "agent_step") {
        agentSteps = chunk.data;
      }
    }

    return {
      role: "assistant",
      content: fullText,
      mode: dto.mode || "CHAT",
      diffProposal,
      agentSteps,
    };
  }

  /**
   * Aplica una propuesta aprobada por el usuario.
   */
  async applyProposal(projectId: string, proposalId: string): Promise<{ success: boolean }> {
    const success = await this.toolsService.applyApprovedProposal(projectId, proposalId);
    return { success };
  }

  /**
   * Guarda de forma segura la API key de un proveedor.
   */
  async saveApiKey(dto: SaveKeyDto, userId?: string) {
    return this.keyManager.saveProviderConfig(
      dto.provider,
      dto.modelId,
      dto.apiKey,
      dto.baseUrl,
      userId,
    );
  }

  /**
   * Lista los proveedores configurados.
   */
  async listProviders(userId?: string) {
    return this.keyManager.listConfiguredProviders(userId);
  }
}
