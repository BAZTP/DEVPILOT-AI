export declare class SecurityError extends Error {
    constructor(message: string);
}
/**
 * Sanitiza y resuelve una ruta relativa dentro del directorio raíz del workspace.
 * Previene ataques de Path Traversal (../, %2e%2e, null bytes, symlinks maliciosos).
 */
export declare function resolveSafePath(basePath: string, relativePath: string): string;
export declare function validateFileExtension(filePath: string): void;
/**
 * Directorios y archivos que deben ignorarse al indexar el árbol del workspace
 */
export declare const IGNORED_DIRECTORY_NAMES: Set<string>;
//# sourceMappingURL=security.d.ts.map