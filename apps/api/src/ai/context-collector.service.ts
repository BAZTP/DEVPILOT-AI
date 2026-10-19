import { Injectable, Logger } from "@nestjs/common";
import { FilesService } from "../files/files.service";
import { ProjectsService } from "../projects/projects.service";
import { WorkspaceContext } from "./types";
import { FileNode } from "@devpilot/shared";

@Injectable()
export class ContextCollectorService {
  private readonly logger = new Logger(ContextCollectorService.name);
  private readonly MAX_FILE_SIZE_BYTES = 50_000; // 50 KB por archivo en contexto

  constructor(
    private readonly filesService: FilesService,
    private readonly projectsService: ProjectsService,
  ) {}

  /**
   * Recopila el contexto real y estructurado del workspace del proyecto.
   */
  async collectContext(
    projectId: string,
    activeFilePath?: string,
    requestedContextFiles: string[] = [],
  ): Promise<WorkspaceContext> {
    const project = await this.projectsService.getProject("system", projectId).catch(() => null);
    const projectName = project?.name || "devpilot-project";

    // 1. Obtener árbol de archivos real
    let fileTreeNodes: FileNode[] = [];
    try {
      const tree = await this.filesService.getTree(projectId);
      if (tree) fileTreeNodes = tree;
    } catch (err: any) {
      this.logger.warn(`No se pudo leer árbol para el proyecto ${projectId}: ${err.message}`);
    }

    const fileTreeSnippet = this.formatFileTreeSnippet(fileTreeNodes);

    // 2. Leer archivo activo si existe
    let activeFileContent: string | undefined;
    if (activeFilePath) {
      try {
        const fileData = await this.filesService.readFile(projectId, activeFilePath);
        if (fileData?.content) {
          activeFileContent = fileData.content.slice(0, this.MAX_FILE_SIZE_BYTES);
        }
      } catch {
        // El archivo activo podría no existir en disco aún
      }
    }

    // 3. Leer archivos adicionales solicitados en el contexto
    const contextFiles: Array<{ path: string; content: string }> = [];
    const filesToRead = Array.from(new Set([...requestedContextFiles]));

    for (const filePath of filesToRead) {
      if (filePath === activeFilePath) continue;
      try {
        const data = await this.filesService.readFile(projectId, filePath);
        if (data?.content) {
          contextFiles.push({
            path: filePath,
            content: data.content.slice(0, this.MAX_FILE_SIZE_BYTES),
          });
        }
      } catch {
        // Ignorar archivos que no se puedan leer
      }
    }

    // 4. Intentar leer dependencias de package.json si existe
    let dependencies: Record<string, string> | undefined;
    try {
      const pkg = await this.filesService.readFile(projectId, "package.json");
      if (pkg?.content) {
        const parsed = JSON.parse(pkg.content);
        dependencies = {
          ...(parsed.dependencies || {}),
          ...(parsed.devDependencies || {}),
        };
      }
    } catch {
      // No es un proyecto node o no existe package.json
    }

    return {
      projectId,
      projectName,
      activeFilePath,
      activeFileContent,
      contextFiles,
      fileTreeSnippet,
      dependencies,
    };
  }

  /**
   * Convierte la lista de nodos en un formato textual compacto para el prompt del LLM.
   */
  private formatFileTreeSnippet(nodes: FileNode[], prefix = ""): string {
    let result = "";
    for (const node of nodes.slice(0, 50)) { // Limitar a los primeros 50 elementos
      const line = `${prefix}- ${node.name} (${node.type})\n`;
      result += line;
      if (node.children && node.children.length > 0 && prefix.length < 12) {
        result += this.formatFileTreeSnippet(node.children, prefix + "  ");
      }
    }
    return result || "- (directorio raíz vacío)";
  }

  /**
   * Construye el system prompt contextual enriquecido con la información real del proyecto.
   */
  buildSystemPrompt(context: WorkspaceContext, mode: string = "CHAT"): string {
    const depsSnippet = context.dependencies
      ? Object.entries(context.dependencies)
          .slice(0, 25)
          .map(([name, ver]) => `${name}@${ver}`)
          .join(", ")
      : "No detectadas";

    return `Eres DevPilot Assistant, el copiloto inteligente de desarrollo integrado en DevPilot AI.
Eres un equipo senior de desarrollo: Arquitecto, Desarrollador Full Stack, Especialista en Seguridad y QA.
Idioma principal: Español. Respuestas técnicas, precisas, profesionales y bien formateadas con Markdown.

=== INFORMACIÓN REAL DEL PROYECTO ACTUAL ===
- Nombre del proyecto: ${context.projectName}
- ID del proyecto: ${context.projectId}
- Dependencias clave: ${depsSnippet}
- Estructura de archivos del workspace:
${context.fileTreeSnippet}

=== ARCHIVO ACTIVO EN EL EDITOR ===
${context.activeFilePath ? `Ruta: ${context.activeFilePath}\n\`\`\`\n${context.activeFileContent || "// (archivo vacío)"}\n\`\`\`` : "Ningún archivo activo seleccionado actualmente."}

=== OTROS ARCHIVOS EN CONTEXTO ===
${context.contextFiles.length > 0 ? context.contextFiles.map((f) => `--- Archivo: ${f.path} ---\n\`\`\`\n${f.content}\n\`\`\``).join("\n\n") : "No hay archivos secundarios en contexto."}

=== REGLAS OBLIGATORIAS ===
1. No inventes archivos o funciones inexistentes en el proyecto. Básate en la estructura real proporcionada.
2. Todo código propuesto debe ser funcional, seguro, libre de vulnerabilidades y en TypeScript/lenguaje correspondiente con tipado estricto.
3. Si el usuario pide modificar un archivo, incluye la explicación y el bloque de código propuesto completo o el diff.
4. MODO ACTUAL: ${mode}.
   - CHAT: Explica, aconseja o genera fragmentos con claridad.
   - PLAN: Elabora un plan de acción estructurado con fases y tareas numeradas.
   - EDIT: Enfócate en proponer modificaciones de código claras para el archivo activo o indicado.
   - AGENT: Desglosa la solución en pasos ejecutables verificables y supervisados.
`;
  }
}
