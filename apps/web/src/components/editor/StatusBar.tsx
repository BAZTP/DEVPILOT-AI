"use client";

import React from "react";
import { GitBranch, AlertCircle, AlertTriangle, CheckCircle, Code } from "lucide-react";
import { useEditorStore } from "@/stores/editorStore";
import { useTerminalStore } from "@/stores/terminalStore";
import { useProjectStore } from "@/stores/projectStore";
import { useLayoutStore } from "@/stores/layoutStore";

export const StatusBar: React.FC = () => {
  const { openFiles, activeFilePath, cursorPosition, tabSize } = useEditorStore();
  const { problems } = useTerminalStore();
  const { gitBranch } = useProjectStore();
  const { setActiveBottomTab } = useLayoutStore();

  const activeFile = openFiles.find((f) => f.path === activeFilePath);

  const errorCount = problems.filter((p) => p.severity === "error").length;
  const warningCount = problems.filter((p) => p.severity === "warning").length;

  const formatLanguage = (lang?: string) => {
    switch (lang) {
      case "typescript":
        return "TypeScript React";
      case "javascript":
        return "JavaScript";
      case "json":
        return "JSON";
      case "css":
        return "CSS";
      case "python":
        return "Python";
      case "markdown":
        return "Markdown";
      default:
        return "Plain Text";
    }
  };

  return (
    <footer className="h-6 bg-ide-sidebar border-t border-ide-border flex items-center justify-between px-3 text-[11px] font-mono select-none text-ide-text-muted z-20 shrink-0">
      {/* ── Izquierda: Git branch y Problemas ──────────────────────────────── */}
      <div className="flex items-center gap-3">
        {/* Rama Git */}
        <div className="flex items-center gap-1 text-ide-text hover:text-electric-400 cursor-pointer transition-colors">
          <GitBranch className="w-3 h-3 text-violet-400" />
          <span>{gitBranch}</span>
        </div>

        {/* Problemas / Diagnósticos */}
        <button
          onClick={() => setActiveBottomTab("problems")}
          className="flex items-center gap-2 hover:text-ide-text cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-0.5 text-ide-error">
            <AlertCircle className="w-3 h-3" />
            <span>{errorCount}</span>
          </div>
          <div className="flex items-center gap-0.5 text-ide-warning">
            <AlertTriangle className="w-3 h-3" />
            <span>{warningCount}</span>
          </div>
        </button>
      </div>

      {/* ── Derecha: Posición de cursor, codificación y lenguaje ───────────── */}
      <div className="flex items-center gap-4">
        {activeFile && (
          <>
            <div>
              Ln {cursorPosition.line}, Col {cursorPosition.column}
            </div>
            <div>Espacios: {tabSize}</div>
            <div>UTF-8</div>
            <div>LF</div>
            <div className="flex items-center gap-1 text-ide-text font-sans font-medium">
              <Code className="w-3 h-3 text-electric-400" />
              <span>{formatLanguage(activeFile.language)}</span>
            </div>
          </>
        )}

        <div className="flex items-center gap-1 text-ide-success font-sans">
          <CheckCircle className="w-3 h-3" />
          <span className="hidden sm:inline">Prettier</span>
        </div>
      </div>
    </footer>
  );
};
