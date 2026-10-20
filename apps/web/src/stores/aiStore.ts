import { create } from "zustand";
import { AgentTaskDataDto, AgentStepPlanDto } from "@/lib/api";

export type AIMode = "CHAT" | "PLAN" | "EDIT" | "AGENT";

export interface AIModelOption {
  id: string;
  name: string;
  provider: "anthropic" | "openai" | "google" | "ollama";
  contextWindow: string;
  isConfigured: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  mode?: AIMode;
  diffProposal?: {
    proposalId?: string;
    filePath: string;
    originalCode: string;
    proposedCode: string;
    applied?: boolean;
    description?: string;
  };
  agentSteps?: Array<{
    id?: string;
    title: string;
    status: "pending" | "running" | "completed" | "failed";
  }>;
}

interface AIState {
  currentMode: AIMode;
  selectedModelId: string;
  availableModels: AIModelOption[];
  messages: ChatMessage[];
  contextFiles: string[];
  isGenerating: boolean;
  apiKeyPromptVisible: boolean;

  // Estado del Agente Autónomo Supervisado
  activeAgentTask: AgentTaskDataDto | null;
  isAgentRunning: boolean;

  // Acciones
  setMode: (mode: AIMode) => void;
  setModel: (modelId: string) => void;
  addMessage: (msg: Omit<ChatMessage, "id" | "timestamp">) => void;
  updateLastAssistantMessage: (chunk: string) => void;
  updateLastAssistantProposal: (proposal: NonNullable<ChatMessage["diffProposal"]>) => void;
  updateLastAssistantSteps: (steps: NonNullable<ChatMessage["agentSteps"]>) => void;
  setGenerating: (isGenerating: boolean) => void;
  addContextFile: (filePath: string) => void;
  removeContextFile: (filePath: string) => void;
  clearMessages: () => void;
  applyDiffProposal: (messageId: string) => void;
  setApiKeyPromptVisible: (visible: boolean) => void;
  setActiveAgentTask: (task: AgentTaskDataDto | null) => void;
  updateAgentStep: (stepId: string, partial: Partial<AgentStepPlanDto>) => void;
  setAgentRunning: (running: boolean) => void;
}

const DEFAULT_MODELS: AIModelOption[] = [
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    provider: "google",
    contextWindow: "1M tokens",
    isConfigured: true,
  },
  {
    id: "claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "anthropic",
    contextWindow: "200k tokens",
    isConfigured: true,
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    contextWindow: "128k tokens",
    isConfigured: false,
  },
  {
    id: "ollama-local",
    name: "Ollama (DeepSeek Coder / Qwen)",
    provider: "ollama",
    contextWindow: "32k tokens",
    isConfigured: true,
  },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "msg-welcome",
    role: "assistant",
    content: `👋 ¡Hola! Soy **DevPilot Assistant**, tu copiloto de ingeniería de software.\n\nPuedo ayudarte con:\n- 🔍 Explicar y documentar funciones o componentes.\n- 🛠️ Generar nuevos endpoints, componentes y tipos TypeScript.\n- ⚡ Refactorizar código para mejorar rendimiento y legibilidad.\n- 🧪 Crear suites de pruebas completas con Vitest.\n- 🤖 Ejecutar planes supervisados en modo **Agent**.\n\n¿En qué podemos trabajar hoy?`,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    mode: "CHAT",
  },
];

export const useAIStore = create<AIState>((set) => ({
  currentMode: "CHAT",
  selectedModelId: "gemini-1.5-pro",
  availableModels: DEFAULT_MODELS,
  messages: INITIAL_MESSAGES,
  contextFiles: ["src/app/page.tsx"],
  isGenerating: false,
  apiKeyPromptVisible: false,
  activeAgentTask: null,
  isAgentRunning: false,

  setMode: (mode) => set({ currentMode: mode }),
  setModel: (modelId) => set({ selectedModelId: modelId }),

  setActiveAgentTask: (task) => set({ activeAgentTask: task }),
  setAgentRunning: (running) => set({ isAgentRunning: running }),

  updateAgentStep: (stepId, partial) =>
    set((state) => {
      if (!state.activeAgentTask) return state;
      const updatedSteps = state.activeAgentTask.steps.map((s) =>
        s.id === stepId ? { ...s, ...partial } : s
      );
      return {
        activeAgentTask: {
          ...state.activeAgentTask,
          steps: updatedSteps,
        },
      };
    }),

  addMessage: (msg) => {
    const newMessage: ChatMessage = {
      ...msg,
      id: `msg-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    set((state) => ({ messages: [...state.messages, newMessage] }));
  },

  updateLastAssistantMessage: (chunk) => {
    set((state) => {
      const msgs = [...state.messages];
      const last = msgs[msgs.length - 1];
      if (last && last.role === "assistant") {
        last.content += chunk;
      }
      return { messages: msgs };
    });
  },

  updateLastAssistantProposal: (proposal) => {
    set((state) => {
      const msgs = [...state.messages];
      const last = msgs[msgs.length - 1];
      if (last && last.role === "assistant") {
        last.diffProposal = proposal;
      }
      return { messages: msgs };
    });
  },

  updateLastAssistantSteps: (steps) => {
    set((state) => {
      const msgs = [...state.messages];
      const last = msgs[msgs.length - 1];
      if (last && last.role === "assistant") {
        last.agentSteps = steps;
      }
      return { messages: msgs };
    });
  },

  setGenerating: (isGenerating) => set({ isGenerating }),

  addContextFile: (filePath) =>
    set((state) => {
      if (state.contextFiles.includes(filePath)) return state;
      return { contextFiles: [...state.contextFiles, filePath] };
    }),

  removeContextFile: (filePath) =>
    set((state) => ({
      contextFiles: state.contextFiles.filter((f) => f !== filePath),
    })),

  clearMessages: () => set({ messages: INITIAL_MESSAGES }),

  applyDiffProposal: (messageId) => {
    set((state) => ({
      messages: state.messages.map((m) => {
        if (m.id === messageId && m.diffProposal) {
          return {
            ...m,
            diffProposal: { ...m.diffProposal, applied: true },
          };
        }
        return m;
      }),
    }));
  },

  setApiKeyPromptVisible: (visible) => set({ apiKeyPromptVisible: visible }),
}));
