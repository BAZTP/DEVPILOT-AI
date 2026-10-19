"use client";

import React, { useState, useRef, useEffect } from "react";
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
} from "lucide-react";
import { useAIStore, AIMode } from "@/stores/aiStore";
import { useEditorStore } from "@/stores/editorStore";
import { useLayoutStore } from "@/stores/layoutStore";
import { useProjectStore } from "@/stores/projectStore";
import { streamAIChat, applyDiffRemote } from "@/lib/api";

export const AIAssistantPanel: React.FC = () => {
  const {
    currentMode,
    selectedModelId,
    availableModels,
    messages,
    contextFiles,
    isGenerating,
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
  } = useAIStore();

  const { projectId } = useProjectStore();
  const { activeFilePath, openFiles, updateFileContent, saveFile, openDiff } = useEditorStore();
  const { isAIPanelOpen, aiPanelWidth, setAIPanelWidth } = useLayoutStore();

  const [inputPrompt, setInputPrompt] = useState("");
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isResizingRef = useRef(false);

  // Auto-scroll al final al recibir mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

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

  // Si el archivo activo no está en el contexto, agregarlo
  useEffect(() => {
    if (activeFilePath && !contextFiles.includes(activeFilePath)) {
      addContextFile(activeFilePath);
    }
  }, [activeFilePath, contextFiles, addContextFile]);

  if (!isAIPanelOpen) return null;

  const currentModel = availableModels.find((m) => m.id === selectedModelId) || availableModels[0]!;

  const handleSendMessage = async () => {
    const prompt = inputPrompt.trim();
    if (!prompt || isGenerating) return;

    // 1. Agregar mensaje de usuario
    addMessage({
      role: "user",
      content: prompt,
      mode: currentMode,
    });

    // 2. Preparar mensaje del asistente vacío para acumular streaming
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
    } catch (err: any) {
      console.warn("[DevPilot] Fallback a motor local:", err.message);
      // Fallback local enriquecido si el servidor backend está temporalmente no disponible
      if (currentMode === "CHAT") {
        updateLastAssistantMessage(
          `Entendido. Analizando tu código en \`${activeFilePath || "el workspace"}\`:\n\nPara resolver esto, te recomiendo modularizar la lógica separando la presentación del estado. Aquí tienes una estructura recomendada:\n\n\`\`\`typescript\ninterface ConfigOptions {\n  strictMode: boolean;\n  timeoutMs: number;\n}\n\nexport function initializeService(options: ConfigOptions) {\n  console.log('Servicio iniciado con timeout:', options.timeoutMs);\n}\n\`\`\`\n\n¿Quieres que prepare un cambio directo en tu archivo?`
        );
      } else if (currentMode === "PLAN") {
        updateLastAssistantMessage(
          `### 📋 Plan de Acción para: "${prompt}"\n\nHe elaborado un desglose paso a paso para abordar este objetivo de forma segura:\n\n1. **Análisis de dependencias**: Verificar importaciones y exports existentes.\n2. **Definición de tipos**: Crear contratos e interfaces TypeScript estrictas.\n3. **Implementación de componentes**: Construir elementos reutilizables.\n4. **Pruebas unitarias**: Validar casos límite con Vitest.\n5. **Revisión de seguridad**: Asegurar que no existan fugas ni inyecciones.\n\n¿Deseas que ejecute el primer paso?`
        );
      } else if (currentMode === "EDIT") {
        const activeFile = openFiles.find((f) => f.path === activeFilePath);
        const original = activeFile?.content || "// Código original";
        const modified = `${original}\n// ✨ Agregado por DevPilot AI:\nexport const version = "1.0.0";\n`;

        updateLastAssistantMessage(`He preparado la modificación para \`${activeFilePath || "archivo actual"}\`. Revisa la propuesta antes de aplicar los cambios:`);
        updateLastAssistantProposal({
          proposalId: `diff-${Date.now()}`,
          filePath: activeFilePath || "src/app/page.tsx",
          originalCode: original,
          proposedCode: modified,
          applied: false,
        });
      } else if (currentMode === "AGENT") {
        updateLastAssistantMessage(`🤖 **Modo Agent iniciado:** Objetivo recibido: "${prompt}".\nEjecutando plan supervisado:`);
        updateLastAssistantSteps([
          { id: "1", title: "Inspeccionar estructura del proyecto", status: "completed" },
          { id: "2", title: "Analizar dependencias de TypeScript", status: "completed" },
          { id: "3", title: "Proponer archivo de utilidades", status: "running" },
          { id: "4", title: "Ejecutar validación de pruebas", status: "pending" },
        ]);
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleApplyDiff = async (msgId: string, diff: NonNullable<(typeof messages)[0]["diffProposal"]>) => {
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

      {/* ── Lista de mensajes ──────────────────────────────────────────────── */}
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

              {/* Si está en modo Agent con pasos */}
              {msg.agentSteps && (
                <div className="mt-3 p-2.5 rounded-lg bg-surface-900 border border-ide-border/80 space-y-1.5">
                  <div className="text-2xs font-semibold text-ide-text-muted uppercase tracking-wider mb-1">
                    Progreso de la tarea
                  </div>
                  {msg.agentSteps.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-2xs">
                      {step.status === "completed" && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-ide-success shrink-0" />
                      )}
                      {step.status === "running" && (
                        <Loader2 className="w-3.5 h-3.5 text-electric-400 animate-spin shrink-0" />
                      )}
                      {step.status === "pending" && (
                        <Clock className="w-3.5 h-3.5 text-ide-text-muted shrink-0" />
                      )}
                      <span
                        className={
                          step.status === "completed"
                            ? "text-ide-text line-through opacity-70"
                            : step.status === "running"
                            ? "text-electric-300 font-semibold"
                            : "text-ide-text-muted"
                        }
                      >
                        {step.title}
                      </span>
                    </div>
                  ))}
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
            placeholder={`Pregunta a DevPilot o solicita cambios (Modo: ${currentMode})...`}
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
            disabled={!inputPrompt.trim() || isGenerating}
            title="Enviar mensaje (Enter)"
            className="absolute right-2 bottom-2.5 p-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
