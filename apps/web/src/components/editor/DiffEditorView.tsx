"use client";

import React from "react";
import { Check, X, GitCompare } from "lucide-react";
import { useEditorStore } from "@/stores/editorStore";

export const DiffEditorView: React.FC = () => {
  const { diffState, closeDiff, updateFileContent, saveFile } = useEditorStore();

  if (!diffState) return null;

  const originalLines = diffState.original.split("\n");
  const modifiedLines = diffState.modified.split("\n");
  const maxLines = Math.max(originalLines.length, modifiedLines.length);

  const handleAccept = () => {
    updateFileContent(diffState.filePath, diffState.modified);
    saveFile(diffState.filePath);
    closeDiff();
  };

  return (
    <div className="h-full flex flex-col bg-ide-editor select-none font-mono text-xs">
      {/* ── Barra de herramientas de Diff ──────────────────────────────────── */}
      <div className="h-9 px-4 bg-ide-sidebar border-b border-ide-border flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-violet-400" />
          <span className="font-semibold text-ide-text">{diffState.title}</span>
          <span className="text-2xs font-sans text-ide-text-muted">
            (Comparación: Original vs Propuesta)
          </span>
        </div>

        <div className="flex items-center gap-2 font-sans">
          <button
            onClick={handleAccept}
            className="ide-btn-primary px-3 py-1 text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Aceptar cambios</span>
          </button>
          <button
            onClick={closeDiff}
            className="ide-btn-secondary px-3 py-1 text-xs flex items-center gap-1.5"
          >
            <X className="w-3.5 h-3.5" />
            <span>Rechazar</span>
          </button>
        </div>
      </div>

      {/* ── Vista de comparación de líneas ─────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto flex divide-x divide-ide-border">
        {/* Lado izquierdo: Original */}
        <div className="flex-1 bg-surface-950/60 overflow-x-auto">
          <div className="px-3 py-1 bg-ide-sidebar text-2xs uppercase tracking-wider text-ide-text-muted border-b border-ide-border font-sans font-semibold">
            Original (Versión guardada)
          </div>
          <div className="p-2 space-y-0.5">
            {originalLines.map((line, idx) => {
              const isDifferent = line !== modifiedLines[idx];
              return (
                <div
                  key={`orig-${idx}`}
                  className={`flex items-start text-xs leading-5 px-2 rounded-sm ${
                    isDifferent ? "bg-ide-error/15 text-red-300" : "text-ide-text-muted"
                  }`}
                >
                  <span className="w-8 text-right pr-3 select-none text-ide-text-muted/40 font-mono text-[11px]">
                    {idx + 1}
                  </span>
                  <span className="w-4 select-none font-bold text-ide-error/70">
                    {isDifferent ? "-" : " "}
                  </span>
                  <pre className="font-mono text-xs flex-1 overflow-x-auto">{line}</pre>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lado derecho: Modificado */}
        <div className="flex-1 bg-surface-950/30 overflow-x-auto">
          <div className="px-3 py-1 bg-ide-sidebar text-2xs uppercase tracking-wider text-electric-400 border-b border-ide-border font-sans font-semibold">
            Propuesta (Cambios nuevos)
          </div>
          <div className="p-2 space-y-0.5">
            {modifiedLines.map((line, idx) => {
              const isDifferent = line !== originalLines[idx];
              return (
                <div
                  key={`mod-${idx}`}
                  className={`flex items-start text-xs leading-5 px-2 rounded-sm ${
                    isDifferent ? "bg-ide-success/15 text-emerald-300" : "text-ide-text"
                  }`}
                >
                  <span className="w-8 text-right pr-3 select-none text-ide-text-muted/40 font-mono text-[11px]">
                    {idx + 1}
                  </span>
                  <span className="w-4 select-none font-bold text-ide-success">
                    {isDifferent ? "+" : " "}
                  </span>
                  <pre className="font-mono text-xs flex-1 overflow-x-auto">{line}</pre>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
