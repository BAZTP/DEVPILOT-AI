"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceManager = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const security_1 = require("./security");
const templates_1 = require("./templates");
class WorkspaceManager {
    baseDir;
    constructor(config) {
        this.baseDir = path.resolve(config.baseDirectory);
    }
    /**
     * Crea un proyecto nuevo con su estructura de archivos funcional en disco.
     */
    async createProject(projectId, projectName, template) {
        const projectDir = (0, security_1.resolveSafePath)(this.baseDir, projectId);
        await fs.mkdir(projectDir, { recursive: true });
        const files = (0, templates_1.getTemplateFiles)(template, projectName);
        for (const file of files) {
            const targetFilePath = (0, security_1.resolveSafePath)(projectDir, file.relativePath);
            await fs.mkdir(path.dirname(targetFilePath), { recursive: true });
            await fs.writeFile(targetFilePath, file.content, "utf-8");
        }
        return projectDir;
    }
    /**
     * Lee la estructura recursiva del árbol de archivos del proyecto.
     */
    async getFileTree(projectId, subPath = "") {
        const projectDir = (0, security_1.resolveSafePath)(this.baseDir, projectId);
        const targetDir = subPath ? (0, security_1.resolveSafePath)(projectDir, subPath) : projectDir;
        return this.scanDir(projectDir, targetDir, subPath);
    }
    async scanDir(projectRoot, currentDir, currentRelative) {
        const entries = await fs.readdir(currentDir, { withFileTypes: true });
        const nodes = [];
        for (const entry of entries) {
            if (security_1.IGNORED_DIRECTORY_NAMES.has(entry.name)) {
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
            }
            else if (entry.isFile()) {
                try {
                    const stats = await fs.stat(entryAbsolute);
                    nodes.push({
                        name: entry.name,
                        path: entryRelative,
                        type: "file",
                        size: stats.size,
                    });
                }
                catch {
                    // Si el archivo no es accesible, omitir
                }
            }
        }
        // Ordenar: primero carpetas, luego archivos alfabéticamente
        return nodes.sort((a, b) => {
            if (a.type === b.type)
                return a.name.localeCompare(b.name);
            return a.type === "directory" ? -1 : 1;
        });
    }
    /**
     * Lee el contenido de un archivo en formato UTF-8.
     */
    async readFile(projectId, relativePath) {
        const projectDir = (0, security_1.resolveSafePath)(this.baseDir, projectId);
        const targetFile = (0, security_1.resolveSafePath)(projectDir, relativePath);
        (0, security_1.validateFileExtension)(targetFile);
        const stats = await fs.stat(targetFile);
        if (stats.size > 10 * 1024 * 1024) {
            throw new security_1.SecurityError("El archivo excede el límite máximo de 10 MB.");
        }
        return fs.readFile(targetFile, "utf-8");
    }
    /**
     * Escribe contenido en un archivo existente o nuevo.
     */
    async writeFile(projectId, relativePath, content) {
        const projectDir = (0, security_1.resolveSafePath)(this.baseDir, projectId);
        const targetFile = (0, security_1.resolveSafePath)(projectDir, relativePath);
        (0, security_1.validateFileExtension)(targetFile);
        await fs.mkdir(path.dirname(targetFile), { recursive: true });
        await fs.writeFile(targetFile, content, "utf-8");
    }
    /**
     * Crea un directorio.
     */
    async createDirectory(projectId, relativePath) {
        const projectDir = (0, security_1.resolveSafePath)(this.baseDir, projectId);
        const targetDir = (0, security_1.resolveSafePath)(projectDir, relativePath);
        await fs.mkdir(targetDir, { recursive: true });
    }
    /**
     * Elimina un archivo o directorio.
     */
    async deleteItem(projectId, relativePath) {
        const projectDir = (0, security_1.resolveSafePath)(this.baseDir, projectId);
        const targetPath = (0, security_1.resolveSafePath)(projectDir, relativePath);
        if (targetPath === projectDir) {
            throw new security_1.SecurityError("No se permite eliminar la raíz del proyecto directamente.");
        }
        await fs.rm(targetPath, { recursive: true, force: true });
    }
    /**
     * Renombra o mueve un elemento dentro del workspace.
     */
    async renameItem(projectId, oldRelativePath, newRelativePath) {
        const projectDir = (0, security_1.resolveSafePath)(this.baseDir, projectId);
        const oldPath = (0, security_1.resolveSafePath)(projectDir, oldRelativePath);
        const newPath = (0, security_1.resolveSafePath)(projectDir, newRelativePath);
        await fs.mkdir(path.dirname(newPath), { recursive: true });
        await fs.rename(oldPath, newPath);
    }
    /**
     * Busca texto dentro de los archivos del proyecto.
     */
    async searchInFiles(projectId, query, matchCase = false, useRegex = false) {
        const projectDir = (0, security_1.resolveSafePath)(this.baseDir, projectId);
        const results = [];
        const searchDir = async (dir, relPrefix = "") => {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
                if (security_1.IGNORED_DIRECTORY_NAMES.has(entry.name))
                    continue;
                const relPath = relPrefix ? `${relPrefix}/${entry.name}` : entry.name;
                const absPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    await searchDir(absPath, relPath);
                }
                else if (entry.isFile()) {
                    try {
                        (0, security_1.validateFileExtension)(absPath);
                        const content = await fs.readFile(absPath, "utf-8");
                        const lines = content.split("\n");
                        lines.forEach((lineText, idx) => {
                            let match = false;
                            if (useRegex) {
                                try {
                                    const reg = new RegExp(query, matchCase ? "" : "i");
                                    match = reg.test(lineText);
                                }
                                catch {
                                    match = false;
                                }
                            }
                            else {
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
                    }
                    catch {
                        // Ignorar archivos que no se puedan leer como texto
                    }
                }
            }
        };
        await searchDir(projectDir);
        return results;
    }
}
exports.WorkspaceManager = WorkspaceManager;
//# sourceMappingURL=workspace.js.map