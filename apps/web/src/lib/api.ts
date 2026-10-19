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
