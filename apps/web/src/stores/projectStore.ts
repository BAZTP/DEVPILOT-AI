import { create } from "zustand";
import {
  fetchFileTree,
  createFileRemote,
  createDirectoryRemote,
  deleteItemRemote,
  renameItemRemote,
} from "@/lib/api";

export interface TreeNode {
  id: string;
  name: string;
  path: string;
  type: "file" | "directory";
  children?: TreeNode[] | undefined;
  content?: string | undefined;
  language?: string | undefined;
  status?: ("untracked" | "modified" | "clean") | undefined;
}

interface ProjectState {
  projectId: string;
  projectName: string;
  projectPath: string;
  gitBranch: string;
  files: TreeNode[];
  expandedFolderIds: Set<string>;
  selectedNodeId: string | null;
  modifiedPaths: Set<string>;

  // Acciones
  setProjectId: (id: string) => void;
  setProjectName: (name: string) => void;
  setGitBranch: (branch: string) => void;
  toggleFolder: (folderId: string) => void;
  expandAllFolders: () => void;
  collapseAllFolders: () => void;
  selectNode: (nodeId: string | null) => void;
  createFile: (parentPath: string, fileName: string, initialContent?: string) => string;
  createFolder: (parentPath: string, folderName: string) => string;
  deleteNode: (path: string) => void;
  renameNode: (path: string, newName: string) => void;
  findNodeByPath: (path: string) => TreeNode | null;
  syncWithBackend: () => Promise<void>;
}

