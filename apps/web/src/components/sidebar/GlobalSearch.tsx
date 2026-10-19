"use client";

import React, { useState, useMemo } from "react";
import { Search, ChevronDown, ChevronRight, FileCode, Replace } from "lucide-react";
import { useProjectStore, TreeNode } from "@/stores/projectStore";
import { useEditorStore } from "@/stores/editorStore";

interface SearchMatch {
  filePath: string;
  fileName: string;
  lineNumber: number;
  lineContent: string;
}

export const GlobalSearch: React.FC = () => {
  const { files } = useProjectStore();
  const { openFile } = useEditorStore();

  const [query, setQuery] = useState("");
  const [replaceQuery, setReplaceQuery] = useState("");
  const [isReplaceVisible, setIsReplaceVisible] = useState(false);
  const [matchCase, setMatchCase] = useState(false);
  const [useRegex, setUseRegex] = useState(false);

  // Recolectar todos los archivos planos
  const allFiles = useMemo(() => {
    const list: Array<{ path: string; name: string; content: string; language?: string | undefined }> = [];
    const collect = (nodes: TreeNode[]) => {
      for (const node of nodes) {
        if (node.type === "file" && node.content) {
          list.push({
            path: node.path,
            name: node.name,
            content: node.content,
            language: node.language,
          });
        }
        if (node.children) collect(node.children);
      }
    };
    collect(files);
    return list;
  }, [files]);

  // Realizar búsqueda
  const results = useMemo(() => {
    if (!query.trim()) return [];

    const matches: SearchMatch[] = [];

    for (const file of allFiles) {
      const lines = file.content.split("\n");
      lines.forEach((line, index) => {
        let isMatch = false;

        if (useRegex) {
          try {
            const regex = new RegExp(query, matchCase ? "g" : "gi");
            isMatch = regex.test(line);
          } catch {
            isMatch = false;
          }
        } else {
          isMatch = matchCase
            ? line.includes(query)
            : line.toLowerCase().includes(query.toLowerCase());
        }

        if (isMatch) {
          matches.push({
            filePath: file.path,
            fileName: file.name,
            lineNumber: index + 1,
            lineContent: line.trim(),
          });
        }
      });
    }

    return matches;
  }, [query, allFiles, matchCase, useRegex]);

  // Agrupar resultados por archivo
  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchMatch[]> = {};
    for (const match of results) {
      if (!groups[match.filePath]) groups[match.filePath] = [];
      groups[match.filePath]!.push(match);
    }
    return groups;
  }, [results]);

  const handleOpenMatch = (match: SearchMatch) => {
    const file = allFiles.find((f) => f.path === match.filePath);
    if (file) {
      openFile({
        path: file.path,
        name: file.name,
        content: file.content,
        language: file.language,
      });
    }
  };

  return (
    <div className="h-full flex flex-col select-none text-xs">
      <div className="h-9 px-3 border-b border-ide-border flex items-center justify-between text-ide-text-muted">
        <span className="text-2xs font-semibold uppercase tracking-wider text-ide-text">
          Búsqueda Global
        </span>
        <button
          onClick={() => setIsReplaceVisible(!isReplaceVisible)}
          title="Alternar reemplazar"
          className={`p-1 rounded hover:bg-surface-800 ${
            isReplaceVisible ? "text-electric-400" : "text-ide-text-muted hover:text-ide-text"
          }`}
        >
          <Replace className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── Inputs de búsqueda y reemplazo ─────────────────────────────────── */}
      <div className="p-3 border-b border-ide-border space-y-2">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Buscar en el workspace..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="ide-input pr-16 py-1.5 text-xs"
            autoFocus
          />
          <div className="absolute right-1.5 flex items-center gap-1 text-[10px]">
            <button
              onClick={() => setMatchCase(!matchCase)}
              title="Coincidir mayúsculas y minúsculas (Alt+C)"
              className={`px-1 rounded font-mono font-bold ${
                matchCase ? "bg-electric-600 text-white" : "text-ide-text-muted hover:text-ide-text"
              }`}
            >
              Aa
            </button>
            <button
              onClick={() => setUseRegex(!useRegex)}
              title="Usar expresión regular (Alt+R)"
              className={`px-1 rounded font-mono font-bold ${
                useRegex ? "bg-electric-600 text-white" : "text-ide-text-muted hover:text-ide-text"
              }`}
            >
              .*
            </button>
          </div>
        </div>

        {isReplaceVisible && (
          <div className="flex items-center gap-1 animate-fade-in">
            <input
              type="text"
              placeholder="Reemplazar con..."
              value={replaceQuery}
              onChange={(e) => setReplaceQuery(e.target.value)}
              className="ide-input py-1.5 text-xs flex-1"
            />
            <button
              disabled={!query}
              title="Reemplazar todos los hallazgos"
              className="ide-btn-secondary px-2 py-1.5 text-2xs disabled:opacity-50"
            >
              Todo
            </button>
          </div>
        )}

        <div className="text-2xs text-ide-text-muted">
          {query ? (
            <span>
              {results.length} coincidencias en {Object.keys(groupedResults).length} archivos
            </span>
          ) : (
            <span>Escribe para buscar texto en todos los archivos</span>
          )}
        </div>
      </div>

      {/* ── Lista de resultados agrupados ─────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {Object.entries(groupedResults).map(([filePath, matches]) => (
          <div key={filePath} className="rounded bg-surface-900/40 border border-ide-border/40 overflow-hidden">
            <div className="px-2 py-1.5 bg-surface-800/50 flex items-center justify-between text-xs font-mono text-ide-text border-b border-ide-border/30">
              <div className="flex items-center gap-1.5 truncate">
                <FileCode className="w-3.5 h-3.5 text-electric-400 shrink-0" />
                <span className="truncate">{filePath}</span>
              </div>
              <span className="text-2xs font-sans px-1.5 py-0.2 rounded-full bg-surface-700 text-ide-text-muted">
                {matches.length}
              </span>
            </div>
            <div className="divide-y divide-ide-border/20">
              {matches.map((m, idx) => (
                <div
                  key={idx}
                  onClick={() => handleOpenMatch(m)}
                  className="px-3 py-1 text-2xs font-mono flex items-center gap-2 hover:bg-surface-800 cursor-pointer text-ide-text-muted hover:text-ide-text transition-colors"
                >
                  <span className="text-electric-400 shrink-0">{m.lineNumber}:</span>
                  <span className="truncate">{m.lineContent}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
