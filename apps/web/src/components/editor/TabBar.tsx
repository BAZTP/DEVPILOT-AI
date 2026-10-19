"use client";

import React from "react";
import { X, FileCode, FileJson, FileText, File, GitCompare, MoreHorizontal } from "lucide-react";
import { useEditorStore, OpenFile } from "@/stores/editorStore";

export const TabBar: React.FC = () => {
  const {
    openFiles,
    activeFilePath,
    diffState,
    setActiveFile,
    closeFile,
    closeAllFiles,
    closeOtherFiles,
    closeDiff,
  } = useEditorStore();

  const getTabIcon = (name: string) => {
    if (name.endsWith(".tsx") || name.endsWith(".jsx")) {
      return <FileCode className="w-3.5 h-3.5 text-electric-400 shrink-0" />;
    }
    if (name.endsWith(".ts") || name.endsWith(".js")) {
      return <FileCode className="w-3.5 h-3.5 text-yellow-400 shrink-0" />;
    }
    if (name.endsWith(".json")) {
      return <FileJson className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
    }
    if (name.endsWith(".css") || name.endsWith(".scss")) {
      return <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
    }
    if (name.endsWith(".md")) {
      return <FileText className="w-3.5 h-3.5 text-violet-400 shrink-0" />;
    }
    return <File className="w-3.5 h-3.5 text-ide-text-muted shrink-0" />;
  };

  return (
    <div className="h-9 bg-ide-sidebar border-b border-ide-border flex items-center justify-between select-none overflow-x-auto scrollbar-hide text-xs">
      {/* ── Lista de pestañas ──────────────────────────────────────────────── */}
      <div className="flex items-center h-full overflow-x-auto scrollbar-hide">
        {openFiles.map((file) => {
          const isActive = activeFilePath === file.path && !diffState;

          return (
            <div
              key={file.path}
              onClick={() => setActiveFile(file.path)}
              className={`ide-tab group ${isActive ? "active" : ""}`}
            >
              {getTabIcon(file.name)}
              <span className="font-mono text-xs">{file.name}</span>

              {/* Botón de cierre o indicador de sin guardar */}
              <div className="flex items-center ml-1">
                {file.isDirty ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeFile(file.path);
                    }}
                    title="Cambios sin guardar. Click para cerrar."
                    className="w-4 h-4 rounded flex items-center justify-center hover:bg-surface-700"
                  >
                    <span className="w-2 h-2 rounded-full bg-electric-400 group-hover:hidden" />
                    <X className="w-3 h-3 hidden group-hover:block text-ide-text" />
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeFile(file.path);
                    }}
                    title="Cerrar pestaña (Ctrl+W)"
                    className="w-4 h-4 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-surface-700 hover:text-ide-text text-ide-text-muted transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Pestaña de Diff (si está activa) */}
        {diffState && (
          <div className="ide-tab active flex items-center gap-1.5 border-t-2 border-t-violet-500">
            <GitCompare className="w-3.5 h-3.5 text-violet-400" />
            <span className="font-mono text-xs text-violet-300">{diffState.title}</span>
            <button
              onClick={closeDiff}
              title="Cerrar vista de diferencias"
              className="w-4 h-4 rounded flex items-center justify-center hover:bg-surface-700 text-ide-text-muted hover:text-ide-text ml-1"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* ── Acciones de pestañas ───────────────────────────────────────────── */}
      {openFiles.length > 1 && (
        <div className="flex items-center px-2">
          <button
            onClick={closeAllFiles}
            title="Cerrar todas las pestañas"
            className="p-1 rounded text-ide-text-muted hover:text-ide-text hover:bg-surface-800 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
