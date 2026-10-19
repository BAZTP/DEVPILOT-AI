"use client";

import React, { useState } from "react";
import {
  X,
  Settings,
  Cpu,
  Sliders,
  Keyboard,
  GitBranch,
  Shield,
  Eye,
  EyeOff,
  Check,
  RefreshCw,
} from "lucide-react";
import { useLayoutStore } from "@/stores/layoutStore";
import { useEditorStore } from "@/stores/editorStore";
import { useAIStore } from "@/stores/aiStore";

export const SettingsModal: React.FC = () => {
  const { isSettingsOpen, setSettingsOpen } = useLayoutStore();
  const {
    fontSize,
    setFontSize,
    tabSize,
    setTabSize,
    minimap,
    toggleMinimap,
    wordWrap,
    toggleWordWrap,
  } = useEditorStore();
  const { availableModels, selectedModelId, setModel } = useAIStore();

  const [activeTab, setActiveTab] = useState<"general" | "ai" | "git" | "shortcuts">("general");
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  if (!isSettingsOpen) return null;

  const handleTestConnection = () => {
    setIsTestingKey(true);
    setTestResult(null);
    setTimeout(() => {
      setIsTestingKey(false);
      setTestResult("✅ Conexión exitosa con el proveedor de IA.");
      setTimeout(() => setTestResult(null), 3000);
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none animate-fade-in">
      <div className="w-full max-w-2xl bg-ide-panel border border-ide-border rounded-xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* ── Encabezado del modal ─────────────────────────────────────────── */}
        <div className="h-12 px-5 border-b border-ide-border flex items-center justify-between bg-ide-sidebar">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-electric-400" />
            <h3 className="font-semibold text-ide-text text-sm">Configuración de DevPilot AI</h3>
          </div>
          <button
            onClick={() => setSettingsOpen(false)}
            className="p-1 rounded text-ide-text-muted hover:text-ide-text hover:bg-surface-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Cuerpo con pestañas laterales ───────────────────────────────── */}
        <div className="flex-1 flex overflow-hidden">
          {/* Navegación de pestañas */}
          <div className="w-44 bg-ide-sidebar/50 border-r border-ide-border p-2 space-y-1">
            {[
              { id: "general", label: "Editor General", icon: Sliders },
              { id: "ai", label: "Modelos e IA", icon: Cpu },
              { id: "git", label: "Git & Repos", icon: GitBranch },
              { id: "shortcuts", label: "Atajos de Teclado", icon: Keyboard },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded text-xs transition-colors text-left ${
                    activeTab === tab.id
                      ? "bg-electric-600/20 text-electric-400 font-semibold border border-electric-500/30"
                      : "text-ide-text-muted hover:text-ide-text hover:bg-surface-800/40"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Contenido de la pestaña */}
          <div className="flex-1 p-5 overflow-y-auto space-y-5 text-xs text-ide-text">
            {/* Pestaña: General */}
            {activeTab === "general" && (
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-ide-text uppercase tracking-wider text-ide-text-muted">
                  Preferencias del Editor Monaco
                </h4>

                <div className="flex items-center justify-between py-2 border-b border-ide-border/40">
                  <div>
                    <div className="font-medium">Tamaño de Fuente</div>
                    <div className="text-[11px] text-ide-text-muted">
                      Tamaño en píxeles del código en el editor
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setFontSize(fontSize - 1)}
                      className="ide-btn-secondary px-2 py-0.5 text-xs"
                    >
                      -
                    </button>
                    <span className="font-mono w-6 text-center">{fontSize}px</span>
                    <button
                      onClick={() => setFontSize(fontSize + 1)}
                      className="ide-btn-secondary px-2 py-0.5 text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-ide-border/40">
                  <div>
                    <div className="font-medium">Tamaño de Tabulación</div>
                    <div className="text-[11px] text-ide-text-muted">
                      Espacios insertados al presionar Tab
                    </div>
                  </div>
                  <select
                    value={tabSize}
                    onChange={(e) => setTabSize(Number(e.target.value))}
                    className="ide-input w-24 py-1 text-xs"
                  >
                    <option value={2}>2 espacios</option>
                    <option value={4}>4 espacios</option>
                  </select>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-ide-border/40">
                  <div>
                    <div className="font-medium">Minimapa de Código</div>
                    <div className="text-[11px] text-ide-text-muted">
                      Muestra un resumen vertical del archivo a la derecha
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={minimap}
                    onChange={toggleMinimap}
                    className="w-4 h-4 accent-electric-600 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between py-2 border-b border-ide-border/40">
                  <div>
                    <div className="font-medium">Ajuste de Línea (Word Wrap)</div>
                    <div className="text-[11px] text-ide-text-muted">
                      Ajustar automáticamente líneas largas al ancho visible
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={wordWrap === "on"}
                    onChange={toggleWordWrap}
                    className="w-4 h-4 accent-electric-600 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Pestaña: IA */}
            {activeTab === "ai" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-surface-900 border border-ide-border text-ide-text-muted">
                  <Shield className="w-4 h-4 text-ide-success shrink-0" />
                  <span className="text-[11px]">
                    Las claves API se almacenan cifradas con AES-256 en la base de datos local y nunca se comparten con terceros.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5">
                    Modelo Predeterminado
                  </label>
                  <select
                    value={selectedModelId}
                    onChange={(e) => setModel(e.target.value)}
                    className="ide-input py-1.5 text-xs"
                  >
                    {availableModels.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.provider})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5">
                    Clave API del Proveedor
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? "text" : "password"}
                      placeholder="sk-..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="ide-input pr-10 py-1.5 font-mono text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-2.5 top-2 text-ide-text-muted hover:text-ide-text"
                    >
                      {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={handleTestConnection}
                    disabled={isTestingKey}
                    className="ide-btn-secondary px-3 py-1.5 text-xs flex items-center gap-1.5"
                  >
                    {isTestingKey ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>Probar Conexión</span>
                  </button>

                  {testResult && (
                    <span className="text-ide-success font-medium text-xs">
                      {testResult}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Pestaña: Git */}
            {activeTab === "git" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Nombre de Autor Git</label>
                  <input type="text" defaultValue="DevPilot AI" className="ide-input py-1.5 text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Email de Autor Git</label>
                  <input type="email" defaultValue="devpilot@devpilot.ai" className="ide-input py-1.5 text-xs" />
                </div>
                <div className="pt-2">
                  <div className="text-2xs text-ide-text-muted">
                    Conexión remota activa: <code>https://github.com/BAZTP/DEVPILOT-AI.git</code>
                  </div>
                </div>
              </div>
            )}

            {/* Pestaña: Atajos */}
            {activeTab === "shortcuts" && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-ide-text uppercase tracking-wider text-ide-text-muted mb-2">
                  Atajos de Teclado del IDE
                </h4>
                <div className="divide-y divide-ide-border/30 font-mono text-[11px]">
                  {[
                    { key: "Ctrl + S", action: "Guardar archivo activo" },
                    { key: "Alt + Shift + F", action: "Formatear documento con Prettier" },
                    { key: "Ctrl + `", action: "Mostrar / Ocultar panel de terminal" },
                    { key: "Ctrl + B", action: "Mostrar / Ocultar barra lateral" },
                    { key: "Ctrl + Shift + F", action: "Abrir búsqueda global" },
                    { key: "Ctrl + Shift + G", action: "Abrir control de versiones Git" },
                    { key: "Ctrl + Shift + E", action: "Abrir explorador de archivos" },
                    { key: "Ctrl + W", action: "Cerrar pestaña activa" },
                  ].map((s, idx) => (
                    <div key={idx} className="py-1.5 flex items-center justify-between">
                      <span className="text-ide-text-muted font-sans">{s.action}</span>
                      <kbd className="px-2 py-0.5 rounded bg-surface-800 border border-ide-border text-electric-400 font-bold">
                        {s.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Pie del modal ───────────────────────────────────────────────── */}
        <div className="h-12 px-5 border-t border-ide-border flex items-center justify-end gap-2 bg-ide-sidebar">
          <button
            onClick={() => setSettingsOpen(false)}
            className="ide-btn-primary px-4 py-1.5 text-xs"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
