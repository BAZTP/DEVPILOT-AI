import { Injectable, Logger } from "@nestjs/common";
import { AIProvider } from "./ai-provider.interface";

@Injectable()
export class OllamaProvider implements AIProvider {
  readonly name = "ollama";
  readonly defaultModel = "deepseek-coder";
  private readonly logger = new Logger(OllamaProvider.name);

  async *generateStream(
    systemPrompt: string,
    messages: Array<{ role: string; content: string }>,
    _apiKey?: string,
    baseUrl?: string,
  ): AsyncGenerator<string> {
    const host = baseUrl || "http://localhost:11434";
    const url = `${host}/api/chat`;

    const formattedMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
    ];

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.defaultModel,
          messages: formattedMessages,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama retornó código HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No se pudo iniciar el stream con Ollama.");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            if (parsed.message?.content) {
              yield parsed.message.content;
            }
            if (parsed.done) return;
          } catch {
            // Buffer incompleto
          }
        }
      }
    } catch (err: any) {
      this.logger.warn(`Ollama local no disponible en ${host}: ${err.message}`);
      throw new Error(
        `No se pudo conectar a Ollama en ${host}. Asegúrate de que Ollama esté ejecutándose localmente con 'ollama serve'.`,
      );
    }
  }

  async generate(
    systemPrompt: string,
    messages: Array<{ role: string; content: string }>,
    apiKey?: string,
    baseUrl?: string,
  ): Promise<string> {
    let result = "";
    for await (const chunk of this.generateStream(systemPrompt, messages, apiKey, baseUrl)) {
      result += chunk;
    }
    return result;
  }
}