// Estructura de archivos inicial para el espacio de trabajo de demostración
const INITIAL_PROJECT_FILES: TreeNode[] = [
  {
    id: "root-src",
    name: "src",
    path: "src",
    type: "directory",
    children: [
      {
        id: "src-app",
        name: "app",
        path: "src/app",
        type: "directory",
        children: [
          {
            id: "src-app-page",
            name: "page.tsx",
            path: "src/app/page.tsx",
            type: "file",
            language: "typescript",
            content: `import React from 'react';\nimport { Header } from '@/components/Header';\nimport { FeatureCard } from '@/components/FeatureCard';\n\nexport default function HomePage() {\n  return (\n    <main className="min-h-screen bg-slate-950 text-slate-100">\n      <Header title="DevPilot AI" subtitle="Next Generation Intelligent IDE" />\n      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-6">\n        <FeatureCard\n          title="Editor Monaco"\n          description="Motor de código de alta velocidad con resaltado de sintaxis y diagnósticos."\n          icon="code"\n        />\n        <FeatureCard\n          title="Asistente IA Contextual"\n          description="Generación de código, refactorización y resolución de errores paso a paso."\n          icon="cpu"\n        />\n        <FeatureCard\n          title="Ejecución Aislada"\n          description="Sandboxes seguros con límites de CPU y memoria para tus pruebas."\n          icon="shield"\n        />\n      </div>\n    </main>\n  );\n}\n`,
          },
          {
            id: "src-app-layout",
            name: "layout.tsx",
            path: "src/app/layout.tsx",
            type: "file",
            language: "typescript",
            content: `import React from 'react';\nimport './globals.css';\n\nexport const metadata = {\n  title: 'DevPilot Application',\n  description: 'Built with DevPilot AI',\n};\n\nexport default function RootLayout({\n  children,\n}: { children: React.ReactNode }) {\n  return (\n    <html lang="es">\n      <body className="antialiased bg-black text-white">{children}</body>\n    </html>\n  );\n}\n`,
          },
          {
            id: "src-app-globals",
            name: "globals.css",
            path: "src/app/globals.css",
            type: "file",
            language: "css",
            content: `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\nbody {\n  margin: 0;\n  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n  background-color: #0d1117;\n  color: #e6edf3;\n}\n`,
          },
        ],
      },
      {
        id: "src-components",
        name: "components",
        path: "src/components",
        type: "directory",
        children: [
          {
            id: "src-components-header",
            name: "Header.tsx",
            path: "src/components/Header.tsx",
            type: "file",
            language: "typescript",
            content: `import React from 'react';\n\ninterface HeaderProps {\n  title: string;\n  subtitle?: string;\n}\n\nexport const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {\n  return (\n    <header className="border-b border-slate-800 bg-slate-900/60 px-8 py-6 backdrop-blur">\n      <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">\n        {title}\n      </h1>\n      {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}\n    </header>\n  );\n};\n`,
          },
          {
            id: "src-components-feature",
            name: "FeatureCard.tsx",
            path: "src/components/FeatureCard.tsx",
            type: "file",
            language: "typescript",
            content: `import React from 'react';\n\ninterface FeatureCardProps {\n  title: string;\n  description: string;\n  icon: string;\n}\n\nexport const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon }) => {\n  return (\n    <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 hover:border-blue-500/40 transition-colors shadow-lg">\n      <div className="text-xs font-mono uppercase tracking-wider text-blue-400 mb-2">[{icon}]</div>\n      <h3 className="text-lg font-semibold text-slate-100 mb-2">{title}</h3>\n      <p className="text-sm text-slate-400 leading-relaxed">{description}</p>\n    </div>\n  );\n};\n`,
          },
        ],
      },
      {
        id: "src-utils",
        name: "utils.ts",
        path: "src/utils.ts",
        type: "file",
        language: "typescript",
        content: `export function formatBytes(bytes: number, decimals = 2): string {\n  if (bytes === 0) return '0 Bytes';\n  const k = 1024;\n  const dm = decimals < 0 ? 0 : decimals;\n  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];\n  const i = Math.floor(Math.log(bytes) / Math.log(k));\n  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];\n}\n\nexport function debounce<T extends (...args: any[]) => void>(\n  fn: T,\n  delay: number\n): (...args: Parameters<T>) => void {\n  let timeoutId: NodeJS.Timeout;\n  return (...args: Parameters<T>) => {\n    clearTimeout(timeoutId);\n    timeoutId = setTimeout(() => fn(...args), delay);\n  };\n}\n`,
      },
    ],
  },
  {
    id: "root-package-json",
    name: "package.json",
    path: "package.json",
    type: "file",
    language: "json",
    content: `{\n  "name": "devpilot-demo-app",\n  "version": "0.1.0",\n  "private": true,\n  "scripts": {\n    "dev": "next dev",\n    "build": "next build",\n    "start": "next start",\n    "test": "vitest run"\n  },\n  "dependencies": {\n    "react": "^19.0.0",\n    "react-dom": "^19.0.0",\n    "next": "^15.0.3"\n  }\n}\n`,
  },
  {
    id: "root-readme",
    name: "README.md",
    path: "README.md",
    type: "file",
    language: "markdown",
    content: `# DevPilot AI Project\n\nEste es un proyecto generado y gestionado en DevPilot AI.\n\n## Características activas:\n- Editor Monaco integrado\n- Asistente de IA contextual\n- Terminal de desarrollo local\n- Resaltado de sintaxis TypeScript\n`,
  },
];

