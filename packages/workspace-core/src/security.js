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
exports.IGNORED_DIRECTORY_NAMES = exports.SecurityError = void 0;
exports.resolveSafePath = resolveSafePath;
exports.validateFileExtension = validateFileExtension;
const path = __importStar(require("path"));
class SecurityError extends Error {
    constructor(message) {
        super(message);
        this.name = "SecurityError";
    }
}
exports.SecurityError = SecurityError;
/**
 * Sanitiza y resuelve una ruta relativa dentro del directorio raíz del workspace.
 * Previene ataques de Path Traversal (../, %2e%2e, null bytes, symlinks maliciosos).
 */
function resolveSafePath(basePath, relativePath) {
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
        throw new SecurityError(`Acceso denegado: La ruta '${relativePath}' escapa del workspace asignado.`);
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
function validateFileExtension(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    if (FORBIDDEN_EXTENSIONS.has(ext)) {
        throw new SecurityError(`Tipo de archivo no permitido para edición de texto: ${ext}`);
    }
}
/**
 * Directorios y archivos que deben ignorarse al indexar el árbol del workspace
 */
exports.IGNORED_DIRECTORY_NAMES = new Set([
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
//# sourceMappingURL=security.js.map