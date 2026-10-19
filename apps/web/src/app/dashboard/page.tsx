"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Cpu,
  FolderOpen,
  Plus,
  Star,
  GitBranch,
  Play,
  Terminal,
  Activity,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Server,
  Database,
  Layers,
  Settings,
  Github,
} from "lucide-react";

interface ProjectItem {
  id: string;
  name: string;
  description: string;
  template: string;
  language: string;
  lastOpened: string;
  isFavorite: boolean;
  branch: string;
}

const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: "proj-1",
    name: "devpilot-demo-app",
    description: "Aplicación Next.js 15 interactiva con editor de componentes y utilidades.",
    template: "Next.js",
    language: "TypeScript",
    lastOpened: "Hace 5 minutos",
    isFavorite: true,
    branch: "main",
  },
  {
    id: "proj-2",
    name: "ecommerce-api",
    description: "API REST modular construida con NestJS, autenticación JWT y PostgreSQL.",
    template: "NestJS API",
    language: "TypeScript",
    lastOpened: "Ayer a las 17:40",
    isFavorite: true,
    branch: "develop",
  },
  {
    id: "proj-3",
    name: "data-analyzer-py",
    description: "Scripts de procesamiento de datos y algoritmos de optimización con Python.",
    template: "Python",
    language: "Python",
    lastOpened: "Hace 3 días",
    isFavorite: false,
    branch: "main",
  },
];

