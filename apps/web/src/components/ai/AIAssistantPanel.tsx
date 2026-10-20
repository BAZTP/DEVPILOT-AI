"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Sparkles,
  Send,
  Cpu,
  Bot,
  User,
  GitCompare,
  Check,
  X,
  FileCode,
  ListTodo,
  Layers,
  ChevronDown,
  Trash2,
  Copy,
  Plus,
  Play,
  CheckCircle2,
  Clock,
  Loader2,
  ShieldAlert,
  AlertTriangle,
  StopCircle,
  Terminal,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { useAIStore, AIMode } from "@/stores/aiStore";
import { useEditorStore } from "@/stores/editorStore";
import { useLayoutStore } from "@/stores/layoutStore";
import { useProjectStore } from "@/stores/projectStore";
import {
  streamAIChat,
  applyDiffRemote,
  startAgentTaskRemote,
  approveAgentStepRemote,
  rejectAgentStepRemote,
  cancelAgentTaskRemote,
  streamAgentEventsRemote,
  AgentTaskDataDto,
  AgentStepPlanDto,
  AgentEventMessageDto,
} from "@/lib/api";

export const AIAssistantPanel: React.FC = () => {
  const {
    currentMode,
    selectedModelId,
    availableModels,
    messages,
    contextFiles,
    isGenerating,
    activeAgentTask,
    isAgentRunning,
    setMode,
    setModel,
    addMessage,
    updateLastAssistantMessage,
    updateLastAssistantProposal,
    updateLastAssistantSteps,
    setGenerating,
    removeContextFile,
    addContextFile,
    clearMessages,
    applyDiffProposal,
    setActiveAgentTask,
    updateAgentStep,
    setAgentRunning,
  } = useAIStore();

  const { projectId } = useProjectStore();
  const { activeFilePath, openFiles, updateFileContent, saveFile, openDiff } = useEditorStore();
  const { isAIPanelOpen, aiPanelWidth, setAIPanelWidth } = useLayoutStore();

  const [inputPrompt, setInputPrompt] = useState("");
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [activeSandboxLog, setActiveSandboxLog] = useState<{
    cmd: string;
    stdout: string;
    stderr: string;
    exitCode: number;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isResizingRef = useRef(false);
  const unsubscribeAgentStreamRef = useRef<(() => void) | null>(null);

  // Auto-scroll al final al recibir mensajes o tareas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating, activeAgentTask]);

  // Manejador de redimensionamiento
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return;
      const newWidth = window.innerWidth - e.clientX;
      setAIPanelWidth(newWidth);
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [setAIPanelWidth]);

  // Limpiar suscripción SSE de agente al desmontar
  useEffect(() => {
    return () => {
      if (unsubscribeAgentStreamRef.current) {
        unsubscribeAgentStreamRef.current();
      }
    };
  }, []);

  // Agregar archivo activo al contexto automáticamente
  useEffect(() => {
    if (activeFilePath && !contextFiles.includes(activeFilePath)) {
      addContextFile(activeFilePath);
    }
  }, [activeFilePath, contextFiles, addContextFile]);

  if (!isAIPanelOpen) return null;

  const currentModel = availableModels.find((m) => m.id === selectedModelId) || availableModels[0]!;

  // ── Iniciar Misión en Modo Agente Autónomo Supervisado ──────────────────────
  const handleStartAgentTask = async () => {
    const objective = inputPrompt.trim();
    if (!objective || isAgentRunning) return;

    setInputPrompt("");
    setAgentRunning(true);
    setActiveSandboxLog(null);

    try {
      const task = await startAgentTaskRemote(
        projectId || "devpilot-demo-app",
        objective,
        currentMode === "PLAN" ? "PLAN" : "AGENT",
        false
      );

      setActiveAgentTask(task);

      // Suscribirse al stream SSE para recibir progreso y validaciones en tiempo real
      if (unsubscribeAgentStreamRef.current) {
        unsubscribeAgentStreamRef.current();
      }

      unsubscribeAgentStreamRef.current = streamAgentEventsRemote(
        task.id,
        (event: AgentEventMessageDto) => {
          if (event.type === "step_started" && event.stepId) {
            updateAgentStep(event.stepId, { status: "RUNNING" });
          } else if (event.type === "step_awaiting_approval" && event.stepId) {
            updateAgentStep(event.stepId, {
              status: "AWAITING_APPROVAL",
              approvalReason: event.data?.reason,
            });
          } else if (event.type === "step_approved" && event.stepId) {
            updateAgentStep(event.stepId, { status: "RUNNING" });
          } else if (event.type === "step_completed" && event.stepId) {
            updateAgentStep(event.stepId, { status: "COMPLETED", output: event.data?.output });
          } else if (event.type === "step_failed" && event.stepId) {
            updateAgentStep(event.stepId, { status: "FAILED", error: event.message });
          } else if (event.type === "sandbox_output" && event.data) {
            setActiveSandboxLog({
              cmd: event.data.command || "Validación de pruebas",
              stdout: event.data.stdout || "",
              stderr: event.data.stderr || "",
              exitCode: event.data.exitCode ?? 0,
            });
          } else if (event.type === "task_completed") {
            setAgentRunning(false);
            setActiveAgentTask({
              ...task,
              status: "COMPLETED",
              summary: event.data?.summary || "Misión completada con éxito.",
            });
          } else if (event.type === "task_cancelled") {
            setAgentRunning(false);
            setActiveAgentTask({
              ...task,
              status: "CANCELLED",
              summary: "La misión fue detenida por el usuario.",
            });
          }
        },
        (err) => {
          console.warn("[DevPilot Agent Stream Error]", err);
        }
      );
    } catch (err: any) {
      console.error("Error al iniciar agente:", err);
      setAgentRunning(false);
    }
  };

  // ── Aprobar paso pendiente (Human-in-the-Loop) ──────────────────────────────
  const handleApproveStep = async (stepId: string) => {
    if (!activeAgentTask) return;
    try {
      await approveAgentStepRemote(activeAgentTask.id, stepId, true);
      updateAgentStep(stepId, { status: "RUNNING" });
    } catch (err) {
      console.error("Error al aprobar paso:", err);
    }
  };

  // ── Rechazar paso pendiente ─────────────────────────────────────────────────
  const handleRejectStep = async (stepId: string) => {
    if (!activeAgentTask) return;
    try {
      await rejectAgentStepRemote(activeAgentTask.id, stepId, "Rechazado por el usuario.");
      updateAgentStep(stepId, { status: "SKIPPED" });
    } catch (err) {
      console.error("Error al rechazar paso:", err);
    }
  };

  // ── Cancelar tarea activa del agente ─────────────────────────────────────────
  const handleCancelTask = async () => {
    if (!activeAgentTask) return;
    try {
      await cancelAgentTaskRemote(activeAgentTask.id);
      setAgentRunning(false);
      setActiveAgentTask({
        ...activeAgentTask,
        status: "CANCELLED",
      });
    } catch (err) {
      console.error("Error al cancelar agente:", err);
    }
  };

  // ── Flujo estándar de Chat / Plan / Edit ──────────────────────────────────────
  const handleSendMessage = async () => {
    if (currentMode === "AGENT") {
      handleStartAgentTask();
      return;
    }

    const prompt = inputPrompt.trim();
    if (!prompt || isGenerating) return;

    addMessage({
      role: "user",
      content: prompt,
      mode: currentMode,
    });

    addMessage({
      role: "assistant",
      content: "",
      mode: currentMode,
    });

    setInputPrompt("");
    setGenerating(true);

    try {
      await streamAIChat(
        {
          projectId: projectId || "devpilot-demo-app",
          prompt,
          mode: currentMode,
          modelId: selectedModelId,
          activeFilePath: activeFilePath || undefined,
          contextFiles,
          history: messages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
        },
        (chunk) => {
          if (chunk.type === "token" && chunk.content) {
            updateLastAssistantMessage(chunk.content);
          } else if (chunk.type === "diff_proposal" && chunk.data) {
            updateLastAssistantProposal({
              proposalId: chunk.data.proposalId,
              filePath: chunk.data.filePath,
              originalCode: chunk.data.originalCode,
              proposedCode: chunk.data.proposedCode,
              description: chunk.data.description,
              applied: false,
            });
          } else if (chunk.type === "agent_step" && chunk.data) {
            updateLastAssistantSteps(chunk.data);
          }
        }
      );
    } catch {
      updateLastAssistantMessage(
        `He analizado tu solicitud. ¿Deseas que formulemos los cambios directamente en ${
          activeFilePath || "el proyecto"
        }?`
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleApplyDiff = async (
    msgId: string,
    diff: NonNullable<(typeof messages)[0]["diffProposal"]>
  ) => {
    updateFileContent(diff.filePath, diff.proposedCode);
    saveFile(diff.filePath);
    applyDiffProposal(msgId);

    if (diff.proposalId && projectId) {
      applyDiffRemote(projectId, diff.proposalId).catch(() => {});
    }
  };

  const handleViewDiff = (diff: NonNullable<(typeof messages)[0]["diffProposal"]>) => {
    openDiff(diff.filePath, diff.originalCode, diff.proposedCode, `Propuesta IA: ${diff.filePath}`);
  };

  return (
    <aside
      style={{ width: `${aiPanelWidth}px` }}
      className="h-full bg-ide-panel border-l border-ide-border flex flex-col relative select-none shrink-0 z-20 text-xs"
    >
      {/* ── Manija de redimensionamiento izquierdo ─────────────────────────── */}
      <div
        onMouseDown={(e) => {
          e.preventDefault();
          isResizingRef.current = true;
          document.body.style.cursor = "col-resize";
          document.body.style.userSelect = "none";
        }}
        className="absolute top-0 left-0 bottom-0 w-1 cursor-col-resize hover:bg-violet-500/50 transition-colors z-30"
      />

      {/* ── Encabezado: Selector de Modelo y Acciones ──────────────────────── */}
      <div className="h-11 px-3 border-b border-ide-border flex items-center justify-between bg-ide-sidebar">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gradient-to-tr from-violet-600 to-electric-500 flex items-center justify-center text-white">
            <Sparkles className="w-3 h-3" />
          </div>
          <span className="font-semibold text-ide-text">DevPilot Assistant</span>
        </div>

        {/* Selector de modelo */}
        <div className="relative">
          <button
            onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
            className="flex items-center gap-1.5 px-2 py-1 rounded bg-surface-800 border border-ide-border text-ide-text hover:bg-surface-700 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-ide-success" />
            <span className="text-2xs font-medium truncate max-w-[110px]">
              {currentModel.name}
            </span>
            <ChevronDown className="w-3 h-3 text-ide-text-muted" />
          </button>

          {isModelDropdownOpen && (
            <div
              className="absolute right-0 top-full mt-1 w-64 bg-ide-panel border border-ide-border rounded-lg shadow-2xl py-1 z-50 animate-fade-in"
              onMouseLeave={() => setIsModelDropdownOpen(false)}
            >
              <div className="px-3 py-1.5 text-2xs font-semibold text-ide-text-muted uppercase tracking-wider">
                Modelos de IA Disponibles
              </div>
              {availableModels.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    setModel(model.id);
                    setIsModelDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-surface-800 text-left text-ide-text transition-colors"
                >
                  <div>
                    <div className="font-medium text-xs">{model.name}</div>
                    <div className="text-[10px] text-ide-text-muted">{model.contextWindow}</div>
                  </div>
                  {selectedModelId === model.id && (
                    <Check className="w-3.5 h-3.5 text-violet-400" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Limpiar chat */}
        <button
          onClick={clearMessages}
          title="Limpiar conversación"
          className="p-1 rounded text-ide-text-muted hover:text-ide-text hover:bg-surface-800"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── Selector de Modo: Chat | Plan | Edit | Agent ───────────────────── */}
      <div className="px-3 py-2 border-b border-ide-border bg-surface-900/40 flex items-center gap-1">
        {(["CHAT", "PLAN", "EDIT", "AGENT"] as AIMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setMode(mode)}
            className={`flex-1 py-1 rounded text-2xs font-medium transition-colors ${
              currentMode === mode
                ? "bg-violet-600/25 text-violet-300 border border-violet-500/40 shadow-sm"
                : "text-ide-text-muted hover:text-ide-text hover:bg-surface-800/40"
            }`}
          >
            {mode === "CHAT" && "Chat"}
            {mode === "PLAN" && "Plan"}
            {mode === "EDIT" && "Edit"}
            {mode === "AGENT" && "Agent"}
          </button>
        ))}
      </div>

      {/* ── Barra de contexto de archivos ──────────────────────────────────── */}
      <div className="px-3 py-1.5 border-b border-ide-border bg-surface-950/60 flex items-center gap-1.5 overflow-x-auto scrollbar-hide text-[11px]">
        <span className="text-ide-text-muted font-mono shrink-0">Contexto:</span>
        {contextFiles.map((f) => (
          <div
            key={f}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface-800 text-ide-text font-mono border border-ide-border shrink-0"
          >
            <FileCode className="w-3 h-3 text-electric-400" />
            <span className="truncate max-w-[120px]">{f.split("/").pop()}</span>
            <button
              onClick={() => removeContextFile(f)}
              title="Quitar de contexto"
              className="text-ide-text-muted hover:text-ide-text"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
        ))}
      </div>

      {/* ── Vista de Modo AGENTE AUTÓNOMO SUPERVISADO ──────────────────────── */}
      {currentMode === "AGENT" && activeAgentTask ? (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Tarjeta de Encabezado de la Misión */}
          <div className="p-3 rounded-xl bg-surface-850 border border-ide-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-semibold text-violet-400 uppercase tracking-wider flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5" />
                Misión del Agente
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                  activeAgentTask.steps.some((s) => s.status === "AWAITING_APPROVAL") || activeAgentTask.status === "PAUSED"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse"
                    : activeAgentTask.status === "RUNNING"
                    ? "bg-electric-500/20 text-electric-400 border border-electric-500/30"
                    : activeAgentTask.status === "COMPLETED"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                }`}
              >
                {activeAgentTask.steps.some((s) => s.status === "AWAITING_APPROVAL")
                  ? "AWAITING_APPROVAL"
                  : activeAgentTask.status}
              </span>
            </div>

            <p className="text-xs font-medium text-ide-text">{activeAgentTask.objective}</p>

            <div className="flex items-center justify-between text-2xs text-ide-text-muted pt-1">
              <span>{activeAgentTask.steps.length} pasos programados</span>
              {isAgentRunning && (
                <button
                  onClick={handleCancelTask}
                  className="flex items-center gap-1 text-red-400 hover:text-red-300 text-2xs py-0.5 px-2 rounded bg-red-950/40 border border-red-800/40"
                >
                  <StopCircle className="w-3 h-3" />
                  Detener Agente
                </button>
              )}
            </div>
          </div>

          {/* Tarjeta de Aprobación Humana (Human-in-the-Loop) */}
          {activeAgentTask.steps.some((s) => s.status === "AWAITING_APPROVAL") && (
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 space-y-2 animate-fade-in">
              {activeAgentTask.steps
                .filter((s) => s.status === "AWAITING_APPROVAL")
                .map((step) => (
                  <div key={step.id} className="space-y-2">
                    <div className="flex items-start gap-2 text-amber-300">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                      <div>
                        <span className="font-semibold text-2xs uppercase tracking-wide">
                          Paso {step.stepNumber}: Autorización Requerida
                        </span>
                        <p className="text-xs text-ide-text mt-0.5">{step.title}</p>
                        {step.approvalReason && (
                          <p className="text-2xs text-amber-300/80 mt-1 italic">
                            {step.approvalReason}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleApproveStep(step.id)}
                        className="ide-btn-primary flex-1 py-1.5 text-2xs flex items-center justify-center gap-1 bg-amber-600 hover:bg-amber-500 border-amber-400 text-white"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Aprobar y Continuar
                      </button>
                      <button
                        onClick={() => handleRejectStep(step.id)}
                        className="ide-btn-secondary py-1.5 px-3 text-2xs flex items-center justify-center gap-1 hover:text-red-400"
                      >
                        <X className="w-3.5 h-3.5" />
                        Rechazar
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Checklist interactivo de pasos */}
          <div className="p-3 rounded-xl bg-surface-850 border border-ide-border space-y-2">
            <div className="text-2xs font-semibold text-ide-text-muted uppercase tracking-wider mb-2">
              Plan de Ejecución Supervisado
            </div>

            <div className="space-y-2">
              {activeAgentTask.steps.map((step) => (
                <div
                  key={step.id}
                  className={`p-2 rounded-lg border text-xs transition-colors ${
                    step.status === "RUNNING"
                      ? "bg-electric-950/40 border-electric-500/40 text-electric-200"
                      : step.status === "AWAITING_APPROVAL"
                      ? "bg-amber-950/30 border-amber-500/30 text-amber-200"
                      : step.status === "COMPLETED"
                      ? "bg-surface-900 border-ide-border/60 text-ide-text"
                      : "bg-surface-900/50 border-ide-border/40 text-ide-text-muted"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {step.status === "COMPLETED" && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    {step.status === "RUNNING" && (
                      <Loader2 className="w-4 h-4 text-electric-400 animate-spin shrink-0" />
                    )}
                    {step.status === "AWAITING_APPROVAL" && (
                      <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
                    )}
                    {step.status === "FAILED" && (
                      <X className="w-4 h-4 text-red-400 shrink-0" />
                    )}
                    {step.status === "PENDING" && (
                      <Clock className="w-4 h-4 text-ide-text-muted shrink-0" />
                    )}
                    {step.status === "SKIPPED" && (
                      <span className="w-4 h-4 rounded-full border border-ide-text-muted flex items-center justify-center text-[9px] text-ide-text-muted">
                        -
                      </span>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-2xs truncate">
                        {step.stepNumber}. {step.title}
                      </div>
                      <div className="text-[11px] text-ide-text-muted truncate">
                        {step.description}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tarjeta de Ejecución en Sandbox Docker */}
          {activeSandboxLog && (
            <div className="p-3 rounded-xl bg-surface-950 border border-ide-border space-y-1.5 font-mono text-[11px]">
              <div className="flex items-center justify-between text-2xs text-ide-text-muted pb-1 border-b border-ide-border/60">
                <span className="flex items-center gap-1.5 text-electric-400 font-semibold">
                  <Terminal className="w-3.5 h-3.5" />
                  Salida de Sandbox Docker
                </span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded ${
                    activeSandboxLog.exitCode === 0
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                      : "bg-red-950 text-red-400 border border-red-800"
                  }`}
                >
                  Exit Code: {activeSandboxLog.exitCode}
                </span>
              </div>
              <div className="text-ide-text-muted">$ {activeSandboxLog.cmd}</div>
              {activeSandboxLog.stdout && (
                <div className="text-emerald-300 max-h-32 overflow-y-auto whitespace-pre-wrap">
                  {activeSandboxLog.stdout}
                </div>
              )}
              {activeSandboxLog.stderr && (
                <div className="text-red-400 max-h-32 overflow-y-auto whitespace-pre-wrap">
                  {activeSandboxLog.stderr}
                </div>
              )}
            </div>
          )}

          {/* Resumen Final cuando se completa */}
          {activeAgentTask.status === "COMPLETED" && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-2xs uppercase tracking-wider text-emerald-400">
                <Check className="w-3.5 h-3.5" />
                Misión Finalizada
              </div>
              <p className="text-xs text-ide-text">{activeAgentTask.summary}</p>
            </div>
          )}
        </div>
      ) : (
        /* ── Lista de mensajes del Chat estándar ────────────────────────── */
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col gap-1 ${
                msg.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div className="flex items-center gap-1.5 text-[10px] text-ide-text-muted px-1">
                {msg.role === "user" ? (
                  <>
                    <span>Tú</span>
                    <span>·</span>
                    <span>{msg.timestamp}</span>
                  </>
                ) : (
                  <>
                    <Bot className="w-3 h-3 text-violet-400" />
                    <span>DevPilot Assistant</span>
                    <span>·</span>
                    <span>{msg.timestamp}</span>
                  </>
                )}
              </div>

              <div
                className={`max-w-[92%] rounded-xl p-3 text-xs leading-relaxed ${
                  msg.role === "user"
                    ? "bg-electric-600 text-white rounded-tr-none shadow-sm"
                    : "bg-surface-850 border border-ide-border text-ide-text rounded-tl-none shadow-sm"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Si contiene propuesta de Diff */}
                {msg.diffProposal && (
                  <div className="mt-3 p-2 rounded-lg bg-surface-900 border border-ide-border/80">
                    <div className="flex items-center justify-between text-2xs font-mono text-ide-text-muted mb-2">
                      <span className="text-electric-400">{msg.diffProposal.filePath}</span>
                      <span>Modificaciones listas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDiff(msg.diffProposal!)}
                        className="ide-btn-secondary py-1 text-2xs flex-1 flex items-center justify-center gap-1"
                      >
                        <GitCompare className="w-3 h-3" />
                        <span>Ver Diferencias</span>
                      </button>
                      {msg.diffProposal.applied ? (
                        <span className="flex items-center gap-1 text-ide-success font-medium text-2xs px-2">
                          <Check className="w-3.5 h-3.5" /> Aplicado
                        </span>
                      ) : (
                        <button
                          onClick={() => handleApplyDiff(msg.id, msg.diffProposal!)}
                          className="ide-btn-primary py-1 text-2xs flex-1 flex items-center justify-center gap-1 shadow-sm"
                        >
                          <Check className="w-3 h-3" />
                          <span>Aplicar cambios</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isGenerating && (
            <div className="flex items-center gap-2 p-2 text-xs text-ide-text-muted font-mono animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400" />
              <span>DevPilot está pensando...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {/* ── Chips de prompts rápidos ───────────────────────────────────────── */}
      <div className="px-3 py-1.5 border-t border-ide-border bg-surface-900/30 flex items-center gap-1.5 overflow-x-auto scrollbar-hide text-[11px]">
        {[
          "Explicar archivo",
          "Refactorizar código",
          "Generar tests",
          "Detectar errores",
        ].map((promptText) => (
          <button
            key={promptText}
            onClick={() => setInputPrompt(promptText)}
            className="px-2 py-0.5 rounded-full bg-surface-800 text-ide-text-muted hover:text-ide-text hover:bg-surface-700 border border-ide-border shrink-0 transition-colors"
          >
            {promptText}
          </button>
        ))}
      </div>

      {/* ── Entrada de mensaje ─────────────────────────────────────────────── */}
      <div className="p-3 border-t border-ide-border bg-ide-sidebar">
        <div className="relative">
          <textarea
            rows={2}
            placeholder={
              currentMode === "AGENT"
                ? "Define el objetivo del agente autónomo supervisado (Enter)..."
                : `Pregunta a DevPilot o solicita cambios (Modo: ${currentMode})...`
            }
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="ide-input pr-10 py-2 text-xs resize-none"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputPrompt.trim() || isGenerating || isAgentRunning}
            title={
              currentMode === "AGENT"
                ? "Iniciar Misión de Agente"
                : "Enviar mensaje (Enter)"
            }
            className={`absolute right-2 bottom-2.5 p-1.5 rounded-lg disabled:opacity-40 text-white transition-colors ${
              currentMode === "AGENT"
                ? "bg-violet-600 hover:bg-violet-500"
                : "bg-electric-600 hover:bg-electric-500"
            }`}
          >
            {isAgentRunning ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};
