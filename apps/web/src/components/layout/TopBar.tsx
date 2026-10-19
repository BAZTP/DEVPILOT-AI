"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Cpu,
  Save,
  GitBranch,
  Play,
  Settings,
  User,
  PanelLeft,
  PanelBottom,
  PanelRight,
  Maximize2,
  ChevronDown,
  FolderOpen,
  Plus,
  Check,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { useLayoutStore } from "@/stores/layoutStore";
import { useEditorStore } from "@/stores/editorStore";
import { useProjectStore } from "@/stores/projectStore";

export const TopBar: React.FC = () => {
  const {
    isSidebarOpen,
    toggleSidebar,
    isBottomPanelOpen,
    toggleBottomPanel,
    isAIPanelOpen,
    toggleAIPanel,
    isZenMode,
    toggleZenMode,
    setSettingsOpen,
    setPreviewOpen,
  } = useLayoutStore();

  const { openFiles, saveFile, activeFilePath, saveAllFiles } = useEditorStore();
  const { projectName, gitBranch, setGitBranch } = useProjectStore();

  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const [isGitMenuOpen, setIsGitMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Comprobar si hay archivos sin guardar
  const hasDirtyFiles = openFiles.some((f) => f.isDirty);
  const activeFile = openFiles.find((f) => f.path === activeFilePath);

  const handleSaveActive = () => {
    if (activeFilePath) {
      saveFile(activeFilePath);
    }
  };

  return (
    <header className="h-12 bg-ide-sidebar border-b border-ide-border flex items-center justify-between px-3 select-none text-xs z-30">
      {/* ── Izquierda: Logo y Selector de Proyecto ───────────────────────── */}
      <div className="flex items-center gap-3">
        {/* Toggle Sidebar */}
        <button
          onClick={toggleSidebar}
          title={isSidebarOpen ? "Ocultar panel lateral (Ctrl+B)" : "Mostrar panel lateral (Ctrl+B)"}
          className={`p-1.5 rounded hover:bg-surface-800 transition-colors ${
            isSidebarOpen ? "text-electric-400" : "text-ide-text-muted"
          }`}
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        {/* Logo DevPilot AI */}
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-electric-500 to-violet-600 flex items-center justify-center shadow-sm shadow-electric-500/20 group-hover:scale-105 transition-transform">
            <Cpu className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-ide-text tracking-tight hidden sm:inline">
            DevPilot<span className="text-electric-400">AI</span>
          </span>
        </Link>

        <div className="h-4 w-px bg-ide-border hidden sm:block" />

        {/* Selector de proyecto */}
        <div className="relative">
          <button
            onClick={() => setIsProjectMenuOpen(!isProjectMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-surface-800 text-ide-text transition-colors border border-transparent hover:border-ide-border"
          >
            <FolderOpen className="w-3.5 h-3.5 text-electric-400" />
            <span className="font-medium truncate max-w-[140px] md:max-w-[200px]">
              {projectName}
            </span>
            <ChevronDown className="w-3 h-3 text-ide-text-muted" />
          </button>

          {isProjectMenuOpen && (
            <div
              className="absolute left-0 top-full mt-1 w-56 bg-ide-panel border border-ide-border rounded-lg shadow-2xl py-1 z-50 animate-fade-in"
              onMouseLeave={() => setIsProjectMenuOpen(false)}
            >
              <div className="px-3 py-1.5 text-2xs font-semibold text-ide-text-muted uppercase tracking-wider">
                Proyectos del Workspace
              </div>
              <button
                onClick={() => setIsProjectMenuOpen(false)}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-surface-800 text-left text-ide-text"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-ide-success" />
                  <span className="truncate">{projectName}</span>
                </div>
                <Check className="w-3.5 h-3.5 text-electric-400" />
              </button>
              <div className="h-px bg-ide-border my-1" />
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-surface-800 text-ide-text-muted hover:text-ide-text"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Ver todos en Dashboard</span>
              </Link>
            </div>
          )}
        </div>

        {/* Breadcrumb del archivo activo */}
        {activeFile && (
          <div className="hidden lg:flex items-center gap-1 text-ide-text-muted font-mono text-2xs">
            <span>/</span>
            <span className="text-ide-text truncate max-w-[240px]">
              {activeFile.path}
            </span>
            {activeFile.isDirty && (
              <span className="w-2 h-2 rounded-full bg-electric-400 ml-1" title="Cambios sin guardar" />
            )}
          </div>
        )}
      </div>

      {/* ── Centro: Acciones Rápidas (Guardar, Preview/Run) ──────────────── */}
      <div className="flex items-center gap-2">
        {/* Botón Guardar */}
        <button
          onClick={handleSaveActive}
          disabled={!hasDirtyFiles && !activeFile?.isDirty}
          title={hasDirtyFiles ? "Guardar cambios (Ctrl+S)" : "Todo guardado"}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-colors ${
            hasDirtyFiles
              ? "bg-electric-600/20 border-electric-500/40 text-electric-300 hover:bg-electric-600/30"
              : "border-transparent text-ide-text-muted opacity-60 hover:opacity-100"
          }`}
        >
          <Save className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Guardar</span>
          {hasDirtyFiles && <span className="w-1.5 h-1.5 rounded-full bg-electric-400" />}
        </button>

        {/* Botón Preview / Ejecutar */}
        <button
          onClick={() => setPreviewOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-ide-success/15 border border-ide-success/30 text-ide-success hover:bg-ide-success/25 transition-colors"
          title="Vista previa de la aplicación"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span className="hidden sm:inline font-medium">Preview</span>
        </button>
      </div>

      {/* ── Derecha: Git, Paneles, Ajustes, Perfil ───────────────────────── */}
      <div className="flex items-center gap-1.5">
        {/* Menú Git */}
        <div className="relative">
          <button
            onClick={() => setIsGitMenuOpen(!isGitMenuOpen)}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-surface-800 text-ide-text-muted hover:text-ide-text transition-colors"
            title="Rama activa y acciones Git"
          >
            <GitBranch className="w-3.5 h-3.5 text-violet-400" />
            <span className="font-mono text-2xs hidden md:inline">{gitBranch}</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {isGitMenuOpen && (
            <div
              className="absolute right-0 top-full mt-1 w-48 bg-ide-panel border border-ide-border rounded-lg shadow-2xl py-1 z-50 animate-fade-in"
              onMouseLeave={() => setIsGitMenuOpen(false)}
            >
              <div className="px-3 py-1.5 text-2xs font-semibold text-ide-text-muted uppercase tracking-wider">
                Control de Versiones
              </div>
              <div className="px-3 py-1 text-2xs text-ide-text flex items-center justify-between">
                <span>Rama: <strong>{gitBranch}</strong></span>
                <span className="text-ide-success font-mono">0 ↑ 0 ↓</span>
              </div>
              <div className="h-px bg-ide-border my-1" />
              <button
                onClick={() => {
                  setGitBranch(gitBranch === "main" ? "feature/devpilot-ai" : "main");
                  setIsGitMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-surface-800 text-left text-ide-text"
              >
                <RefreshCw className="w-3 h-3 text-ide-text-muted" />
                <span>Cambiar de rama...</span>
              </button>
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-ide-border mx-1" />

        {/* Toggle Panel Inferior */}
        <button
          onClick={toggleBottomPanel}
          title={isBottomPanelOpen ? "Ocultar terminal (Ctrl+`)" : "Mostrar terminal (Ctrl+`)"}
          className={`p-1.5 rounded hover:bg-surface-800 transition-colors ${
            isBottomPanelOpen ? "text-electric-400" : "text-ide-text-muted"
          }`}
        >
          <PanelBottom className="w-4 h-4" />
        </button>

        {/* Toggle Panel IA */}
        <button
          onClick={toggleAIPanel}
          title={isAIPanelOpen ? "Ocultar DevPilot Assistant" : "Abrir DevPilot Assistant"}
          className={`p-1.5 rounded hover:bg-surface-800 transition-colors ${
            isAIPanelOpen ? "text-violet-400" : "text-ide-text-muted"
          }`}
        >
          <PanelRight className="w-4 h-4" />
        </button>

        {/* Modo Zen */}
        <button
          onClick={toggleZenMode}
          title={isZenMode ? "Salir de modo Zen" : "Modo Zen (pantalla completa)"}
          className={`p-1.5 rounded hover:bg-surface-800 transition-colors ${
            isZenMode ? "text-ide-warning" : "text-ide-text-muted"
          }`}
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-ide-border mx-1" />

        {/* Ajustes */}
        <button
          onClick={() => setSettingsOpen(true)}
          title="Configuración general"
          className="p-1.5 rounded hover:bg-surface-800 text-ide-text-muted hover:text-ide-text transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Perfil de usuario */}
        <div className="relative">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-1.5 p-1 rounded-full hover:ring-2 hover:ring-electric-500/40 transition-all"
            title="Perfil de desarrollador"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-violet-600 to-electric-500 flex items-center justify-center text-white text-xs font-bold">
              U
            </div>
          </button>

          {isProfileMenuOpen && (
            <div
              className="absolute right-0 top-full mt-1 w-52 bg-ide-panel border border-ide-border rounded-lg shadow-2xl py-2 z-50 animate-fade-in"
              onMouseLeave={() => setIsProfileMenuOpen(false)}
            >
              <div className="px-3 pb-2 border-b border-ide-border">
                <div className="font-semibold text-ide-text">Desarrollador</div>
                <div className="text-2xs text-ide-text-muted">dev@devpilot.ai</div>
              </div>
              <div className="py-1">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-3 py-1.5 hover:bg-surface-800 text-ide-text"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-ide-text-muted" />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={() => {
                    setSettingsOpen(true);
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-surface-800 text-left text-ide-text"
                >
                  <Settings className="w-3.5 h-3.5 text-ide-text-muted" />
                  <span>Configuración</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
