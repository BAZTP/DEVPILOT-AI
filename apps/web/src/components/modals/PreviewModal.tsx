"use client";

import React, { useState } from "react";
import {
  X,
  Play,
  RotateCcw,
  ExternalLink,
  Square,
  Globe,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { useLayoutStore } from "@/stores/layoutStore";

export const PreviewModal: React.FC = () => {
  const { isPreviewOpen, setPreviewOpen, previewUrl } = useLayoutStore();
  const [isRunning, setIsRunning] = useState(true);
  const [key, setKey] = useState(1);

  if (!isPreviewOpen) return null;

  const handleRefresh = () => {
    setKey((prev) => prev + 1);
  };

  const handleToggleServer = () => {
    setIsRunning((prev) => !prev);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none animate-fade-in">
      <div className="w-full max-w-5xl h-[85vh] bg-ide-panel border border-ide-border rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* ── Barra de control de Vista Previa ─────────────────────────────── */}
        <div className="h-11 px-4 bg-ide-sidebar border-b border-ide-border flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-semibold text-ide-text">
              <Globe className="w-4 h-4 text-electric-400" />
              <span>Vista Previa Integrada</span>
            </div>

            {/* Estado del servidor */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-800 border border-ide-border text-2xs font-mono">
              <span
                className={`w-2 h-2 rounded-full ${
                  isRunning ? "bg-ide-success animate-pulse" : "bg-ide-error"
                }`}
              />
              <span className="text-ide-text">
                {isRunning ? "Servidor local activo :3000" : "Servidor detenido"}
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-1 text-2xs text-ide-text-muted">
              <ShieldCheck className="w-3.5 h-3.5 text-ide-success" />
              <span>Sandbox aislado (Same-Origin)</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Detener / Iniciar servidor */}
            <button
              onClick={handleToggleServer}
              className={`ide-btn px-2.5 py-1 text-2xs rounded flex items-center gap-1 ${
                isRunning
                  ? "bg-ide-error/15 text-ide-error border border-ide-error/30 hover:bg-ide-error/25"
                  : "bg-ide-success/15 text-ide-success border border-ide-success/30 hover:bg-ide-success/25"
              }`}
            >
              {isRunning ? (
                <>
                  <Square className="w-3 h-3 fill-current" />
                  <span>Detener</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-current" />
                  <span>Iniciar</span>
                </>
              )}
            </button>

            {/* Recargar */}
            <button
              onClick={handleRefresh}
              disabled={!isRunning}
              title="Recargar vista previa"
              className="p-1 rounded text-ide-text-muted hover:text-ide-text hover:bg-surface-800 disabled:opacity-40"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Abrir en pestaña externa */}
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Abrir en pestaña externa"
              className="p-1 rounded text-ide-text-muted hover:text-ide-text hover:bg-surface-800"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <div className="h-4 w-px bg-ide-border mx-1" />

            {/* Cerrar modal */}
            <button
              onClick={() => setPreviewOpen(false)}
              className="p-1 rounded text-ide-text-muted hover:text-ide-text hover:bg-surface-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Contenido de Vista Previa (Iframe aislado) ───────────────────── */}
        <div className="flex-1 bg-surface-950 flex flex-col relative overflow-hidden">
          {isRunning ? (
            <iframe
              key={key}
              src="/"
              title="Vista previa de DevPilot"
              sandbox="allow-scripts allow-forms allow-same-origin"
              className="w-full h-full border-none bg-white/5"
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-ide-text-muted p-6 text-center select-none">
              <AlertCircle className="w-10 h-10 text-ide-error/60 mb-3" />
              <h4 className="text-sm font-semibold text-ide-text mb-1">
                El servidor de desarrollo está detenido
              </h4>
              <p className="text-xs text-ide-text-muted max-w-sm mb-4">
                Haz clic en "Iniciar" para ejecutar la aplicación en el puerto local y reanudar la vista previa.
              </p>
              <button
                onClick={handleToggleServer}
                className="ide-btn-primary px-4 py-1.5 text-xs flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Iniciar Servidor</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
