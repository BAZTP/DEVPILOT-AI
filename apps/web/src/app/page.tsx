import Link from "next/link";
import {
  Code2,
  Cpu,
  FolderOpen,
  GitBranch,
  Play,
  Shield,
  Terminal,
  Zap,
} from "lucide-react";

/**
 * Página de inicio de DevPilot AI
 * Se muestra antes de autenticarse. Redirige al dashboard una vez autenticado.
 */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-ide-bg flex flex-col">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="border-b border-ide-border bg-ide-sidebar/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-electric-500 to-violet-600 flex items-center justify-center">
                <Cpu className="w-4 h-4 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-ide-success border-2 border-ide-bg" />
            </div>
            <div>
              <span className="text-sm font-bold text-ide-text tracking-tight">
                DevPilot
              </span>
              <span className="text-sm font-bold bg-gradient-to-r from-electric-400 to-violet-400 bg-clip-text text-transparent">
                {" "}
                AI
              </span>
            </div>
          </div>

          {/* Navegación */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-ide-text-muted">
            <a href="#features" className="hover:text-ide-text transition-colors">
              Funciones
            </a>
            <a href="#stack" className="hover:text-ide-text transition-colors">
              Stack
            </a>
            <a
              href="https://github.com/BAZTP/DEVPILOT-AI"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ide-text transition-colors"
            >
              GitHub
            </a>
          </nav>

          {/* Acciones */}
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="ide-btn-ghost text-sm hidden sm:inline-flex"
            >
              Iniciar sesión
            </Link>
            <Link href="/auth/login" className="ide-btn-primary text-sm">
              Comenzar
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <main className="flex-1">
        <section className="max-w-7xl mx-auto px-6 py-24 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-electric-500/30 bg-electric-500/10 text-electric-400 text-xs font-medium mb-8">
            <Zap className="w-3 h-3" />
            Fase 2 — Interfaz Profesional e IDE Activos
          </div>

          {/* Título */}
          <h1 className="text-4xl md:text-6xl font-bold text-ide-text mb-6 leading-tight">
            El IDE que trabaja
            <br />
            <span className="bg-gradient-to-r from-electric-400 via-violet-400 to-electric-400 bg-clip-text text-transparent">
              contigo, no para ti
            </span>
          </h1>

          {/* Subtítulo */}
          <p className="text-lg text-ide-text-muted max-w-2xl mx-auto mb-12 leading-relaxed">
            DevPilot AI es un entorno de desarrollo integrado con inteligencia
            artificial que te ayuda a crear proyectos, editar código, detectar
            errores y colaborar con IA de forma segura y supervisada.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <Link href="/ide" className="ide-btn-primary px-8 py-3 text-base">
              <Play className="w-4 h-4" />
              Abrir IDE Completo
            </Link>
            <Link href="/dashboard" className="ide-btn-secondary px-8 py-3 text-base">
              <Code2 className="w-4 h-4" />
              Panel de Control
            </Link>
          </div>

          {/* Preview del IDE (placeholder visual) */}
          <div className="relative max-w-5xl mx-auto rounded-xl border border-ide-border overflow-hidden shadow-2xl shadow-black/50">
            {/* Barra de título */}
            <div className="bg-ide-sidebar flex items-center gap-2 px-4 py-2 border-b border-ide-border">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-ide-error/70" />
                <div className="w-3 h-3 rounded-full bg-ide-warning/70" />
                <div className="w-3 h-3 rounded-full bg-ide-success/70" />
              </div>
              <div className="flex-1 text-center text-xs text-ide-text-muted font-mono">
                DevPilot AI — mi-proyecto
              </div>
            </div>

            {/* Simulación del IDE */}
            <div className="bg-ide-bg flex h-80 text-left">
              {/* Sidebar */}
              <div className="w-48 bg-ide-sidebar border-r border-ide-border p-2 shrink-0">
                <div className="text-2xs text-ide-text-muted uppercase tracking-wider px-2 mb-2">
                  Explorador
                </div>
                {[
                  { name: "src", icon: "📁", indent: 0 },
                  { name: "app", icon: "📁", indent: 1 },
                  { name: "page.tsx", icon: "⚛️", indent: 2 },
                  { name: "layout.tsx", icon: "⚛️", indent: 2 },
                  { name: "components", icon: "📁", indent: 1 },
                  { name: "Button.tsx", icon: "⚛️", indent: 2 },
                  { name: "package.json", icon: "📄", indent: 0 },
                  { name: "tsconfig.json", icon: "📄", indent: 0 },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="file-tree-item"
                    style={{ paddingLeft: `${item.indent * 12 + 8}px` }}
                  >
                    <span className="text-xs">{item.icon}</span>
                    <span className="text-xs truncate">{item.name}</span>
                  </div>
                ))}
              </div>

              {/* Editor */}
              <div className="flex-1 overflow-hidden">
                <div className="bg-ide-sidebar border-b border-ide-border flex">
                  <div className="ide-tab active text-xs">page.tsx</div>
                  <div className="ide-tab text-xs">Button.tsx</div>
                </div>
                <div className="p-4 font-mono text-xs text-ide-text-muted leading-6">
                  <div>
                    <span className="text-violet-400">export default</span>
                    <span className="text-ide-text"> function </span>
                    <span className="text-electric-400">HomePage</span>
                    <span className="text-ide-text">() {"{"}</span>
                  </div>
                  <div className="pl-4">
                    <span className="text-violet-400">return</span>
                    <span className="text-ide-text"> (</span>
                  </div>
                  <div className="pl-8">
                    <span className="text-electric-300">&lt;main</span>
                    <span className="text-ide-text">&gt;</span>
                  </div>
                  <div className="pl-12">
                    <span className="text-electric-300">&lt;h1&gt;</span>
                    <span className="text-ide-success">Hola DevPilot</span>
                    <span className="text-electric-300">&lt;/h1&gt;</span>
                  </div>
                  <div className="pl-8">
                    <span className="text-electric-300">&lt;/main&gt;</span>
                  </div>
                  <div className="pl-4">
                    <span className="text-ide-text">);</span>
                  </div>
                  <div>
                    <span className="text-ide-text">{"}"}</span>
                  </div>
                </div>
              </div>

              {/* Panel IA */}
              <div className="w-64 bg-ide-panel border-l border-ide-border p-3 shrink-0">
                <div className="text-2xs text-ide-text-muted uppercase tracking-wider mb-3">
                  DevPilot Assistant
                </div>
                <div className="space-y-2">
                  <div className="bg-surface-800 rounded p-2 text-xs text-ide-text-muted">
                    ¿Cómo puedo ayudarte hoy?
                  </div>
                  <div className="bg-electric-600/20 border border-electric-500/20 rounded p-2 text-xs text-electric-300 text-right">
                    Genera un componente Button
                  </div>
                  <div className="bg-surface-800 rounded p-2 text-xs text-ide-text-muted">
                    <div className="flex items-center gap-1 mb-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-electric-400 animate-pulse" />
                      <span className="text-electric-400">Generando...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Funciones ──────────────────────────────────────────────────────── */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-20">
          <h2 className="text-2xl font-bold text-ide-text text-center mb-12">
            Todo lo que necesitas para desarrollar
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-ide-panel border border-ide-border rounded-xl p-6 hover:border-electric-500/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-electric-500/20 to-violet-500/20 border border-electric-500/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-electric-400" />
                </div>
                <h3 className="text-sm font-semibold text-ide-text mb-2">
                  {feature.title}
                </h3>
                <p className="text-xs text-ide-text-muted leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Stack ──────────────────────────────────────────────────────────── */}
        <section
          id="stack"
          className="bg-ide-sidebar/30 border-y border-ide-border py-20"
        >
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-2xl font-bold text-ide-text mb-4">
              Stack tecnológico
            </h2>
            <p className="text-ide-text-muted mb-10 text-sm">
              Construido con tecnologías modernas, estables y de código abierto
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {techStack.map((tech) => (
                <div
                  key={tech}
                  className="px-4 py-2 rounded-lg bg-surface-800 border border-ide-border text-sm text-ide-text-muted font-mono"
                >
                  {tech}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-ide-border py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-ide-text-muted">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-electric-500" />
            <span>DevPilot AI — Versión 0.1.0 MVP</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-ide-success" />
            <span>Código abierto · Ejecución local · Sin telemetría</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Datos de la página ────────────────────────────────────────────────────────

const features = [
  {
    icon: Code2,
    title: "Editor Monaco integrado",
    description:
      "El mismo motor que VS Code con resaltado de sintaxis, autocompletado y diagnósticos para TypeScript, JavaScript, Python y más.",
  },
  {
    icon: Cpu,
    title: "Asistente IA contextual",
    description:
      "DevPilot Assistant lee tu código real para generar, refactorizar y documentar sin inventar funciones inexistentes.",
  },
  {
    icon: FolderOpen,
    title: "Gestión real de proyectos",
    description:
      "Crea, abre y edita proyectos con estructura de archivos real. Soporta plantillas para React, Next.js, Node.js, Python y más.",
  },
  {
    icon: GitBranch,
    title: "Integración GitHub",
    description:
      "Visualiza cambios, crea commits, maneja ramas y pull requests directamente desde el IDE con autenticación segura.",
  },
  {
    icon: Terminal,
    title: "Ejecución aislada",
    description:
      "Ejecuta código en contenedores Docker con recursos limitados. Tu sistema operativo permanece protegido.",
  },
  {
    icon: Zap,
    title: "Agente supervisado",
    description:
      "El modo agente planifica y ejecuta tareas complejas paso a paso, pidiendo tu aprobación antes de cada acción importante.",
  },
];

const techStack = [
  "Next.js 15",
  "React 19",
  "TypeScript 5",
  "Tailwind CSS",
  "Monaco Editor",
  "NestJS",
  "PostgreSQL",
  "Prisma ORM",
  "Docker",
  "WebSockets",
  "Zustand",
  "TanStack Query",
  "Vitest",
  "Playwright",
];
