import { create } from "zustand";

export interface TerminalEntry {
  id: string;
  type: "command" | "output" | "error" | "success" | "info";
  text: string;
  timestamp: string;
}

export interface ProblemItem {
  id: string;
  file: string;
  line: number;
  column: number;
  message: string;
  severity: "error" | "warning" | "info";
  source: string;
}

export interface TestSuiteResult {
  name: string;
  status: "passed" | "failed";
  duration: number;
  tests: Array<{
    name: string;
    status: "passed" | "failed";
    duration: number;
    error?: string;
  }>;
}

interface TerminalState {
  history: TerminalEntry[];
  problems: ProblemItem[];
  testResults: {
    total: number;
    passed: number;
    failed: number;
    durationMs: number;
    suites: TestSuiteResult[];
    isRunning: boolean;
  };
  outputLogs: string[];

  // Acciones
  addEntry: (entry: Omit<TerminalEntry, "id" | "timestamp">) => void;
  clearHistory: () => void;
  runCommand: (cmd: string) => void;
  addProblem: (problem: ProblemItem) => void;
  removeProblem: (id: string) => void;
  runTests: () => void;
}

const INITIAL_PROBLEMS: ProblemItem[] = [
  {
    id: "prob-1",
    file: "src/app/page.tsx",
    line: 12,
    column: 11,
    message: "Missing key prop for element in iterator (ESLint react/jsx-key)",
    severity: "warning",
    source: "ESLint",
  },
  {
    id: "prob-2",
    file: "src/utils.ts",
    line: 14,
    column: 32,
    message: "Type 'any[]' should be constrained to a tuple or array type (TypeScript strict)",
    severity: "info",
    source: "TypeScript",
  },
];

const INITIAL_TEST_SUITES: TestSuiteResult[] = [
  {
    name: "src/utils.test.ts",
    status: "passed",
    duration: 42,
    tests: [
      { name: "formatBytes converts bytes to human-readable string", status: "passed", duration: 12 },
      { name: "debounce delays function execution", status: "passed", duration: 30 },
    ],
  },
  {
    name: "src/components/Header.test.tsx",
    status: "passed",
    duration: 86,
    tests: [
      { name: "renders title and subtitle properly", status: "passed", duration: 54 },
      { name: "has correct accessibility role", status: "passed", duration: 32 },
    ],
  },
];

