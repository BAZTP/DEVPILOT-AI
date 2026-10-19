// =============================================================================
// @devpilot/shared — Tipos y utilidades compartidas entre frontend y backend
// =============================================================================

// ─── Tipos de API ─────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
  timestamp: string;
  path?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// ─── Usuario ──────────────────────────────────────────────────────────────────

export type UserRole = "USER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface AuthTokens {
  accessToken: string;
  user: {
    id: string;
    email: string;
  };
}

// ─── Proyectos ────────────────────────────────────────────────────────────────

export type ProjectStatus = "ACTIVE" | "ARCHIVED" | "DELETED";

export type ProjectTemplate =
  | "BLANK"
  | "REACT"
  | "NEXTJS"
  | "NODEJS"
  | "PYTHON"
  | "NESTJS_API"
  | "HTML_CSS_JS";

export interface Project {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  workspaceId: string;
  status: ProjectStatus;
  template: ProjectTemplate;
  relativePath: string;
  isFavorite: boolean;
  language: string | null;
  createdAt: string;
  updatedAt: string;
  lastOpenedAt: string | null;
}

// ─── Sistema de archivos ──────────────────────────────────────────────────────

export type FileType = "file" | "directory" | "symlink";

export interface FileNode {
  name: string;
  path: string; // Ruta relativa al directorio del proyecto
  type: FileType;
  size?: number;
  mimeType?: string;
  children?: FileNode[]; // Solo para directorios
  isModified?: boolean;
}

export interface FileContent {
  path: string;
  content: string;
  encoding: "utf-8" | "base64";
  mimeType: string;
  size: number;
  lastModified: string;
}

// ─── Inteligencia Artificial ──────────────────────────────────────────────────

export type AIProvider =
  | "OPENAI"
  | "ANTHROPIC"
  | "GOOGLE"
  | "OLLAMA"
  | "OPENROUTER"
  | "CUSTOM";

export type AgentMode = "CHAT" | "PLAN" | "EDIT" | "AGENT";

export interface ModelConfiguration {
  id: string;
  name: string;
  provider: AIProvider;
  modelId: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface AIMessage {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  hasDiff: boolean;
  diffApplied?: boolean;
  createdAt: string;
}

export interface CodeDiff {
  filePath: string;
  before: string;
  after: string;
  language: string;
  description?: string;
}

// ─── WebSocket events ─────────────────────────────────────────────────────────

export type WSEventType =
  | "ai.stream.start"
  | "ai.stream.chunk"
  | "ai.stream.end"
  | "ai.stream.error"
  | "agent.step.start"
  | "agent.step.complete"
  | "agent.step.approval_required"
  | "agent.task.complete"
  | "execution.output"
  | "execution.complete"
  | "file.changed";

export interface WSEvent<T = unknown> {
  type: WSEventType;
  payload: T;
  timestamp: string;
}

// ─── Estado Git ───────────────────────────────────────────────────────────────

export type GitFileStatus =
  | "untracked"
  | "modified"
  | "added"
  | "deleted"
  | "renamed"
  | "conflicted";

export interface GitStatus {
  branch: string;
  ahead: number;
  behind: number;
  files: Array<{
    path: string;
    status: GitFileStatus;
  }>;
}

// ─── Ejecución ────────────────────────────────────────────────────────────────

export type ExecutionStatus =
  | "QUEUED"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED"
  | "TIMEOUT"
  | "CANCELLED";

export interface ExecutionResult {
  id: string;
  status: ExecutionStatus;
  exitCode: number | null;
  stdout: string;
  stderr: string;
  durationMs: number | null;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

/** Extensiones de archivo con soporte de Monaco Editor (built-in) */
export const MONACO_SUPPORTED_LANGUAGES = [
  "typescript",
  "javascript",
  "json",
  "html",
  "css",
  "scss",
  "python",
  "markdown",
  "yaml",
  "xml",
  "sql",
  "shell",
  "dockerfile",
  "plaintext",
] as const;

export type MonacoLanguage = (typeof MONACO_SUPPORTED_LANGUAGES)[number];

/** Extensión a lenguaje Monaco */
export const EXT_TO_MONACO_LANG: Record<string, MonacoLanguage> = {
  ".ts": "typescript",
  ".tsx": "typescript",
  ".js": "javascript",
  ".jsx": "javascript",
  ".mjs": "javascript",
  ".cjs": "javascript",
  ".json": "json",
  ".html": "html",
  ".htm": "html",
  ".css": "css",
  ".scss": "scss",
  ".py": "python",
  ".md": "markdown",
  ".mdx": "markdown",
  ".yaml": "yaml",
  ".yml": "yaml",
  ".xml": "xml",
  ".sql": "sql",
  ".sh": "shell",
  ".bash": "shell",
  ".zsh": "shell",
  ".dockerfile": "dockerfile",
  Dockerfile: "dockerfile",
};

/** Tamaño máximo de archivo que puede mostrar el editor (bytes) */
export const MAX_EDITOR_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/** Profundidad máxima del árbol de archivos */
export const MAX_TREE_DEPTH = 10;
