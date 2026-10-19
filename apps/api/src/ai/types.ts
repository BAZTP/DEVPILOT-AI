export type AIMode = "CHAT" | "PLAN" | "EDIT" | "AGENT";

export type AIProviderType = "google" | "anthropic" | "openai" | "ollama" | "local";

export interface ChatMessageDto {
  role: "user" | "assistant" | "system";
  content: string;
  name?: string | undefined;
}

export interface WorkspaceContext {
  projectId: string;
  projectName: string;
  activeFilePath?: string | undefined;
  activeFileContent?: string | undefined;
  contextFiles: Array<{ path: string; content: string }>;
  fileTreeSnippet: string;
  dependencies?: Record<string, string> | undefined;
}

export interface AIStreamChunk {
  type: "token" | "tool_call" | "tool_result" | "diff_proposal" | "agent_step" | "error" | "done";
  content?: string | undefined;
  data?: any;
}

export interface DiffProposal {
  filePath: string;
  originalCode: string;
  proposedCode: string;
  description: string;
}

export interface AgentStep {
  id: string;
  title: string;
  status: "pending" | "running" | "completed" | "failed";
  details?: string | undefined;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, { type: string; description: string }>;
    required: string[];
  };
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, any>;
}

export interface ToolResult {
  toolCallId: string;
  output: string;
  isError?: boolean | undefined;
}
