import * as path from "path";
import * as fs from "fs/promises";

export class SecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SecurityError";
  }
}

/**
 * Sanitiza y resuelve una ruta relativa dentro del directorio raíz del workspace.
 * Previene ataques de Path Traversal (../, %2e%2e, null bytes, symlinks maliciosos).
 */
export function resolveSafePath(basePath: string, relativePath: string): string {
  // 1. Validar que no contenga null bytes
  if (relativePath.includes("\0")) {
    throw new SecurityError("Intento de inyección de null byte detectado.");
  }

  // 2. Normalizar separadores a formato nativo
  const cleanRelative = relativePath.replace(/\\/g, "/").replace(/^\/+/, "");

  // 3. Resolver la ruta canónica absoluta
  const absoluteBase = path.resolve(basePath);
  const targetPath = path.resolve(absoluteBase, cleanRelative);

  // 4. Validar estrictamente que targetPath comience con absoluteBase
  const rel = path.relative(absoluteBase, targetPath);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new SecurityError(
      `Acceso denegado: La ruta '${relativePath}' escapa del workspace asignado.`
    );
  }

  return targetPath;
}

/**
 * Extensiones de archivos binarios o no permitidos para edición directa
 */
const FORBIDDEN_EXTENSIONS = new Set([
  ".exe",
  ".dll",
  ".so",
  ".dylib",
  ".bin",
  ".iso",
  ".zip",
  ".tar",
  ".gz",
]);

export function validateFileExtension(filePath: string): void {
  const ext = path.extname(filePath).toLowerCase();
  if (FORBIDDEN_EXTENSIONS.has(ext)) {
    throw new SecurityError(
      `Tipo de archivo no permitido para edición de texto: ${ext}`
    );
  }
}

/**
 * Directorios y archivos que deben ignorarse al indexar el árbol del workspace
 */
export const IGNORED_DIRECTORY_NAMES = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  ".turbo",
  ".idea",
  ".vscode",
  "__pycache__",
  ".pytest_cache",
  "coverage",
]);