export const useTerminalStore = create<TerminalState>((set, get) => ({
  history: [
    {
      id: "term-init",
      type: "info",
      text: "DevPilot AI Terminal v0.1.0 [Ambiente de ejecución local aislado]\nEscribe 'help' para ver los comandos disponibles.",
      timestamp: new Date().toLocaleTimeString(),
    },
  ],
  problems: INITIAL_PROBLEMS,
  testResults: {
    total: 4,
    passed: 4,
    failed: 0,
    durationMs: 128,
    suites: INITIAL_TEST_SUITES,
    isRunning: false,
  },
  outputLogs: [
    "[16:20:00] [devpilot-core] Workspace initialized: c:/Users/andre/Documents/antigravity/DEVPILOT AI",
    "[16:20:01] [monaco-lsp] Language server ready for typescript, javascript, json, css",
    "[16:20:02] [git] Repository status synced on branch 'main'",
  ],

  addEntry: (entry) => {
    const item: TerminalEntry = {
      ...entry,
      id: `term-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toLocaleTimeString(),
    };
    set((state) => ({ history: [...state.history, item] }));
  },

  clearHistory: () => set({ history: [] }),

  runCommand: (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    const { addEntry } = get();
    addEntry({ type: "command", text: trimmed });

    const lower = trimmed.toLowerCase();

    if (lower === "clear" || lower === "cls") {
      set({ history: [] });
      return;
    }

    if (lower === "help") {
      addEntry({
        type: "output",
        text: `Comandos disponibles:\n  help           Muestra esta ayuda\n  clear          Limpia la terminal\n  ls / dir       Lista los archivos del directorio actual\n  git status     Muestra el estado de git\n  pnpm test      Ejecuta la suite de pruebas unitarias Vitest\n  pnpm build     Compila la aplicación\n  pnpm lint      Ejecuta análisis de TypeScript y ESLint\n  info           Muestra el estado del entorno y los recursos`,
      });
      return;
    }

    if (lower === "ls" || lower === "dir") {
      addEntry({
        type: "output",
        text: "src/          package.json   tsconfig.json   README.md\nnode_modules/ .gitignore    turbo.json",
      });
      return;
    }

    if (lower.startsWith("git status")) {
      addEntry({
        type: "output",
        text: "On branch main\nYour branch is up to date with 'origin/main'.\n\nChanges not staged for commit:\n  (use \"git add <file>...\" to update what will be committed)\n\tmodified:   src/app/page.tsx\n\nno changes added to commit (use \"git add\" to track)",
      });
      return;
    }

    if (lower.includes("test")) {
      addEntry({ type: "info", text: "Ejecutando Vitest v2.1.8..." });
      setTimeout(() => {
        get().runTests();
        addEntry({
          type: "success",
          text: "✓ 2 test suites passed (4 tests)\n✓ Duration: 128ms\n✓ Todos los tests pasaron exitosamente.",
        });
      }, 500);
      return;
    }

    if (lower.includes("build")) {
      addEntry({ type: "info", text: "Iniciando compilación con Turborepo..." });
      setTimeout(() => {
        addEntry({
          type: "success",
          text: "✓ Web compilation succeeded (Next.js 15.0.3)\n✓ Bundle size: 84.2 kB\n✓ 0 errores, 0 fallos críticos.",
        });
      }, 700);
      return;
    }

    if (lower.includes("lint")) {
      addEntry({
        type: "output",
        text: "src/app/page.tsx:12:11 - warning react/jsx-key\nsrc/utils.ts:14:32 - info @typescript-eslint/no-explicit-any\n\n✖ 2 problemas (0 errores, 1 warning, 1 sugerencia)",
      });
      return;
    }

    if (lower === "info") {
      addEntry({
        type: "info",
        text: "DevPilot AI v0.1.0\nNode.js: v22.13.1\nPlatform: Windows x64\nDocker Sandbox: Aislamiento no-root (512MB RAM, 1 CPU)\nPrisma ORM: Conectado a PostgreSQL 16\nMonaco Editor: v0.52.0",
      });
      return;
    }

    // Ejecutar en Sandbox Backend
    import("@/lib/api").then(({ executeSandboxCommand }) => {
      import("@/stores/projectStore").then(({ useProjectStore }) => {
        const projectId = useProjectStore.getState().projectId || "devpilot-demo-app";

        executeSandboxCommand(projectId, trimmed)
          .then((res) => {
            if (res.stdout) {
              addEntry({ type: "output", text: res.stdout });
            }
            if (res.stderr) {
              addEntry({ type: "error", text: res.stderr });
            }
            if (res.exitCode === 0) {
              addEntry({
                type: "success",
                text: `✓ Proceso finalizado con éxito (código 0, ${res.durationMs}ms)`,
              });
            } else {
              addEntry({
                type: "error",
                text: `✗ Proceso finalizado con código de salida ${res.exitCode} (${res.durationMs}ms)`,
              });
            }
          })
          .catch((err) => {
            // Si Docker no está corriendo o backend está offline, informar la política de seguridad
            addEntry({
              type: "info",
              text: `[Sandbox] ${err.message}`,
            });

            // Respuesta local para comandos estándar de exploración
            if (lower === "ls" || lower === "dir") {
              addEntry({
                type: "output",
                text: "src/          package.json   tsconfig.json   README.md\nnode_modules/ .gitignore    turbo.json",
              });
            } else if (lower.startsWith("git status")) {
              addEntry({
                type: "output",
                text: "On branch main\nYour branch is up to date with 'origin/main'.\n\nChanges not staged for commit:\n  (use \"git add <file>...\" to update what will be committed)\n\tmodified:   src/app/page.tsx\n\nno changes added to commit (use \"git add\" to track)",
              });
            } else if (lower.includes("test")) {
              get().runTests();
              addEntry({
                type: "success",
                text: "✓ 2 test suites passed (4 tests)\n✓ Duration: 128ms\n✓ Todos los tests unitarios pasaron exitosamente.",
              });
            } else {
              addEntry({
                type: "output",
                text: `[Simulación Local] Comando registrado: '${trimmed}'. Para ejecutar código real en contenedor, asegúrate de tener Docker Desktop activo.`,
              });
            }
          });
      });
    });
  },

  addProblem: (problem) =>
    set((state) => ({ problems: [...state.problems, problem] })),

  removeProblem: (id) =>
    set((state) => ({ problems: state.problems.filter((p) => p.id !== id) })),

  runTests: () => {
    set((state) => ({
      testResults: {
        ...state.testResults,
        isRunning: true,
      },
    }));

    setTimeout(() => {
      set({
        testResults: {
          total: 4,
          passed: 4,
          failed: 0,
          durationMs: 142,
          suites: INITIAL_TEST_SUITES,
          isRunning: false,
        },
      });
    }, 400);
  },
}));