export const useProjectStore = create<ProjectState>((set, get) => ({
  projectId: "devpilot-demo-app",
  projectName: "devpilot-demo-app",
  projectPath: "c:/Users/andre/Documents/antigravity/DEVPILOT AI",
  gitBranch: "main",
  files: INITIAL_PROJECT_FILES,
  expandedFolderIds: new Set(["root-src", "src-app", "src-components"]),
  selectedNodeId: "src-app-page",
  modifiedPaths: new Set(),

  setProjectId: (id) => set({ projectId: id }),
  setProjectName: (name) => set({ projectName: name }),
  setGitBranch: (branch) => set({ gitBranch: branch }),

  toggleFolder: (folderId) => {
    const { expandedFolderIds } = get();
    const next = new Set(expandedFolderIds);
    if (next.has(folderId)) {
      next.delete(folderId);
    } else {
      next.add(folderId);
    }
    set({ expandedFolderIds: next });
  },

  expandAllFolders: () => {
    const allFolderIds = new Set<string>();
    const collect = (nodes: TreeNode[]) => {
      for (const node of nodes) {
        if (node.type === "directory") {
          allFolderIds.add(node.id);
          if (node.children) collect(node.children);
        }
      }
    };
    collect(get().files);
    set({ expandedFolderIds: allFolderIds });
  },

  collapseAllFolders: () => set({ expandedFolderIds: new Set() }),

  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),

  createFile: (parentPath, fileName, initialContent = "") => {
    const fullPath = parentPath ? `${parentPath}/${fileName}` : fileName;
    createFileRemote(get().projectId, fullPath, initialContent).catch(() => {});

    const newId = `file-${Date.now()}`;
    const newNode: TreeNode = {
      id: newId,
      name: fileName,
      path: fullPath,
      type: "file",
      content: initialContent,
      status: "untracked",
    };

    const addRecursive = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map((node) => {
        if (node.path === parentPath && node.type === "directory") {
          return {
            ...node,
            children: [...(node.children || []), newNode],
          };
        }
        if (node.children) {
          return { ...node, children: addRecursive(node.children) };
        }
        return node;
      });
    };

    if (!parentPath) {
      set((state) => ({ files: [...state.files, newNode] }));
    } else {
      set((state) => ({ files: addRecursive(state.files) }));
    }
    return fullPath;
  },

  createFolder: (parentPath, folderName) => {
    const fullPath = parentPath ? `${parentPath}/${folderName}` : folderName;
    createDirectoryRemote(get().projectId, fullPath).catch(() => {});

    const newId = `dir-${Date.now()}`;
    const newNode: TreeNode = {
      id: newId,
      name: folderName,
      path: fullPath,
      type: "directory",
      children: [],
    };

    const addRecursive = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map((node) => {
        if (node.path === parentPath && node.type === "directory") {
          return {
            ...node,
            children: [...(node.children || []), newNode],
          };
        }
        if (node.children) {
          return { ...node, children: addRecursive(node.children) };
        }
        return node;
      });
    };

    if (!parentPath) {
      set((state) => ({
        files: [...state.files, newNode],
        expandedFolderIds: new Set([...state.expandedFolderIds, newId]),
      }));
    } else {
      set((state) => ({
        files: addRecursive(state.files),
        expandedFolderIds: new Set([...state.expandedFolderIds, newId]),
      }));
    }
    return fullPath;
  },

  deleteNode: (path) => {
    deleteItemRemote(get().projectId, path).catch(() => {});
    const deleteRecursive = (nodes: TreeNode[]): TreeNode[] => {
      return nodes
        .filter((n) => n.path !== path)
        .map((n) => (n.children ? { ...n, children: deleteRecursive(n.children) } : n));
    };
    set((state) => ({ files: deleteRecursive(state.files) }));
  },

  renameNode: (path, newName) => {
    const parts = path.split("/");
    parts[parts.length - 1] = newName;
    const newPath = parts.join("/");
    renameItemRemote(get().projectId, path, newPath).catch(() => {});

    const renameRecursive = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map((node) => {
        if (node.path === path) {
          return { ...node, name: newName, path: newPath };
        }
        if (node.children) {
          return { ...node, children: renameRecursive(node.children) };
        }
        return node;
      });
    };
    set((state) => ({ files: renameRecursive(state.files) }));
  },

  findNodeByPath: (path) => {
    let found: TreeNode | null = null;
    const search = (nodes: TreeNode[]) => {
      for (const node of nodes) {
        if (node.path === path) {
          found = node;
          return;
        }
        if (node.children) search(node.children);
      }
    };
    search(get().files);
    return found;
  },

  syncWithBackend: async () => {
    try {
      const remoteNodes = await fetchFileTree(get().projectId);
      if (remoteNodes && remoteNodes.length > 0) {
        const convertToTreeNodes = (nodes: any[]): TreeNode[] => {
          return nodes.map((n, idx) => {
            const node: TreeNode = {
              id: `node-${n.path}-${idx}`,
              name: n.name,
              path: n.path,
              type: n.type,
            };
            if (n.children && n.children.length > 0) {
              node.children = convertToTreeNodes(n.children);
            }
            return node;
          });
        };
        set({ files: convertToTreeNodes(remoteNodes) });
      }
    } catch {
      // Fallback transparente a archivos en memoria
    }
  },
}));
