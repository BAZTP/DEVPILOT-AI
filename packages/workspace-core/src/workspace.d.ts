import { FileNode } from "@devpilot/shared";
import { SupportedTemplate } from "./templates";
export interface WorkspaceConfig {
    baseDirectory: string;
}
export declare class WorkspaceManager {
    private baseDir;
    constructor(config: WorkspaceConfig);
    /**
     * Crea un proyecto nuevo con su estructura de archivos funcional en disco.
     */
    createProject(projectId: string, projectName: string, template: SupportedTemplate): Promise<string>;
    /**
     * Lee la estructura recursiva del árbol de archivos del proyecto.
     */
    getFileTree(projectId: string, subPath?: string): Promise<FileNode[]>;
    private scanDir;
    /**
     * Lee el contenido de un archivo en formato UTF-8.
     */
    readFile(projectId: string, relativePath: string): Promise<string>;
    /**
     * Escribe contenido en un archivo existente o nuevo.
     */
    writeFile(projectId: string, relativePath: string, content: string): Promise<void>;
    /**
     * Crea un directorio.
     */
    createDirectory(projectId: string, relativePath: string): Promise<void>;
    /**
     * Elimina un archivo o directorio.
     */
    deleteItem(projectId: string, relativePath: string): Promise<void>;
    /**
     * Renombra o mueve un elemento dentro del workspace.
     */
    renameItem(projectId: string, oldRelativePath: string, newRelativePath: string): Promise<void>;
    /**
     * Busca texto dentro de los archivos del proyecto.
     */
    searchInFiles(projectId: string, query: string, matchCase?: boolean, useRegex?: boolean): Promise<Array<{
        filePath: string;
        line: number;
        content: string;
    }>>;
}
//# sourceMappingURL=workspace.d.ts.map