export default function DashboardPage() {
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [filterFavorite, setFilterFavorite] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("React");

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p))
    );
  };

  const filteredProjects = filterFavorite
    ? projects.filter((p) => p.isFavorite)
    : projects;

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const newProj: ProjectItem = {
      id: `proj-${Date.now()}`,
      name: newProjectName.trim(),
      description: `Proyecto creado desde plantilla ${selectedTemplate}.`,
      template: selectedTemplate,
      language: selectedTemplate === "Python" ? "Python" : "TypeScript",
      lastOpened: "Ahora mismo",
      isFavorite: false,
      branch: "main",
    };

    setProjects([newProj, ...projects]);
    setIsNewProjectModalOpen(false);
    setNewProjectName("");
  };

  return (
    <div className="min-h-screen bg-ide-bg text-ide-text flex flex-col font-sans select-none">
      {/* ── Barra Superior del Dashboard ─────────────────────────────────── */}
      <header className="h-14 border-b border-ide-border bg-ide-sidebar/60 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-electric-500 to-violet-600 flex items-center justify-center shadow-md shadow-electric-500/20 group-hover:scale-105 transition-transform">
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-ide-text">
                DevPilot
              </span>
              <span className="font-bold text-sm bg-gradient-to-r from-electric-400 to-violet-400 bg-clip-text text-transparent">
                {" "}
                AI
              </span>
            </div>
          </Link>

          <span className="text-ide-border font-mono">/</span>
          <span className="text-xs text-ide-text-muted font-medium">Panel de Control</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsNewProjectModalOpen(true)}
            className="ide-btn-primary px-3 py-1.5 text-xs flex items-center gap-1.5 shadow-sm shadow-electric-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo Proyecto</span>
          </button>

          <Link
            href="/ide"
            className="ide-btn-secondary px-3 py-1.5 text-xs flex items-center gap-1.5"
          >
            <Terminal className="w-3.5 h-3.5 text-electric-400" />
            <span>Abrir IDE</span>
          </Link>
        </div>
      </header>

      {/* ── Contenido Principal del Dashboard ─────────────────────────────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        {/* ── Accesos Rápidos y Estado de Conexiones ──────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card: Acciones rápidas */}
          <div className="md:col-span-2 rounded-xl border border-ide-border bg-ide-panel p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ide-text flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-electric-400" />
                <span>Accesos Rápidos</span>
              </h2>
              <span className="text-2xs text-ide-text-muted">Espacio de trabajo local</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => setIsNewProjectModalOpen(true)}
                className="p-3 rounded-lg border border-ide-border bg-surface-900/60 hover:border-electric-500/40 hover:bg-surface-800 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-md bg-electric-500/15 flex items-center justify-center text-electric-400 mb-2 group-hover:scale-105 transition-transform">
                  <Plus className="w-4 h-4" />
                </div>
                <div className="font-semibold text-xs text-ide-text">Crear Proyecto</div>
                <div className="text-[10px] text-ide-text-muted">Desde plantilla o vacío</div>
              </button>

              <Link
                href="/ide"
                className="p-3 rounded-lg border border-ide-border bg-surface-900/60 hover:border-electric-500/40 hover:bg-surface-800 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-md bg-violet-500/15 flex items-center justify-center text-violet-400 mb-2 group-hover:scale-105 transition-transform">
                  <FolderOpen className="w-4 h-4" />
                </div>
                <div className="font-semibold text-xs text-ide-text">Abrir Workspace</div>
                <div className="text-[10px] text-ide-text-muted">Explorar código activo</div>
              </Link>

              <button
                onClick={() => setIsNewProjectModalOpen(true)}
                className="p-3 rounded-lg border border-ide-border bg-surface-900/60 hover:border-electric-500/40 hover:bg-surface-800 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-md bg-emerald-500/15 flex items-center justify-center text-emerald-400 mb-2 group-hover:scale-105 transition-transform">
                  <Github className="w-4 h-4" />
                </div>
                <div className="font-semibold text-xs text-ide-text">Clonar GitHub</div>
                <div className="text-[10px] text-ide-text-muted">Importar repositorio</div>
              </button>

              <Link
                href="/ide"
                className="p-3 rounded-lg border border-ide-border bg-surface-900/60 hover:border-electric-500/40 hover:bg-surface-800 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-md bg-yellow-500/15 flex items-center justify-center text-yellow-400 mb-2 group-hover:scale-105 transition-transform">
                  <Terminal className="w-4 h-4" />
                </div>
                <div className="font-semibold text-xs text-ide-text">Terminal Sandbox</div>
                <div className="text-[10px] text-ide-text-muted">Comandos aislados</div>
              </Link>
            </div>
          </div>

          {/* Card: Estado de Conexiones */}
          <div className="rounded-xl border border-ide-border bg-ide-panel p-5 space-y-3 shadow-sm">
            <h2 className="text-sm font-semibold text-ide-text flex items-center gap-2">
              <Activity className="w-4 h-4 text-violet-400" />
              <span>Estado del Sistema</span>
            </h2>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-surface-900/60 border border-ide-border/40">
                <div className="flex items-center gap-2">
                  <Server className="w-3.5 h-3.5 text-electric-400" />
                  <span className="text-ide-text">Backend NestJS</span>
                </div>
                <span className="flex items-center gap-1 text-[11px] text-ide-success font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-ide-success animate-pulse" />
                  Puerto 3001
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-surface-900/60 border border-ide-border/40">
                <div className="flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-ide-text">PostgreSQL 16</span>
                </div>
                <span className="flex items-center gap-1 text-[11px] text-ide-success font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-ide-success" />
                  Prisma Listo
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-surface-900/60 border border-ide-border/40">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-ide-text">Docker Sandbox</span>
                </div>
                <span className="flex items-center gap-1 text-[11px] text-ide-success font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-ide-success" />
                  Aislado
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-surface-900/60 border border-ide-border/40">
                <div className="flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-violet-400" />
                  <span className="text-ide-text">Asistente IA</span>
                </div>
                <span className="text-[11px] text-violet-400 font-mono">
                  Gemini / Claude
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Proyectos Recientes y Favoritos ─────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-base font-bold text-ide-text">Proyectos</h2>
              <div className="flex items-center gap-1 text-xs">
                <button
                  onClick={() => setFilterFavorite(false)}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    !filterFavorite
                      ? "bg-surface-800 text-ide-text font-semibold"
                      : "text-ide-text-muted hover:text-ide-text"
                  }`}
                >
                  Todos ({projects.length})
                </button>
                <button
                  onClick={() => setFilterFavorite(true)}
                  className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                    filterFavorite
                      ? "bg-surface-800 text-yellow-400 font-semibold"
                      : "text-ide-text-muted hover:text-ide-text"
                  }`}
                >
                  <Star className="w-3 h-3 fill-current" />
                  <span>Favoritos ({projects.filter((p) => p.isFavorite).length})</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsNewProjectModalOpen(true)}
              className="text-xs text-electric-400 hover:text-electric-300 transition-colors flex items-center gap-1"
            >
              <span>Crear nuevo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project) => (
              <Link
                key={project.id}
                href="/ide"
                className="p-5 rounded-xl border border-ide-border bg-ide-panel hover:border-electric-500/40 hover:bg-surface-850/60 transition-all flex flex-col justify-between group shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded bg-surface-800 border border-ide-border flex items-center justify-center text-electric-400 group-hover:scale-105 transition-transform">
                        <FolderOpen className="w-4 h-4" />
                      </div>
                      <h3 className="font-semibold text-sm text-ide-text group-hover:text-electric-300 transition-colors">
                        {project.name}
                      </h3>
                    </div>

                    <button
                      onClick={(e) => toggleFavorite(project.id, e)}
                      title={project.isFavorite ? "Quitar de favoritos" : "Marcar como favorito"}
                      className={`p-1 rounded hover:bg-surface-800 transition-colors ${
                        project.isFavorite ? "text-yellow-400" : "text-ide-text-muted hover:text-ide-text"
                      }`}
                    >
                      <Star className={`w-4 h-4 ${project.isFavorite ? "fill-current" : ""}`} />
                    </button>
                  </div>

                  <p className="text-xs text-ide-text-muted line-clamp-2 leading-relaxed mb-4">
                    {project.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-ide-border/40 flex items-center justify-between text-2xs text-ide-text-muted">
                  <div className="flex items-center gap-2">
                    <span className="font-mono px-1.5 py-0.5 rounded bg-surface-800 text-electric-400 border border-ide-border/60">
                      {project.language}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-violet-400">
                      <GitBranch className="w-3 h-3" />
                      <span>{project.branch}</span>
                    </span>
                  </div>

                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{project.lastOpened}</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Actividad Reciente y Tareas de IA ────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tareas de IA */}
          <div className="rounded-xl border border-ide-border bg-ide-panel p-5 space-y-4 shadow-sm">
            <h2 className="text-sm font-semibold text-ide-text flex items-center gap-2">
              <Cpu className="w-4 h-4 text-violet-400" />
              <span>Tareas Recientes del Agente IA</span>
            </h2>

            <div className="space-y-3">
              {[
                {
                  title: "Creación de FeatureCard y Header",
                  objective: "Generación de componentes modulares con Tailwind",
                  mode: "EDIT",
                  status: "Completada",
                },
                {
                  title: "Análisis de pruebas unitarias",
                  objective: "Configuración de suites de Vitest en modo estricto",
                  mode: "AGENT",
                  status: "Completada",
                },
              ].map((task, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-surface-900/40 border border-ide-border/60 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-semibold text-ide-text">{task.title}</div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-ide-success/15 text-ide-success border border-ide-success/30">
                      {task.status}
                    </span>
                  </div>
                  <p className="text-2xs text-ide-text-muted mb-2">{task.objective}</p>
                  <div className="text-[10px] font-mono text-violet-400">Modo: {task.mode}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Pruebas Recientes */}
          <div className="rounded-xl border border-ide-border bg-ide-panel p-5 space-y-4 shadow-sm">
            <h2 className="text-sm font-semibold text-ide-text flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-ide-success" />
              <span>Ejecuciones de Pruebas</span>
            </h2>

            <div className="space-y-3">
              {[
                {
                  suite: "src/utils.test.ts",
                  passed: 2,
                  failed: 0,
                  duration: "42ms",
                },
                {
                  suite: "src/components/Header.test.tsx",
                  passed: 2,
                  failed: 0,
                  duration: "86ms",
                },
              ].map((test, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-surface-900/40 border border-ide-border/60 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-ide-success shrink-0" />
                    <div>
                      <div className="font-mono text-ide-text">{test.suite}</div>
                      <div className="text-2xs text-ide-text-muted">{test.passed} pruebas exitosas</div>
                    </div>
                  </div>
                  <span className="font-mono text-2xs text-ide-text-muted">{test.duration}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* ── Modal: Crear Nuevo Proyecto ───────────────────────────────────── */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-ide-panel border border-ide-border rounded-xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-ide-border pb-3">
              <h3 className="font-semibold text-ide-text text-sm">Crear Nuevo Proyecto</h3>
              <button
                onClick={() => setIsNewProjectModalOpen(false)}
                className="text-ide-text-muted hover:text-ide-text"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-medium mb-1">Nombre del Proyecto</label>
                <input
                  type="text"
                  placeholder="ej. mi-proyecto-ia"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  autoFocus
                  className="ide-input py-1.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Plantilla Inicial</label>
                <div className="grid grid-cols-2 gap-2">
                  {["React", "Next.js", "Node.js", "Python", "NestJS API", "HTML/CSS"].map((temp) => (
                    <button
                      key={temp}
                      type="button"
                      onClick={() => setSelectedTemplate(temp)}
                      className={`p-2 rounded border text-left font-medium transition-colors ${
                        selectedTemplate === temp
                          ? "border-electric-500 bg-electric-600/20 text-electric-300"
                          : "border-ide-border bg-surface-900 text-ide-text-muted hover:text-ide-text"
                      }`}
                    >
                      {temp}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewProjectModalOpen(false)}
                  className="ide-btn-secondary px-3 py-1.5 text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newProjectName.trim()}
                  className="ide-btn-primary px-4 py-1.5 text-xs disabled:opacity-50"
                >
                  Crear e Iniciar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
