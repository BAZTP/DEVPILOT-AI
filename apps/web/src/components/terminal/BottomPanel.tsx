"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Terminal as TerminalIcon,
  FileText,
  AlertCircle,
  CheckCircle,
  Activity,
  X,
  Maximize2,
  Trash2,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { useLayoutStore, BottomTab } from "@/stores/layoutStore";
import { useTerminalStore } from "@/stores/terminalStore";
import { useEditorStore } from "@/stores/editorStore";

export const BottomPanel: React.FC = () => {
  const {
    isBottomPanelOpen,
    activeBottomTab,
    setActiveBottomTab,
    toggleBottomPanel,
    bottomPanelHeight,
    setBottomPanelHeight,
  } = useLayoutStore();

  const {
    history,
    problems,
    testResults,
    outputLogs,
    clearHistory,
    runCommand,
    runTests,
  } = useTerminalStore();

  const { openFile } = useEditorStore();

  const [commandInput, setCommandInput] = useState("");
  const terminalBottomRef = useRef<HTMLDivElement>(null);
  const isResizingRef = useRef(false);

  // Auto-scroll en la terminal
  useEffect(() => {
    if (activeBottomTab === "terminal") {
      terminalBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [history, activeBottomTab]);

  // Manejador de redimensionamiento vertical
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return;
      const newHeight = window.innerHeight - e.clientY - 24; // restar statusbar
      setBottomPanelHeight(newHeight);
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
  }, [setBottomPanelHeight]);

  if (!isBottomPanelOpen) return null;

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;
    runCommand(commandInput);
    setCommandInput("");
  };

  const tabs: Array<{ id: BottomTab; label: string; icon: React.ComponentType<{ className?: string }>; count?: number | undefined }> = [
    { id: "terminal", label: "Terminal", icon: TerminalIcon },
    { id: "output", label: "Salida", icon: FileText },
    { id: "problems", label: "Problemas", icon: AlertCircle, count: problems.length },
    { id: "tests", label: "Pruebas", icon: CheckCircle, count: testResults.total },
    { id: "logs", label: "Registros", icon: Activity },
  ];

  return (
    <div
      style={{ height: `${bottomPanelHeight}px` }}
      className="bg-ide-panel border-t border-ide-border flex flex-col relative select-none shrink-0 z-20 text-xs"
    >
      {/* ── Manija de redimensionamiento superior ─────────────────────────── */}
      <div
        onMouseDown={(e) => {
          e.preventDefault();
          isResizingRef.current = true;
          document.body.style.cursor = "row-resize";
          document.body.style.userSelect = "none";
        }}
        className="absolute top-0 left-0 right-0 h-1 cursor-row-resize hover:bg-electric-500/50 transition-colors z-30"
      />

      {/* ── Barra de pestañas del panel inferior ──────────────────────────── */}
      <div className="h-8 bg-ide-sidebar border-b border-ide-border flex items-center justify-between px-3">
        <div className="flex items-center gap-1 h-full">
          {tabs.map((tab) => {
            const isActive = activeBottomTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveBottomTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 h-full border-b-2 font-medium transition-colors ${
                  isActive
                    ? "border-electric-500 text-ide-text bg-ide-panel"
                    : "border-transparent text-ide-text-muted hover:text-ide-text"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`px-1 rounded-full text-[10px] font-mono leading-none py-0.5 ${
                      tab.id === "problems"
                        ? "bg-ide-warning/20 text-ide-warning"
                        : "bg-surface-700 text-ide-text-muted"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Acciones del panel */}
        <div className="flex items-center gap-1 text-ide-text-muted">
          {activeBottomTab === "terminal" && (
            <button
              onClick={clearHistory}
              title="Limpiar terminal"
              className="p-1 rounded hover:bg-surface-800 hover:text-ide-text"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {activeBottomTab === "tests" && (
            <button
              onClick={runTests}
              title="Reejecutar pruebas"
              className="p-1 rounded hover:bg-surface-800 hover:text-ide-text"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={toggleBottomPanel}
            title="Cerrar panel"
            className="p-1 rounded hover:bg-surface-800 hover:text-ide-text ml-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Contenido según la pestaña activa ──────────────────────────────── */}
      <div className="flex-1 overflow-hidden p-2 font-mono text-xs">
        {/* Vista: Terminal */}
        {activeBottomTab === "terminal" && (
          <div className="h-full flex flex-col justify-between overflow-y-auto">
            <div className="space-y-1">
              {history.map((entry) => (
                <div key={entry.id} className="leading-relaxed">
                  {entry.type === "command" && (
                    <div className="flex items-center gap-1.5 text-ide-text">
                      <span className="text-electric-400 select-none">devpilot:~$</span>
                      <span>{entry.text}</span>
                    </div>
                  )}
                  {entry.type === "output" && (
                    <pre className="text-ide-text-muted whitespace-pre-wrap pl-3">
                      {entry.text}
                    </pre>
                  )}
                  {entry.type === "error" && (
                    <pre className="text-ide-error whitespace-pre-wrap pl-3 font-semibold">
                      {entry.text}
                    </pre>
                  )}
                  {entry.type === "success" && (
                    <pre className="text-ide-success whitespace-pre-wrap pl-3">
                      {entry.text}
                    </pre>
                  )}
                  {entry.type === "info" && (
                    <pre className="text-violet-400 whitespace-pre-wrap pl-3">
                      {entry.text}
                    </pre>
                  )}
                </div>
              ))}
              <div ref={terminalBottomRef} />
            </div>

            {/* Input de comandos */}
            <form onSubmit={handleCommandSubmit} className="mt-2 flex items-center gap-1.5 pt-1 border-t border-ide-border/40">
              <span className="text-electric-400 select-none font-bold">devpilot:~$</span>
              <input
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                placeholder="Escribe un comando (ej. 'help', 'pnpm test', 'ls')..."
                className="bg-transparent border-none text-ide-text text-xs font-mono outline-none flex-1"
                autoFocus
              />
            </form>
          </div>
        )}

        {/* Vista: Salida */}
        {activeBottomTab === "output" && (
          <div className="h-full overflow-y-auto space-y-1 text-ide-text-muted">
            {outputLogs.map((log, idx) => (
              <div key={idx} className="leading-5">
                {log}
              </div>
            ))}
          </div>
        )}

        {/* Vista: Problemas */}
        {activeBottomTab === "problems" && (
          <div className="h-full overflow-y-auto divide-y divide-ide-border/30">
            {problems.length === 0 ? (
              <div className="flex items-center gap-2 p-4 text-ide-success">
                <CheckCircle className="w-4 h-4" />
                <span>No se detectaron problemas ni errores en el workspace.</span>
              </div>
            ) : (
              problems.map((prob) => (
                <div
                  key={prob.id}
                  onClick={() => {
                    openFile({
                      path: prob.file,
                      name: prob.file.split("/").pop() || prob.file,
                      content: "// Cargando archivo...",
                    });
                  }}
                  className="py-1.5 px-2 hover:bg-surface-800/60 rounded flex items-start gap-2 cursor-pointer transition-colors"
                >
                  <AlertCircle
                    className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                      prob.severity === "error" ? "text-ide-error" : "text-ide-warning"
                    }`}
                  />
                  <div className="flex-1">
                    <div className="text-ide-text">{prob.message}</div>
                    <div className="text-[10px] text-ide-text-muted">
                      {prob.file} [{prob.line}, {prob.column}] · {prob.source}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Vista: Pruebas */}
        {activeBottomTab === "tests" && (
          <div className="h-full overflow-y-auto space-y-3 font-sans">
            <div className="flex items-center justify-between pb-2 border-b border-ide-border">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-ide-text">Resultados de Vitest</span>
                <span className="text-ide-success text-xs font-mono">
                  {testResults.passed} pasadas
                </span>
                {testResults.failed > 0 && (
                  <span className="text-ide-error text-xs font-mono">
                    {testResults.failed} fallidas
                  </span>
                )}
                <span className="text-ide-text-muted text-xs font-mono">
                  {testResults.durationMs}ms
                </span>
              </div>
              <button
                onClick={runTests}
                disabled={testResults.isRunning}
                className="ide-btn-primary px-2.5 py-1 text-2xs flex items-center gap-1"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{testResults.isRunning ? "Ejecutando..." : "Ejecutar Todo"}</span>
              </button>
            </div>

            <div className="space-y-2">
              {testResults.suites.map((suite, idx) => (
                <div key={idx} className="rounded border border-ide-border bg-surface-900/40 p-2 text-xs">
                  <div className="flex items-center justify-between font-mono font-medium mb-1">
                    <div className="flex items-center gap-1.5">
                      {suite.status === "passed" ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-ide-success" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-ide-error" />
                      )}
                      <span className="text-ide-text">{suite.name}</span>
                    </div>
                    <span className="text-ide-text-muted text-2xs">{suite.duration}ms</span>
                  </div>

                  <div className="pl-5 space-y-1 mt-1 font-mono text-[11px] text-ide-text-muted">
                    {suite.tests.map((t, tidx) => (
                      <div key={tidx} className="flex items-center justify-between">
                        <span>✓ {t.name}</span>
                        <span>{t.duration}ms</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vista: Registros */}
        {activeBottomTab === "logs" && (
          <div className="h-full overflow-y-auto space-y-1 text-ide-text-muted font-mono text-2xs">
            <div>[2024-10-19T16:21:00Z] [AUDIT] SYSTEM_BOOT initialized</div>
            <div>[2024-10-19T16:21:02Z] [DOCKER] Sandbox runtime container verified</div>
            <div>[2024-10-19T16:21:03Z] [WS] Real-time event gateway connected on ws://localhost:3001</div>
            <div>[2024-10-19T16:21:05Z] [SECURITY] Workspace boundary locked to c:/Users/andre/Documents/antigravity/DEVPILOT AI</div>
          </div>
        )}
      </div>
    </div>
  );
};
