"use client";

import React, { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useEditorStore } from "@/stores/editorStore";

// Carga dinámica de Monaco Editor solo en cliente
const Editor = dynamic(() => import("@monaco-editor/react").then((mod) => mod.default), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-ide-editor text-ide-text-muted text-xs font-mono">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full border-2 border-electric-500 border-t-transparent animate-spin" />
        <span>Cargando Monaco Editor...</span>
      </div>
    </div>
  ),
});

export const MonacoEditorView: React.FC = () => {
  const {
    openFiles,
    activeFilePath,
    updateFileContent,
    saveFile,
    fontSize,
    tabSize,
    minimap,
    wordWrap,
    lineNumbers,
    theme,
    setCursorPosition,
  } = useEditorStore();

  const editorRef = useRef<any>(null);
  const activeFile = openFiles.find((f) => f.path === activeFilePath);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;

    // Registrar atajo Ctrl+S / Cmd+S para guardar
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (activeFilePath) {
        saveFile(activeFilePath);
      }
    });

    // Registrar atajo Alt+Shift+F para formatear
    editor.addCommand(
      monaco.KeyMod.Alt | monaco.KeyMod.Shift | monaco.KeyCode.KeyF,
      () => {
        editor.getAction("editor.action.formatDocument")?.run();
      }
    );

    // Escuchar cambios de cursor
    editor.onDidChangeCursorPosition((e: any) => {
      setCursorPosition({
        line: e.position.lineNumber,
        column: e.position.column,
      });
    });
  };

  if (!activeFile) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-ide-editor text-ide-text-muted select-none text-center p-6">
        <div className="w-12 h-12 rounded-xl bg-surface-800 border border-ide-border flex items-center justify-center mb-4 text-electric-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-ide-text mb-1">Ningún archivo abierto</h3>
        <p className="text-xs text-ide-text-muted max-w-sm mb-4">
          Selecciona un archivo del explorador lateral o crea uno nuevo para comenzar a editar.
        </p>
        <div className="flex items-center gap-3 text-2xs font-mono text-ide-text-muted/70">
          <span>Ctrl+P · Abrir archivo</span>
          <span>·</span>
          <span>Ctrl+` · Terminal</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-ide-editor relative">
      <Editor
        height="100%"
        width="100%"
        path={activeFile.path}
        language={activeFile.language}
        value={activeFile.content}
        theme={theme}
        onChange={(val) => {
          if (val !== undefined && activeFilePath) {
            updateFileContent(activeFilePath, val);
          }
        }}
        onMount={handleEditorDidMount}
        options={{
          fontSize,
          tabSize,
          minimap: { enabled: minimap },
          wordWrap,
          lineNumbers,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          fontFamily: "'JetBrains Mono', 'Cascadia Code', Consolas, monospace",
          fontLigatures: true,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          smoothScrolling: true,
          bracketPairColorization: { enabled: true },
          formatOnPaste: true,
          padding: { top: 8, bottom: 8 },
        }}
      />
    </div>
  );
};
