import { FileNode } from "@devpilot/shared";

const API_BASE_URL =
  process.env["NEXT_PUBLIC_API_URL"] || "http://localhost:3001";

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}/api/v1${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Error HTTP ${res.status}`);
    }
    return (await res.json()) as T;
  } catch (error) {
    throw error;
  }
}

// ─── Proyectos ────────────────────────────────────────────────────────────────

export interface ProjectDto {
  id: string;
  name: string;
  description?: string;
  template?: string;
  language?: string;
  isFavorite?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export async function fetchProjects(): Promise<ProjectDto[]> {
  return request<ProjectDto[]>("/projects");
}

export async function createProject(data: {
  name: string;
  description?: string;
  template?: string;
}): Promise<ProjectDto> {
  return request<ProjectDto>("/projects", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteProject(id: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/projects/${id}`, {
    method: "DELETE",
  });
}

export async function toggleFavoriteProject(id: string): Promise<ProjectDto> {
  return request<ProjectDto>(`/projects/${id}/favorite`, {
    method: "PATCH",
  });
}

// ─── Sistema de Archivos ──────────────────────────────────────────────────────

export async function fetchFileTree(projectId: string): Promise<FileNode[]> {
  return request<FileNode[]>(`/files/tree/${projectId}`);
}

export async function fetchFileContent(
  projectId: string,
  filePath: string
): Promise<{ path: string; content: string }> {
  const encPath = encodeURIComponent(filePath);
  return request<{ path: string; content: string }>(
    `/files/content/${projectId}?path=${encPath}`
  );
}

export async function saveFileContent(
  projectId: string,
  filePath: string,
  content: string
): Promise<{ path: string; saved: boolean }> {
  return request<{ path: string; saved: boolean }>(
    `/files/content/${projectId}`,
    {
      method: "POST",
      body: JSON.stringify({ path: filePath, content }),
    }
  );
}

export async function createFileRemote(
  projectId: string,
  filePath: string,
  initialContent = ""
): Promise<{ path: string; created: boolean }> {
  return request<{ path: string; created: boolean }>(
    `/files/create/${projectId}`,
    {
      method: "POST",
      body: JSON.stringify({ path: filePath, initialContent }),
    }
  );
}

export async function createDirectoryRemote(
  projectId: string,
  dirPath: string
): Promise<{ path: string; created: boolean }> {
  return request<{ path: string; created: boolean }>(
    `/files/mkdir/${projectId}`,
    {
      method: "POST",
      body: JSON.stringify({ path: dirPath }),
    }
  );
}

export async function deleteItemRemote(
  projectId: string,
  itemPath: string
): Promise<{ path: string; deleted: boolean }> {
  const encPath = encodeURIComponent(itemPath);
  return request<{ path: string; deleted: boolean }>(
    `/files/${projectId}?path=${encPath}`,
    {
      method: "DELETE",
    }
  );
}

export async function renameItemRemote(
  projectId: string,
  oldPath: string,
  newPath: string
): Promise<{ oldPath: string; newPath: string; renamed: boolean }> {
  return request<{ oldPath: string; newPath: string; renamed: boolean }>(
    `/files/rename/${projectId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ oldPath, newPath }),
    }
  );
}

export async function searchInFilesRemote(
  projectId: string,
  query: string,
  matchCase = false,
  regex = false
): Promise<Array<{ filePath: string; line: number; content: string }>> {
  const encQuery = encodeURIComponent(query);
  return request<Array<{ filePath: string; line: number; content: string }>>(
    `/files/search/${projectId}?q=${encQuery}&matchCase=${matchCase}&regex=${regex}`
  );
}

// ─── Inteligencia Artificial ──────────────────────────────────────────────────

export interface AIStreamChunkPayload {
  type: "token" | "diff_proposal" | "agent_step" | "error" | "done";
  content?: string;
  data?: any;
}

export async function streamAIChat(
  data: {
    projectId: string;
    prompt: string;
    mode?: ("CHAT" | "PLAN" | "EDIT" | "AGENT") | undefined;
    modelId?: string | undefined;
    activeFilePath?: string | undefined;
    contextFiles?: string[] | undefined;
    history?: Array<{ role: "user" | "assistant" | "system"; content: string }> | undefined;
  },
  onChunk: (chunk: AIStreamChunkPayload) => void
): Promise<void> {
  const url = `${API_BASE_URL}/api/v1/ai/chat/stream`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error en llamada a IA (${response.status}): ${errorText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No se pudo iniciar el lector de stream SSE.");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n\n");
    buffer = lines.pop() || "";

    for (const block of lines) {
      const line = block.trim();
      if (line.startsWith("data: ")) {
        try {
          const payload = JSON.parse(line.slice(6));
          onChunk(payload);
        } catch {
          // Payload incompleto
        }
      }
    }
  }
}

export async function applyDiffRemote(
  projectId: string,
  proposalId: string
): Promise<{ success: boolean }> {
  return request<{ success: boolean }>("/ai/tools/apply", {
    method: "POST",
    body: JSON.stringify({ projectId, proposalId }),
  });
}

export async function saveAIKeyRemote(data: {
  provider: "google" | "anthropic" | "openai" | "ollama";
  modelId: string;
  apiKey: string;
  baseUrl?: string | undefined;
}): Promise<{ provider: string; modelId: string; configured: boolean }> {
  return request<{ provider: string; modelId: string; configured: boolean }>(
    "/ai/config",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export async function fetchAIProviders(): Promise<
  Array<{ provider: string; configured: boolean }>
> {
  return request<Array<{ provider: string; configured: boolean }>>(
    "/ai/providers"
  );
}

// ─── Ejecución Aislada (Sandbox Runner) ──────────────────────────────────────

export interface SandboxStatusResponse {
  isDockerAvailable: boolean;
  dockerVersion?: string | undefined;
  activeContainersCount: number;
  message: string;
}

export interface ExecutionResultResponse {
  executionId: string;
  projectId: string;
  command: string;
  exitCode: number | null;
  stdout: string;
  stderr: string;
  durationMs: number;
  status: "COMPLETED" | "FAILED" | "TIMEOUT" | "CANCELLED";
  startedAt: string;
  completedAt: string;
}

export async function fetchSandboxStatus(): Promise<SandboxStatusResponse> {
  return request<SandboxStatusResponse>("/runner/status");
}

export async function executeSandboxCommand(
  projectId: string,
  command: string,
  timeoutMs = 30000
): Promise<ExecutionResultResponse> {
  return request<ExecutionResultResponse>("/runner/execute", {
    method: "POST",
    body: JSON.stringify({ projectId, command, timeoutMs }),
  });
}

export async function cancelSandboxExecution(
  executionId: string
): Promise<{ cancelled: boolean }> {
  return request<{ cancelled: boolean }>(`/runner/cancel/${executionId}`, {
    method: "POST",
  });
}


