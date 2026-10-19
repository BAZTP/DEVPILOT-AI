"use client";

import React from "react";
import { TabBar } from "./TabBar";
import { StatusBar } from "./StatusBar";
import { MonacoEditorView } from "./MonacoEditorView";
import { DiffEditorView } from "./DiffEditorView";
import { useEditorStore } from "@/stores/editorStore";

export const EditorPanel: React.FC = () => {
  const { diffState } = useEditorStore();

  return (
    <div className="h-full flex flex-col bg-ide-editor overflow-hidden flex-1 select-none">
      {/* ── Barra de pestañas ──────────────────────────────────────────────── */}
      <TabBar />

      {/* ── Contenido central: Editor de código o Diff ─────────────────────── */}
      <div className="flex-1 overflow-hidden relative">
        {diffState ? <DiffEditorView /> : <MonacoEditorView />}
      </div>

      {/* ── Barra de estado ────────────────────────────────────────────────── */}
      <StatusBar />
    </div>
  );
};
