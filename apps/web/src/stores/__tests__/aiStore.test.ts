import { describe, it, expect, beforeEach } from "vitest";
import { useAIStore } from "../aiStore";

describe("AIStore (Zustand)", () => {
  beforeEach(() => {
    useAIStore.getState().clearMessages();
    useAIStore.getState().setMode("CHAT");
    useAIStore.getState().setActiveAgentTask(null);
  });

  it("debe inicializarse en modo CHAT con mensajes de bienvenida", () => {
    const state = useAIStore.getState();
    expect(state.currentMode).toBe("CHAT");
    expect(state.messages.length).toBeGreaterThan(0);
    expect(state.messages[0]?.role).toBe("assistant");
  });

  it("debe permitir cambiar de modo entre CHAT, PLAN, EDIT y AGENT", () => {
    const store = useAIStore.getState();
    store.setMode("AGENT");
    expect(useAIStore.getState().currentMode).toBe("AGENT");

    store.setMode("EDIT");
    expect(useAIStore.getState().currentMode).toBe("EDIT");

    store.setMode("PLAN");
    expect(useAIStore.getState().currentMode).toBe("PLAN");
  });

  it("debe agregar mensajes y acumular chunks de streaming", () => {
    const store = useAIStore.getState();
    store.addMessage({
      role: "user",
      content: "¿Cómo crear un endpoint en NestJS?",
    });

    store.addMessage({
      role: "assistant",
      content: "",
    });

    store.updateLastAssistantMessage("Para crear ");
    store.updateLastAssistantMessage("un endpoint...");

    const msgs = useAIStore.getState().messages;
    const lastMsg = msgs[msgs.length - 1];
    expect(lastMsg?.content).toBe("Para crear un endpoint...");
  });

  it("debe actualizar el estado de pasos del agente autónomo supervisado", () => {
    const store = useAIStore.getState();
    store.setActiveAgentTask({
      id: "task-test-1",
      projectId: "project-1",
      title: "Crear pruebas unitarias",
      objective: "Generar suite de Vitest",
      mode: "AGENT",
      status: "RUNNING",
      steps: [
        {
          id: "step-1",
          stepNumber: 1,
          title: "Inspeccionar proyecto",
          description: "Leer archivos fuente",
          toolName: "read_file",
          requiresApproval: false,
          status: "PENDING",
        },
        {
          id: "step-2",
          stepNumber: 2,
          title: "Ejecutar pruebas",
          description: "Correr vitest en sandbox",
          toolName: "execute_sandbox",
          requiresApproval: false,
          status: "PENDING",
        },
      ],
      currentStepIndex: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    expect(useAIStore.getState().activeAgentTask?.steps[0]?.status).toBe("PENDING");

    store.updateAgentStep("step-1", { status: "COMPLETED" });
    expect(useAIStore.getState().activeAgentTask?.steps[0]?.status).toBe("COMPLETED");

    store.updateAgentStep("step-2", { status: "AWAITING_APPROVAL" });
    expect(useAIStore.getState().activeAgentTask?.steps[1]?.status).toBe("AWAITING_APPROVAL");
  });
});
