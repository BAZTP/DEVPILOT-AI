"use client";

import React, { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  FileCode,
  FileText,
  FileJson,
  Folder,
  FolderOpen,
  FilePlus,
  FolderPlus,
  RefreshCw,
  ChevronsDownUp,
  Trash2,
  Edit2,
  File,
} from "lucide-react";
import { useProjectStore, TreeNode } from "@/stores/projectStore";
import { useEditorStore } from "@/stores/editorStore";
import { fetchFileContent } from "@/lib/api";

export const FileExplorer: React.FC = () => {
  const {
    projectId,
    projectName,
    files,
    expandedFolderIds,
    selectedNodeId,
    toggleFolder,
    collapseAllFolders,
    selectNode,
    createFile,
    createFolder,
    deleteNode,
    renameNode,
    syncWithBackend,
  } = useProjectStore();

  const { openFile, activeFilePath, openFiles } = useEditorStore();

  const [isSyncing, setIsSyncing] = useState(false);
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [targetParentPath, setTargetParentPath] = useState("");
  const [newEntryName, setNewEntryName] = useState("");
  const [renamingPath, setRenamingPath] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const getFileIcon = (name: string) => {
    if (name.endsWith(".tsx") || name.endsWith(".jsx")) {
      return <FileCode className="w-4 h-4 text-electric-400 shrink-0" />;
    }
    if (name.endsWith(".ts") || name.endsWith(".js")) {
      return <FileCode className="w-4 h-4 text-yellow-400 shrink-0" />;
    }
    if (name.endsWith(".json")) {
      return <FileJson className="w-4 h-4 text-emerald-400 shrink-0" />;
    }
    if (name.endsWith(".css") || name.endsWith(".scss")) {
      return <FileText className="w-4 h-4 text-cyan-400 shrink-0" />;
    }
    if (name.endsWith(".md") || name.endsWith(".mdx")) {
      return <FileText className="w-4 h-4 text-violet-400 shrink-0" />;
    }
    return <File className="w-4 h-4 text-ide-text-muted shrink-0" />;
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newEntryName.trim();
    if (!trimmed) return;

    if (isCreatingFile) {
      const createdPath = createFile(targetParentPath, trimmed, `// ${trimmed}\n`);
      openFile({
        path: createdPath,
        name: trimmed,
        content: `// ${trimmed}\n`,
      });
      setIsCreatingFile(false);
    } else if (isCreatingFolder) {
      createFolder(targetParentPath, trimmed);
      setIsCreatingFolder(false);
    }
    setNewEntryName("");
  };

  const handleRenameSubmit = (path: string, e: React.FormEvent) => {
    e.preventDefault();
    if (renameValue.trim()) {
      renameNode(path, renameValue.trim());
    }
    setRenamingPath(null);
  };

  const renderTree = (nodes: TreeNode[], depth = 0) => {
    return nodes.map((node) => {
      const isExpanded = expandedFolderIds.has(node.id);
      const isSelected = selectedNodeId === node.id || activeFilePath === node.path;
      const isOpenInEditor = openFiles.find((f) => f.path === node.path);
      const isDirty = isOpenInEditor?.isDirty;

      if (node.type === "directory") {
        return (
          <div key={node.id}>
            <div
              onClick={() => {
                toggleFolder(node.id);
                selectNode(node.id);
              }}
              style={{ paddingLeft: `${depth * 12 + 8}px` }}
              className={`flex items-center justify-between py-1 pr-2 rounded text-xs cursor-pointer select-none group transition-colors ${
                isSelected ? "bg-surface-800 text-ide-text" : "text-ide-text-muted hover:text-ide-text hover:bg-surface-800/40"
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-ide-text-muted shrink-0" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-ide-text-muted shrink-0" />
                )}
                {isExpanded ? (
                  <FolderOpen className="w-4 h-4 text-electric-400 shrink-0" />
                ) : (
                  <Folder className="w-4 h-4 text-electric-500/80 shrink-0" />
                )}
                <span className="truncate">{node.name}</span>
              </div>

              {/* Botones de acción rápida en hover */}
              <div className="hidden group-hover:flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setTargetParentPath(node.path);
                    setIsCreatingFile(true);
                  }}
                  title="Nuevo archivo aquí"
                  className="p-0.5 hover:text-electric-400"
                >
                  <FilePlus className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNode(node.path);
                  }}
                  title="Eliminar carpeta"
                  className="p-0.5 hover:text-ide-error"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Hijos de la carpeta */}
            {isExpanded && node.children && (
              <div>{renderTree(node.children, depth + 1)}</div>
            )}
          </div>
        );
      }

      // Archivo individual
      return (
        <div
          key={node.id}
          onClick={async () => {
            selectNode(node.id);
            let content = node.content;
            if (content === undefined && projectId) {
              try {
                const res = await fetchFileContent(projectId, node.path);
                content = res.content;
              } catch {
                content = `// Archivo: ${node.name}\n`;
              }
            }
            openFile({
              path: node.path,
              name: node.name,
              content: content ?? `// Archivo: ${node.name}\n`,
              language: node.language,
            });
          }}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          className={`flex items-center justify-between py-1 pr-2 rounded text-xs cursor-pointer select-none group transition-colors ${
            isSelected
              ? "bg-electric-600/20 text-electric-300 font-medium"
              : "text-ide-text-muted hover:text-ide-text hover:bg-surface-800/40"
          }`}
        >
          {renamingPath === node.path ? (
            <form
              onSubmit={(e) => handleRenameSubmit(node.path, e)}
              className="flex items-center gap-1 w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {getFileIcon(node.name)}
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                autoFocus
                onBlur={() => setRenamingPath(null)}
                className="bg-surface-900 border border-electric-500 rounded px-1 py-0.5 text-xs text-ide-text w-full outline-none"
              />
            </form>
          ) : (
            <>
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-3.5 shrink-0" />
                {getFileIcon(node.name)}
                <span className="truncate">{node.name}</span>
              </div>

              <div className="flex items-center gap-1">
                {isDirty && (
                  <span className="w-1.5 h-1.5 rounded-full bg-electric-400" title="Modificado" />
                )}
                {node.status === "untracked" && (
                  <span className="text-[10px] font-mono text-ide-success font-bold" title="Sin seguimiento (U)">
                    U
                  </span>
                )}
                <div className="hidden group-hover:flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setRenamingPath(node.path);
                      setRenameValue(node.name);
                    }}
                    title="Renombrar"
                    className="p-0.5 hover:text-ide-text"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNode(node.path);
                    }}
                    title="Eliminar archivo"
                    className="p-0.5 hover:text-ide-error"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      );
    });
  };

  return (
    <div className="h-full flex flex-col select-none text-xs">
      {/* ── Encabezado del explorador ──────────────────────────────────────── */}
      <div className="h-9 px-3 border-b border-ide-border flex items-center justify-between text-ide-text-muted">
        <span className="text-2xs font-semibold uppercase tracking-wider text-ide-text">
          {projectName}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setTargetParentPath("");
              setIsCreatingFile(true);
            }}
            title="Nuevo archivo raíz"
            className="p-1 rounded hover:bg-surface-800 hover:text-ide-text"
          >
            <FilePlus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setTargetParentPath("");
              setIsCreatingFolder(true);
            }}
            title="Nueva carpeta raíz"
            className="p-1 rounded hover:bg-surface-800 hover:text-ide-text"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={collapseAllFolders}
            title="Colapsar todas las carpetas"
            className="p-1 rounded hover:bg-surface-800 hover:text-ide-text"
          >
            <ChevronsDownUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={async () => {
              setIsSyncing(true);
              await syncWithBackend();
              setIsSyncing(false);
            }}
            title="Sincronizar con disco"
            className="p-1 rounded hover:bg-surface-800 hover:text-ide-text"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-electric-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── Entrada para crear nuevo archivo / carpeta ────────────────────── */}
      {(isCreatingFile || isCreatingFolder) && (
        <form onSubmit={handleCreateSubmit} className="p-2 border-b border-ide-border bg-surface-900/60">
          <div className="text-[10px] text-electric-400 mb-1 font-mono">
            {isCreatingFile ? "Nuevo archivo en" : "Nueva carpeta en"}: {targetParentPath || "raíz"}
          </div>
          <div className="flex items-center gap-1">
            <input
              type="text"
              placeholder={isCreatingFile ? "ej. Button.tsx" : "ej. components"}
              value={newEntryName}
              onChange={(e) => setNewEntryName(e.target.value)}
              autoFocus
              className="ide-input py-1 text-xs"
            />
            <button type="submit" className="ide-btn-primary px-2 py-1 text-xs">
              Crear
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCreatingFile(false);
                setIsCreatingFolder(false);
                setNewEntryName("");
              }}
              className="ide-btn-ghost px-2 py-1 text-xs"
            >
              ✕
            </button>
          </div>
        </form>
      )}

      {/* ── Árbol de archivos ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-1 py-2">
        {files.length === 0 ? (
          <div className="p-4 text-center text-ide-text-muted text-xs">
            No hay archivos en el workspace.
          </div>
        ) : (
          renderTree(files)
        )}
      </div>
    </div>
  );
};
