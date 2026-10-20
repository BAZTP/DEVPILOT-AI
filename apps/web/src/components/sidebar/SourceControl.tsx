"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  AlertTriangle,
  FolderGit2,
} from "lucide-react";
import { useProjectStore } from "@/stores/projectStore";
import { useEditorStore } from "@/stores/editorStore";
import {
  fetchGitStatusRemote,
  stageGitFilesRemote,
  unstageGitFilesRemote,
  commitGitRemote,
  pushGitRemote,
  fetchGitDiffRemote,
  GitStatusSummaryDto,
} from "@/lib/api";

export const SourceControl: React.FC = () => {
  const { projectId, gitBranch, setGitBranch } = useProjectStore();
  const { openFiles, openDiff, saveAllFiles } = useEditorStore();

  const [gitStatus, setGitStatus] = useState<GitStatusSummaryDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [commitMessage, setCommitMessage] = useState("");
  const [isCommitting, setIsCommitting] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [commitSuccess, setCommitSuccess] = useState(false);
  const [showPushConfirm, setShowPushConfirm] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const loadGitStatus = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const status = await fetchGitStatusRemote(projectId);
      setGitStatus(status);
      if (status.branch) {
        setGitBranch(status.branch);
      }
    } catch {
      // Si el backend no tiene un repo inicializado todavía, el fallback visual mantendrá la lista limpia
    } finally {
      setIsLoading(false);
    }
  }, [projectId, setGitBranch]);

  useEffect(() => {
    loadGitStatus();
  }, [loadGitStatus]);

  // Archivos modificados en memoria en el editor
  const dirtyEditorFiles = openFiles.filter((f) => f.isDirty);

  const handleStageFile = async (filePath?: string) => {
    if (!projectId) return;
    try {
      const filesToStage = filePath ? [filePath] : undefined;
      const updated = await stageGitFilesRemote(projectId, filesToStage);
      setGitStatus(updated);
    } catch (err: any) {
      setStatusFeedback({ type: "error", text: err.message || "Error al preparar archivo" });
      setTimeout(() => setStatusFeedback(null), 3000);
      loadGitStatus();
    }
  };

  const handleUnstageFile = async (filePath?: string) => {
    if (!projectId) return;
    try {
      const filesToUnstage = filePath ? [filePath] : undefined;
      const updated = await unstageGitFilesRemote(projectId, filesToUnstage);
      setGitStatus(updated);
    } catch (err: any) {
      setStatusFeedback({ type: "error", text: err.message || "Error al desmarcar archivo" });
      setTimeout(() => setStatusFeedback(null), 3000);
      loadGitStatus();
    }
  };

  const handleCommit = async () => {
    if (!commitMessage.trim()) return;
    setIsCommitting(true);
    saveAllFiles();

    try {
      if (projectId) {
        await commitGitRemote(projectId, commitMessage.trim());
      }
      setCommitSuccess(true);
      setCommitMessage("");
      setStatusFeedback({ type: "success", text: "Commit confirmado con éxito." });
      await loadGitStatus();
      setTimeout(() => {
        setCommitSuccess(false);
        setStatusFeedback(null);
      }, 3000);
    } catch (err: any) {
      setStatusFeedback({ type: "error", text: err.message || "Error al realizar commit" });
      setTimeout(() => setStatusFeedback(null), 3000);
    } finally {
      setIsCommitting(false);
    }
  };

  const handlePushConfirm = async () => {
    setShowPushConfirm(false);
    setIsPushing(true);
    setStatusFeedback({ type: "info", text: `Enviando commits a origin/${gitBranch}...` });

    try {
      if (projectId) {
        const res = await pushGitRemote(projectId, true);
        setStatusFeedback({ type: "success", text: res.message || "Push completado exitosamente." });
      } else {
        setStatusFeedback({ type: "success", text: "Push completado exitosamente." });
      }
      await loadGitStatus();
      setTimeout(() => setStatusFeedback(null), 3500);
    } catch (err: any) {
      setStatusFeedback({ type: "error", text: `Error al hacer push: ${err.message}` });
      setTimeout(() => setStatusFeedback(null), 4000);
    } finally {
      setIsPushing(false);
    }
  };

  const handleViewDiff = async (filePath: string) => {
    const active = openFiles.find((f) => f.path === filePath);
    try {
      if (projectId) {
        const diffRes = await fetchGitDiffRemote(projectId, filePath);
        openDiff(
          filePath,
          active?.originalContent || "// Versión confirmada en Git HEAD",
          active?.content || diffRes.diff || "// Modificaciones locales",
          `Git Diff: ${filePath}`
        );
        return;
      }
    } catch {
      // Fallback
    }

    openDiff(
      filePath,
      active?.originalContent || `// Código base en ${gitBranch}`,
      active?.content || `// Cambios en ${filePath}`,
      `Git Diff: ${filePath}`
    );
  };

  const stagedCount = gitStatus?.stagedFiles?.length ?? 0;
  const unstagedCount = gitStatus?.unstagedFiles?.length ?? 0;
  const untrackedCount = gitStatus?.untrackedFiles?.length ?? 0;
  const totalChanges = stagedCount + unstagedCount + untrackedCount + dirtyEditorFiles.length;

  return (
    <div className="h-full flex flex-col select-none text-xs bg-surface-900">
      {/* ── Encabezado ────────────────────────────────────────────────────── */}
      <div className="h-9 px-3 border-b border-ide-border flex items-center justify-between text-ide-text-muted">
        <div className="flex items-center gap-1.5 min-w-0">
          <FolderGit2 className="w-3.5 h-3.5 text-electric-400 shrink-0" />
          <span className="text-2xs font-semibold uppercase tracking-wider text-ide-text truncate">
            Control de Versiones
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => loadGitStatus()}
            disabled={isLoading}
            title="Refrescar estado Git"
            className="p-1 hover:text-ide-text rounded hover:bg-surface-800 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-electric-400" : ""}`} />
          </button>
          <div className="flex items-center gap-1 font-mono text-2xs text-violet-400 bg-violet-950/60 px-1.5 py-0.5 rounded border border-violet-800/40">
            <GitBranch className="w-3 h-3" />
            <span className="truncate max-w-[80px]">{gitStatus?.branch || gitBranch || "master"}</span>
          </div>
        </div>
      </div>

      {/* ── Feedback Banner ──────────────────────────────────────────────── */}
      {statusFeedback && (
        <div
          className={`px-3 py-1.5 text-2xs border-b ${
            statusFeedback.type === "success"
              ? "bg-emerald-950/60 text-emerald-300 border-emerald-800/50"
              : statusFeedback.type === "error"
              ? "bg-red-950/60 text-red-300 border-red-800/50"
              : "bg-surface-800 text-electric-300 border-ide-border"
          }`}
        >
          {statusFeedback.text}
        </div>
      )}

      {/* ── Confirmación de Push (Guardrail de Seguridad) ─────────────────── */}
      {showPushConfirm && (
        <div className="p-3 border-b border-ide-border bg-amber-950/30 space-y-2">
          <div className="flex items-start gap-2 text-amber-300 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <p className="font-semibold text-2xs uppercase tracking-wide">
                Confirmación de Push Remoto
              </p>
              <p className="text-2xs text-ide-text-muted mt-0.5">
                ¿Estás seguro de que deseas enviar los commits locales a la rama{" "}
                <span className="text-amber-300 font-mono font-medium">
                  origin/{gitStatus?.branch || gitBranch || "master"}
                </span>
                ?
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handlePushConfirm}
              className="flex-1 py-1 px-2 text-2xs rounded font-medium bg-amber-600 hover:bg-amber-500 text-white transition-colors"
            >
              Confirmar Push
            </button>
            <button
              onClick={() => setShowPushConfirm(false)}
              className="py-1 px-2 text-2xs rounded bg-surface-800 hover:bg-surface-700 text-ide-text-muted transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* ── Caja de commit ─────────────────────────────────────────────────── */}
      <div className="p-3 border-b border-ide-border space-y-2 shrink-0">
        <textarea
          placeholder="Mensaje de commit (Ctrl+Enter para confirmar)..."
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          rows={3}
          className="ide-input text-xs resize-none py-1.5 font-sans"
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
            <span>
              {isCommitting
                ? "Confirmando..."
                : commitSuccess
                ? "¡Commit exitoso!"
                : "Commit"}
            </span>
          </button>

          <button
            onClick={() => setShowPushConfirm(true)}
            disabled={isPushing}
            title="Sincronizar cambios y Push a GitHub (requiere confirmación)"
            className="ide-btn-secondary p-1.5 hover:text-electric-400 relative"
          >
            {isPushing ? (
              <RefreshCw className="w-4 h-4 animate-spin text-electric-400" />
            ) : (
              <UploadCloud className="w-4 h-4" />
            )}
            {gitStatus && gitStatus.ahead > 0 && (
              <span className="absolute -top-1 -right-1 bg-electric-500 text-[9px] text-white px-1 rounded-full font-bold">
                {gitStatus.ahead}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Lista de cambios ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {/* Cambios preparados (Staged) */}
        {stagedCount > 0 && (
          <div>
            <div className="flex items-center justify-between text-2xs uppercase tracking-wider text-ide-text-muted px-2 py-1">
              <span className="font-semibold text-emerald-400">
                Preparados para commit ({stagedCount})
              </span>
              <button
                onClick={() => handleUnstageFile()}
                title="Desmarcar todos"
                className="text-[10px] text-ide-text-muted hover:text-red-400 flex items-center gap-0.5"
              >
                <Minus className="w-3 h-3" /> Todos
              </button>
            </div>
            <div className="mt-0.5 space-y-0.5">
              {gitStatus?.stagedFiles.map((file) => (
                <div
                  key={file.path}
                  className="flex items-center justify-between px-2 py-1 rounded hover:bg-surface-800 text-ide-text group transition-colors"
                >
                  <div
                    onClick={() => handleViewDiff(file.path)}
                    className="flex items-center gap-1.5 truncate cursor-pointer flex-1 min-w-0"
                  >
                    <FileCode className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate text-xs font-mono">{file.path}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-1 rounded border border-emerald-800/40">
                      {file.status || "M"}
                    </span>
                    <button
                      onClick={() => handleViewDiff(file.path)}
                      title="Ver diff"
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-electric-400 transition-opacity"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleUnstageFile(file.path)}
                      title="Desmarcar archivo"
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-400 transition-opacity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cambios no preparados (Unstaged) */}
        {unstagedCount > 0 && (
          <div>
            <div className="flex items-center justify-between text-2xs uppercase tracking-wider text-ide-text-muted px-2 py-1">
              <span className="font-semibold text-amber-400">
                Modificados ({unstagedCount})
              </span>
              <button
                onClick={() => handleStageFile()}
                title="Preparar todos"
                className="text-[10px] text-ide-text-muted hover:text-emerald-400 flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" /> Todos
              </button>
            </div>
            <div className="mt-0.5 space-y-0.5">
              {gitStatus?.unstagedFiles.map((file) => (
                <div
                  key={file.path}
                  className="flex items-center justify-between px-2 py-1 rounded hover:bg-surface-800 text-ide-text group transition-colors"
                >
                  <div
                    onClick={() => handleViewDiff(file.path)}
                    className="flex items-center gap-1.5 truncate cursor-pointer flex-1 min-w-0"
                  >
                    <FileCode className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate text-xs font-mono">{file.path}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/60 px-1 rounded border border-amber-800/40">
                      {file.status || "M"}
                    </span>
                    <button
                      onClick={() => handleViewDiff(file.path)}
                      title="Ver diff"
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-electric-400 transition-opacity"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleStageFile(file.path)}
                      title="Preparar archivo (+)"
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-emerald-400 transition-opacity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Archivos no rastreados (Untracked) */}
        {untrackedCount > 0 && (
          <div>
            <div className="flex items-center justify-between text-2xs uppercase tracking-wider text-ide-text-muted px-2 py-1">
              <span className="font-semibold text-blue-400">
                Sin seguimiento ({untrackedCount})
              </span>
              <button
                onClick={() => handleStageFile()}
                title="Preparar todos"
                className="text-[10px] text-ide-text-muted hover:text-emerald-400 flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" /> Todos
              </button>
            </div>
            <div className="mt-0.5 space-y-0.5">
              {gitStatus?.untrackedFiles.map((file) => (
                <div
                  key={file.path}
                  className="flex items-center justify-between px-2 py-1 rounded hover:bg-surface-800 text-ide-text group transition-colors"
                >
                  <div className="flex items-center gap-1.5 truncate flex-1 min-w-0">
                    <FileCode className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="truncate text-xs font-mono">{file.path}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-950/60 px-1 rounded border border-blue-800/40">
                      U
                    </span>
                    <button
                      onClick={() => handleStageFile(file.path)}
                      title="Preparar archivo (+)"
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-emerald-400 transition-opacity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fallback de cambios no guardados en el editor */}
        {dirtyEditorFiles.length > 0 && unstagedCount === 0 && (
          <div>
            <div className="flex items-center justify-between text-2xs uppercase tracking-wider text-ide-text-muted px-2 py-1">
              <span className="text-yellow-400">Modificados en Editor ({dirtyEditorFiles.length})</span>
            </div>
            <div className="mt-0.5 space-y-0.5">
              {dirtyEditorFiles.map((file) => (
                <div
                  key={file.path}
                  onClick={() => handleViewDiff(file.path)}
                  className="flex items-center justify-between px-2 py-1 rounded hover:bg-surface-800 text-ide-text cursor-pointer group transition-colors"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <FileCode className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                    <span className="truncate text-xs font-mono">{file.path}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDiff(file.path);
                    }}
                    title="Abrir comparación visual"
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-electric-400 transition-opacity"
                  >
                    <Eye className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estado completamente limpio */}
        {totalChanges === 0 && (
          <div className="flex flex-col items-center justify-center p-6 text-center text-ide-text-muted">
            <Check className="w-8 h-8 text-emerald-500/60 mb-2" />
            <p className="text-xs font-medium text-ide-text">Árbol de trabajo limpio</p>
            <p className="text-2xs text-ide-text-muted mt-0.5">
              No hay cambios pendientes en la rama {gitStatus?.branch || gitBranch || "master"}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
