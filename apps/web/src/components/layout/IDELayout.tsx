"use client";

import React, { useEffect } from "react";
import { TopBar } from "./TopBar";
import { ActivityBar } from "./ActivityBar";
import { SidebarPanel } from "../sidebar/SidebarPanel";
import { EditorPanel } from "../editor/EditorPanel";
import { BottomPanel } from "../terminal/BottomPanel";
import { AIAssistantPanel } from "../ai/AIAssistantPanel";
import { SettingsModal } from "../modals/SettingsModal";
import { PreviewModal } from "../modals/PreviewModal";
import { useEditorStore } from "@/stores/editorStore";
import { useLayoutStore } from "@/stores/layoutStore";
import { useProjectStore } from "@/stores/projectStore";

export const IDELayout: React.FC = () => {
  const { openFile, openFiles, saveFile, activeFilePath } = useEditorStore();
  const { toggleSidebar, toggleBottomPanel, toggleZenMode } = useLayoutStore();
  const { findNodeByPath, setProjectId, setProjectName, syncWithBackend } = useProjectStore();

  // Sincronizar proyecto desde URL y cargar estructura del backend
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlProjectId = params.get("projectId");
      const urlProjectName = params.get("projectName");

      if (urlProjectId) {
        setProjectId(urlProjectId);
      }
      if (urlProjectName) {
        setProjectName(decodeURIComponent(urlProjectName));
      }
    }
    syncWithBackend();
  }, [setProjectId, setProjectName, syncWithBackend]);

  // Abrir el archivo inicial en el editor al montar si no hay archivos abiertos
  useEffect(() => {
    if (openFiles.length === 0) {
      const initialNode = findNodeByPath("src/app/page.tsx");
      if (initialNode && initialNode.content) {
        openFile({
          path: initialNode.path,
          name: initialNode.name,
          content: initialNode.content,
          language: initialNode.language,
        });
      }
    }
  }, [openFiles.length, findNodeByPath, openFile]);

  // Atajos globales de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S / Cmd+S: Guardar
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (activeFilePath) {
          saveFile(activeFilePath);
        }
      }

      // Ctrl+B: Toggle Sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        toggleSidebar();
      }

      // Ctrl+`: Toggle Bottom Panel
      if ((e.ctrlKey || e.metaKey) && e.key === "`") {
        e.preventDefault();
        toggleBottomPanel();
      }

      // F11: Toggle Zen Mode
      if (e.key === "F11") {
        e.preventDefault();
        toggleZenMode();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeFilePath, saveFile, toggleSidebar, toggleBottomPanel, toggleZenMode]);

  return (
    <div className="h-screen w-screen flex flex-col bg-ide-bg text-ide-text overflow-hidden select-none">
      {/* ── Barra Superior (TopBar) ──────────────────────────────────────── */}
      <TopBar />

      {/* ── Espacio de trabajo horizontal ─────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Barra de actividades lateral (ActivityBar) */}
        <ActivityBar />

        {/* Panel lateral expandible (SidebarPanel) */}
        <SidebarPanel />

        {/* Columna central: Editor + Panel inferior */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {/* Panel central del editor Monaco */}
          <div className="flex-1 overflow-hidden relative">
            <EditorPanel />
          </div>

          {/* Panel inferior (Terminal, Problemas, Pruebas, Salida) */}
          <BottomPanel />
        </main>

        {/* Panel lateral derecho: Asistente IA */}
        <AIAssistantPanel />
      </div>

      {/* ── Modales ──────────────────────────────────────────────────────── */}
      <SettingsModal />
      <PreviewModal />
    </div>
  );
};
