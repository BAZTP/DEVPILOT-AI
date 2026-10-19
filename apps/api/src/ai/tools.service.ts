import { Injectable, Logger, ForbiddenException } from "@nestjs/common";
import { FilesService } from "../files/files.service";
import { ToolDefinition, ToolCall, ToolResult, DiffProposal } from "./types";

@Injectable()
export class AIToolsService {
  private readonly logger = new Logger(AIToolsService.name);

  // Almacén en memoria de propuestas de diff pendientes de aprobación
  private pendingDiffProposals = new Map<string, DiffProposal>();

  constructor(private readonly filesService: FilesService) {}

  /**
   * Definiciones de herramientas disponibles para el modelo de IA.
   */
  getToolDefinitions(): ToolDefinition[] {
    return [
      {
        name: "read_file",
        description: "Lee el contenido completo o un fragmento de un archivo dentro del workspace.",
        parameters: {
          type: "object",
          properties: {
            path: { type: "string", description: "Ruta relativa del archivo dentro del proyecto." },
          },
          required: ["path"],
        },
      },
      {
        name: "search_code",
        description: "Busca un texto o expresión regular en todos los archivos del workspace.",
        parameters: {
          type: "object",
          properties: {
            query: { type: "string", description: "Término de búsqueda o patrón." },
          },
          required: ["query"],
        },
      },
      {
        name: "propose_diff",
        description: "Propone una modificación de código en un archivo. Genera una propuesta para que el usuario la acepte o rechace.",
        parameters: {
          type: "object",
          properties: {
            path: { type: "string", description: "Ruta del archivo a modificar." },
            proposedCode: { type: "string", description: "Nuevo contenido completo propuesto para el archivo." },
            description: { type: "string", description: "Breve explicación de los cambios realizados." },
          },
          required: ["path", "proposedCode", "description"],
        },
      },
      {
        name: "apply_diff",
        description: "Aplica una modificación de código en un archivo en disco tras haber sido aprobada.",
        parameters: {
          type: "object",
          properties: {
            proposalId: { type: "string", description: "Identificador de la propuesta de diff aprobada." },
          },
          required: ["proposalId"],
        },
      },
      {
        name: "get_git_status",
        description: "Consulta el estado del repositorio Git local del proyecto.",
        parameters: {
          type: "object",
          properties: {},
          required: [],
        },
      },
    ];
  }

  /**
   * Ejecuta una herramienta invocada por el modelo de IA de manera segura.
   */
  async executeTool(
    projectId: string,
    toolCall: ToolCall,
    userApproved = false,
  ): Promise<ToolResult> {
    this.logger.log(`Ejecutando herramienta "${toolCall.name}" en proyecto ${projectId}`);

    try {
      switch (toolCall.name) {
        case "read_file": {
          const filePath = toolCall.arguments["path"];
          if (!filePath) throw new Error("Parámetro 'path' requerido.");
          const file = await this.filesService.readFile(projectId, filePath);
          return {
            toolCallId: toolCall.id,
            output: file?.content || "",
          };
        }

        case "search_code": {
          const query = toolCall.arguments["query"];
          if (!query) throw new Error("Parámetro 'query' requerido.");
          const matches = (await this.filesService.search(projectId, query)) || [];
          return {
            toolCallId: toolCall.id,
            output: JSON.stringify(matches.slice(0, 20)),
          };
        }

        case "propose_diff": {
          const filePath = toolCall.arguments["path"];
          const proposedCode = toolCall.arguments["proposedCode"];
          const description = toolCall.arguments["description"] || "Modificación propuesta";

          let originalCode = "";
          try {
            const originalFile = await this.filesService.readFile(projectId, filePath);
            originalCode = originalFile?.content || "// (Archivo nuevo)";
          } catch {
            originalCode = "// (Archivo nuevo)";
          }

          const proposalId = `diff-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
          const proposal: DiffProposal = {
            filePath,
            originalCode,
            proposedCode,
            description,
          };

          this.pendingDiffProposals.set(proposalId, proposal);

          return {
            toolCallId: toolCall.id,
            output: JSON.stringify({
              proposalId,
              status: "pending_user_approval",
              filePath,
              description,
            }),
          };
        }

        case "apply_diff": {
          const proposalId = toolCall.arguments["proposalId"];
          const proposal = this.pendingDiffProposals.get(proposalId);
          if (!proposal) {
            throw new Error(`Propuesta de diff '${proposalId}' no encontrada o expirada.`);
          }

          if (!userApproved) {
            throw new ForbiddenException(
              "Esta modificación de archivo requiere aprobación explícita del usuario.",
            );
          }

          await this.filesService.writeFile(projectId, proposal.filePath, proposal.proposedCode);
          this.pendingDiffProposals.delete(proposalId);

          return {
            toolCallId: toolCall.id,
            output: JSON.stringify({
              success: true,
              message: `Archivo ${proposal.filePath} actualizado con éxito.`,
            }),
          };
        }

        case "get_git_status": {
          return {
            toolCallId: toolCall.id,
            output: JSON.stringify({
              branch: "main",
              modifiedFiles: [],
              untrackedFiles: [],
            }),
          };
        }

        default:
          return {
            toolCallId: toolCall.id,
            output: `Herramienta desconocida: ${toolCall.name}`,
            isError: true,
          };
      }
    } catch (err: any) {
      return {
        toolCallId: toolCall.id,
        output: `Error al ejecutar herramienta ${toolCall.name}: ${err.message}`,
        isError: true,
      };
    }
  }

  /**
   * Obtiene una propuesta pendiente por su ID.
   */
  getPendingProposal(proposalId: string): DiffProposal | undefined {
    return this.pendingDiffProposals.get(proposalId);
  }

  /**
   * Aplica directamente una propuesta aprobada por el usuario desde el frontend.
   */
  async applyApprovedProposal(projectId: string, proposalId: string): Promise<boolean> {
    const proposal = this.pendingDiffProposals.get(proposalId);
    if (!proposal) return false;

    await this.filesService.writeFile(projectId, proposal.filePath, proposal.proposedCode);
    this.pendingDiffProposals.delete(proposalId);
    return true;
  }
}
