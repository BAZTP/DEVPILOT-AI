import * as fs from "fs/promises";
import * as path from "path";
import {
  resolveSafePath,
  validateFileExtension,
  IGNORED_DIRECTORY_NAMES,
  SecurityError,
} from "./security";
import { getTemplateFiles, SupportedTemplate } from "./templates";

export interface FileNodeItem {
  name: string;
  path: string;
  type: "file" | "directory";
  size?: number;
  children?: FileNodeItem[];
}

export interface WorkspaceConfig {
  baseDirectory: string;
}

export class WorkspaceManager {
  private baseDir: string;

  constructor(config: WorkspaceConfig) {
    this.baseDir = path.resolve(config.baseDirectory);
  }

  async createProject(
    projectId: string,
    projectName: string,
    template: SupportedTemplate
  ): Promise<string> {
    const projectDir = resolveSafePath(this.baseDir, projectId);
    await fs.mkdir(projectDir, { recursive: true });

    const files = getTemplateFiles(template, projectName);
    for (const file of files) {
      const targetFilePath = resolveSafePath(projectDir, file.relativePath);
      await fs.mkdir(path.dirname(targetFilePath), { recursive: true });
      await fs.writeFile(targetFilePath, file.content, "utf-8");
    }

    return projectDir;
  }

  getProjectDirectory(projectId: string): string {
    return resolveSafePath(this.baseDir, projectId);
  }

  async getFileTree(projectId: string, subPath = ""): Promise<FileNodeItem[]> {
    const projectDir = resolveSafePath(this.baseDir, projectId);
    const targetDir = subPath ? resolveSafePath(projectDir, subPath) : projectDir;

    return this.scanDir(projectDir, targetDir, subPath);
  }

  private async scanDir(
    projectRoot: string,
    currentDir: string,
    currentRelative: string
  ): Promise<FileNodeItem[]> {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    const nodes: FileNodeItem[] = [];

    for (const entry of entries) {
      if (IGNORED_DIRECTORY_NAMES.has(entry.name)) {
        continue;
      }

      const entryRelative = currentRelative
        ? `${currentRelative}/${entry.name}`
        : entry.name;
      const entryAbsolute = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        const children = await this.scanDir(projectRoot, entryAbsolute, entryRelative);
        nodes.push({
          name: entry.name,
          path: entryRelative,
          type: "directory",
          children,
        });
      } else if (entry.isFile()) {
        try {
          const stats = await fs.stat(entryAbsolute);
          nodes.push({
            name: entry.name,
            path: entryRelative,
            type: "file",
            size: stats.size,
          });
        } catch {
          // Si el archivo no es accesible, omitir
        }
      }
    }

    return nodes.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === "directory" ? -1 : 1;
    });
  }

  async readFile(projectId: string, relativePath: string): Promise<string> {
    const projectDir = resolveSafePath(this.baseDir, projectId);
    const targetFile = resolveSafePath(projectDir, relativePath);
    validateFileExtension(targetFile);

    const stats = await fs.stat(targetFile);
    if (stats.size > 10 * 1024 * 1024) {
      throw new SecurityError("El archivo excede el límite máximo de 10 MB.");
    }

    return fs.readFile(targetFile, "utf-8");
  }

  async writeFile(
    projectId: string,
    relativePath: string,
    content: string
  ): Promise<void> {
    const projectDir = resolveSafePath(this.baseDir, projectId);
    const targetFile = resolveSafePath(projectDir, relativePath);
    validateFileExtension(targetFile);

    await fs.mkdir(path.dirname(targetFile), { recursive: true });
    await fs.writeFile(targetFile, content, "utf-8");
  }

  async createDirectory(projectId: string, relativePath: string): Promise<void> {
    const projectDir = resolveSafePath(this.baseDir, projectId);
    const targetDir = resolveSafePath(projectDir, relativePath);
    await fs.mkdir(targetDir, { recursive: true });
  }

  async deleteItem(projectId: string, relativePath: string): Promise<void> {
    const projectDir = resolveSafePath(this.baseDir, projectId);
    const targetPath = resolveSafePath(projectDir, relativePath);

    if (targetPath === projectDir) {
      throw new SecurityError("No se permite eliminar la raíz del proyecto directamente.");
    }

    await fs.rm(targetPath, { recursive: true, force: true });
  }

  async renameItem(
    projectId: string,
    oldRelativePath: string,
    newRelativePath: string
  ): Promise<void> {
    const projectDir = resolveSafePath(this.baseDir, projectId);
    const oldPath = resolveSafePath(projectDir, oldRelativePath);
    const newPath = resolveSafePath(projectDir, newRelativePath);

    await fs.mkdir(path.dirname(newPath), { recursive: true });
    await fs.rename(oldPath, newPath);
  }

  async searchInFiles(
    projectId: string,
    query: string,
    matchCase = false,
    useRegex = false
  ): Promise<Array<{ filePath: string; line: number; content: string }>> {
    const projectDir = resolveSafePath(this.baseDir, projectId);
    const results: Array<{ filePath: string; line: number; content: string }> = [];

    const searchDir = async (dir: string, relPrefix = "") => {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (IGNORED_DIRECTORY_NAMES.has(entry.name)) continue;

        const relPath = relPrefix ? `${relPrefix}/${entry.name}` : entry.name;
        const absPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          await searchDir(absPath, relPath);
        } else if (entry.isFile()) {
          try {
            validateFileExtension(absPath);
            const content = await fs.readFile(absPath, "utf-8");
            const lines = content.split("\n");

            lines.forEach((lineText, idx) => {
              let match = false;
              if (useRegex) {
                try {
                  const reg = new RegExp(query, matchCase ? "" : "i");
                  match = reg.test(lineText);
                } catch {
                  match = false;
                }
              } else {
                match = matchCase
                  ? lineText.includes(query)
                  : lineText.toLowerCase().includes(query.toLowerCase());
              }

              if (match) {
                results.push({
                  filePath: relPath,
                  line: idx + 1,
                  content: lineText.trim(),
                });
              }
            });
          } catch {
            // Ignorar archivos que no se puedan leer como texto
          }
        }
      }
    };

    await searchDir(projectDir);
    return results;
  }
}
