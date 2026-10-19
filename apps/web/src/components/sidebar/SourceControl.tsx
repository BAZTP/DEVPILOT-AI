"use client";

import React, { useState } from "react";
import {
  GitBranch,
  GitCommit,
  UploadCloud,
  FileCode,
  Check,
  RefreshCw,
  Plus,
  Minus,
  Eye,
} from "lucide-react";
import { useProjectStore } from "@/stores/projectStore";
import { useEditorStore } from "@/stores/editorStore";

export const SourceControl: React.FC = () => {
  const { gitBranch, setGitBranch, files } = useProjectStore();
  const { openFiles, openDiff, saveAllFiles } = useEditorStore();

  const [commitMessage, setCommitMessage] = useState("");
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitSuccess, setCommitSuccess] = useState(false);

  // Lista de archivos con cambios pendientes
  const modifiedFiles = openFiles.filter((f) => f.isDirty);

  // Archivos de ejemplo para control de versiones si no hay abiertos
  const changedList = modifiedFiles.length > 0
    ? modifiedFiles.map((f) => ({
        path: f.path,
        name: f.name,
        original: f.originalContent,
        modified: f.content,
        status: "M",
      }))
    : [
        {
          path: "src/app/page.tsx",
          name: "page.tsx",
          original: `// original code\nexport default function Page() {\n  return <div>Original</div>;\n}`,
          modified: `// modified code\nexport default function Page() {\n  return <div>Modified with DevPilot AI</div>;\n}`,
          status: "M",
        },
      ];

  const handleCommit = () => {
    if (!commitMessage.trim()) return;
    setIsCommitting(true);
    setTimeout(() => {
      saveAllFiles();
      setIsCommitting(false);
      setCommitSuccess(true);
      setCommitMessage("");
      setTimeout(() => setCommitSuccess(false), 2500);
    }, 600);
  };

  const handleViewDiff = (item: (typeof changedList)[0]) => {
    openDiff(
      item.path,
      item.original,
      item.modified,
      `Git Diff: ${item.name} (${gitBranch})`
    );
  };

  return (
    <div className="h-full flex flex-col select-none text-xs">
      {/* ── Encabezado ────────────────────────────────────────────────────── */}
      <div className="h-9 px-3 border-b border-ide-border flex items-center justify-between text-ide-text-muted">
        <span className="text-2xs font-semibold uppercase tracking-wider text-ide-text">
          Control de Código Fuente
        </span>
        <div className="flex items-center gap-1">
          <span className="font-mono text-2xs text-violet-400 bg-violet-950/60 px-1.5 py-0.5 rounded border border-violet-800/40">
            {gitBranch}
          </span>
        </div>
      </div>

      {/* ── Caja de commit ─────────────────────────────────────────────────── */}
      <div className="p-3 border-b border-ide-border space-y-2">
        <textarea
          placeholder="Mensaje de commit (Ctrl+Enter para confirmar)..."
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          rows={3}
          className="ide-input text-xs resize-none py-1.5"
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
              handleCommit();
            }
          }}
        />

        <div className="flex items-center gap-2">
          <button
            onClick={handleCommit}
            disabled={!commitMessage.trim() || isCommitting}
            className="ide-btn-primary flex-1 py-1.5 text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isCommitting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : commitSuccess ? (
              <Check className="w-3.5 h-3.5 text-ide-success" />
            ) : (
              <GitCommit className="w-3.5 h-3.5" />
            )}
            <span>{isCommitting ? "Confirmando..." : commitSuccess ? "¡Commit exitoso!" : "Commit"}</span>
          </button>

          <button
            title="Sincronizar cambios y Push a GitHub"
            className="ide-btn-secondary p-1.5 hover:text-electric-400"
          >
            <UploadCloud className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Lista de cambios ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="flex items-center justify-between text-2xs uppercase tracking-wider text-ide-text-muted px-2 py-1">
          <span>Cambios pendientes ({changedList.length})</span>
          <span className="text-[10px] text-electric-400">Todo preparado</span>
        </div>

        <div className="mt-1 space-y-0.5">
          {changedList.map((item) => (
            <div
              key={item.path}
              onClick={() => handleViewDiff(item)}
              className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-surface-800 text-ide-text cursor-pointer group transition-colors"
            >
              <div className="flex items-center gap-2 truncate">
                <FileCode className="w-3.5 h-3.5 text-electric-400 shrink-0" />
                <span className="truncate text-xs font-mono">{item.path}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-yellow-400 bg-yellow-400/10 px-1 rounded">
                  {item.status}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDiff(item);
                  }}
                  title="Abrir comparación visual (Diff)"
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-electric-400 transition-opacity"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
