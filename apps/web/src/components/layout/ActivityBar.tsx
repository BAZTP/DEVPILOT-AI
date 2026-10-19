"use client";

import React from "react";
import {
  Files,
  Search,
  GitBranch,
  Boxes,
  MessageSquare,
  Settings,
} from "lucide-react";
import { useLayoutStore, SidebarView } from "@/stores/layoutStore";
import { useEditorStore } from "@/stores/editorStore";

export const ActivityBar: React.FC = () => {
  const { isSidebarOpen, activeSidebarView, setActiveSidebarView, setSettingsOpen } =
    useLayoutStore();
  const { openFiles } = useEditorStore();

  const dirtyFilesCount = openFiles.filter((f) => f.isDirty).length;

  const navItems: Array<{
    id: SidebarView;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    badge?: number | undefined;
  }> = [
    { id: "explorer", icon: Files, label: "Explorador de Archivos (Ctrl+Shift+E)" },
    { id: "search", icon: Search, label: "Búsqueda Global (Ctrl+Shift+F)" },
    {
      id: "git",
      icon: GitBranch,
      label: "Control de Código Fuente (Ctrl+Shift+G)",
      badge: dirtyFilesCount > 0 ? dirtyFilesCount : undefined,
    },
    { id: "extensions", icon: Boxes, label: "Extensiones y Complementos" },
    { id: "ai-history", icon: MessageSquare, label: "Historial de Conversaciones IA" },
  ];

  return (
    <aside className="w-12 bg-ide-sidebar border-r border-ide-border flex flex-col justify-between items-center py-2 select-none z-20 shrink-0">
      {/* ── Iconos superiores de navegación ──────────────────────────────── */}
      <div className="flex flex-col items-center gap-1 w-full">
        {navItems.map((item) => {
          const isActive = isSidebarOpen && activeSidebarView === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveSidebarView(item.id)}
              title={item.label}
              className={`relative w-full h-10 flex items-center justify-center transition-colors group ${
                isActive
                  ? "text-electric-400 bg-surface-800/40"
                  : "text-ide-text-muted hover:text-ide-text hover:bg-surface-800/20"
              }`}
            >
              {/* Barra lateral activa */}
              {isActive && (
                <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-electric-500 rounded-r" />
              )}

              <Icon className="w-5 h-5" />

              {/* Badge contador */}
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[14px] h-[14px] px-1 rounded-full bg-electric-600 text-white font-mono text-[9px] flex items-center justify-center leading-none">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Icono inferior: Configuración ────────────────────────────────── */}
      <div className="flex flex-col items-center w-full">
        <button
          onClick={() => setSettingsOpen(true)}
          title="Configuración general"
          className="w-full h-10 flex items-center justify-center text-ide-text-muted hover:text-ide-text hover:bg-surface-800/20 transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
};
