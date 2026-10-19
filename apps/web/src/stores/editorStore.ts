import { create } from "zustand";

export interface OpenFile {
  path: string;
  name: string;
  content: string;
  originalContent: string;
  language: string;
  isDirty: boolean;
  version: number;
}

export interface DiffState {
  isOpen: boolean;
  filePath: string;
  original: string;
  modified: string;
  title: string;
}

interface EditorState {
  // Archivos abiertos y activo
  openFiles: OpenFile[];
  activeFilePath: string | null;

  // Comparador de cambios (Diff view)
  diffState: DiffState | null;

  // Configuración del editor Monaco
  fontSize: number;
  tabSize: number;
  minimap: boolean;
  wordWrap: "on" | "off";
  lineNumbers: "on" | "off";
  theme: string;

  // Estado del cursor
  cursorPosition: { line: number; column: number };

  // Acciones sobre archivos
  openFile: (file: { path: string; name: string; content: string; language?: string | undefined }) => void;
  closeFile: (path: string) => void;
  closeAllFiles: () => void;
  closeOtherFiles: (keepPath: string) => void;
  setActiveFile: (path: string) => void;
  updateFileContent: (path: string, newContent: string) => void;
  saveFile: (path: string) => void;
  saveAllFiles: () => void;
  revertFile: (path: string) => void;

  // Diff
  openDiff: (filePath: string, original: string, modified: string, title?: string) => void;
  closeDiff: () => void;

  // Ajustes
  setFontSize: (size: number) => void;
  setTabSize: (size: number) => void;
  toggleMinimap: () => void;
  toggleWordWrap: () => void;
  setCursorPosition: (pos: { line: number; column: number }) => void;
}

const getLanguageFromPath = (path: string): string => {
  const ext = path.slice(path.lastIndexOf(".")).toLowerCase();
  switch (ext) {
    case ".ts":
    case ".tsx":
      return "typescript";
    case ".js":
    case ".jsx":
    case ".mjs":
    case ".cjs":
      return "javascript";
    case ".json":
      return "json";
    case ".html":
    case ".htm":
      return "html";
    case ".css":
    case ".scss":
      return "css";
    case ".py":
      return "python";
    case ".md":
    case ".mdx":
      return "markdown";
    case ".sql":
      return "sql";
    case ".sh":
    case ".bash":
      return "shell";
    case ".yaml":
    case ".yml":
      return "yaml";
    default:
      return "plaintext";
  }
};

export const useEditorStore = create<EditorState>((set, get) => ({
  openFiles: [],
  activeFilePath: null,
  diffState: null,

  fontSize: 13,
  tabSize: 2,
  minimap: true,
  wordWrap: "on",
  lineNumbers: "on",
  theme: "vs-dark",

  cursorPosition: { line: 1, column: 1 },

  openFile: (file) => {
    const { openFiles } = get();
    const existing = openFiles.find((f) => f.path === file.path);

    if (existing) {
      set({ activeFilePath: file.path, diffState: null });
      return;
    }

    const language = file.language || getLanguageFromPath(file.path);
    const newFile: OpenFile = {
      path: file.path,
      name: file.name,
      content: file.content,
      originalContent: file.content,
      language,
      isDirty: false,
      version: 1,
    };

    set({
      openFiles: [...openFiles, newFile],
      activeFilePath: file.path,
      diffState: null,
    });
  },

  closeFile: (path) => {
    const { openFiles, activeFilePath } = get();
    const nextFiles = openFiles.filter((f) => f.path !== path);

    let nextActive = activeFilePath;
    if (activeFilePath === path) {
      if (nextFiles.length > 0) {
        const closedIndex = openFiles.findIndex((f) => f.path === path);
        const newIndex = Math.min(closedIndex, nextFiles.length - 1);
        nextActive = nextFiles[newIndex]?.path ?? null;
      } else {
        nextActive = null;
      }
    }

    set({
      openFiles: nextFiles,
      activeFilePath: nextActive,
    });
  },

  closeAllFiles: () => set({ openFiles: [], activeFilePath: null, diffState: null }),

  closeOtherFiles: (keepPath) => {
    const { openFiles } = get();
    const kept = openFiles.filter((f) => f.path === keepPath);
    set({
      openFiles: kept,
      activeFilePath: keepPath,
    });
  },

  setActiveFile: (path) => set({ activeFilePath: path, diffState: null }),

  updateFileContent: (path, newContent) => {
    const { openFiles } = get();
    set({
      openFiles: openFiles.map((file) => {
        if (file.path === path) {
          return {
            ...file,
            content: newContent,
            isDirty: newContent !== file.originalContent,
            version: file.version + 1,
          };
        }
        return file;
      }),
    });
  },

  saveFile: (path) => {
    const { openFiles } = get();
    set({
      openFiles: openFiles.map((file) => {
        if (file.path === path) {
          return {
            ...file,
            originalContent: file.content,
            isDirty: false,
          };
        }
        return file;
      }),
    });
  },

  saveAllFiles: () => {
    const { openFiles } = get();
    set({
      openFiles: openFiles.map((file) => ({
        ...file,
        originalContent: file.content,
        isDirty: false,
      })),
    });
  },

  revertFile: (path) => {
    const { openFiles } = get();
    set({
      openFiles: openFiles.map((file) => {
        if (file.path === path) {
          return {
            ...file,
            content: file.originalContent,
            isDirty: false,
          };
        }
        return file;
      }),
    });
  },

  openDiff: (filePath, original, modified, title) => {
    set({
      diffState: {
        isOpen: true,
        filePath,
        original,
        modified,
        title: title || `Diferencias: ${filePath}`,
      },
    });
  },

  closeDiff: () => set({ diffState: null }),

  setFontSize: (size) => set({ fontSize: Math.max(10, Math.min(size, 24)) }),
  setTabSize: (size) => set({ tabSize: size }),
  toggleMinimap: () => set((state) => ({ minimap: !state.minimap })),
  toggleWordWrap: () =>
    set((state) => ({ wordWrap: state.wordWrap === "on" ? "off" : "on" })),
  setCursorPosition: (pos) => set({ cursorPosition: pos }),
}));
