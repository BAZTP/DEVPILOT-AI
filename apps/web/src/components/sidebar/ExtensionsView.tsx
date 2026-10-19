"use client";

import React, { useState } from "react";
import { Boxes, Check, Download, Search, ShieldCheck } from "lucide-react";

interface ExtensionItem {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  installed: boolean;
  official: boolean;
}

const EXTENSIONS_LIST: ExtensionItem[] = [
  {
    id: "ext-ts",
    name: "TypeScript Language Tools",
    description: "Autocompletado, tipos inteligentes y diagnósticos en tiempo real.",
    version: "v5.7.2",
    author: "DevPilot Core",
    installed: true,
    official: true,
  },
  {
    id: "ext-tailwind",
    name: "Tailwind CSS IntelliSense",
    description: "Autocompletado de clases de utilidad, vistas previas de color y linting.",
    version: "v0.12.0",
    author: "DevPilot Core",
    installed: true,
    official: true,
  },
  {
    id: "ext-vitest",
    name: "Vitest Runner & Explorer",
    description: "Ejecución visual de pruebas unitarias y de integración desde el IDE.",
    version: "v2.1.8",
    author: "DevPilot Testing",
    installed: true,
    official: true,
  },
  {
    id: "ext-eslint",
    name: "ESLint Code Quality",
    description: "Detección automática de errores de sintaxis y patrones de código no seguros.",
    version: "v9.16.0",
    author: "DevPilot Linter",
    installed: true,
    official: true,
  },
  {
    id: "ext-python",
    name: "Python LSP & Ruff",
    description: "Soporte de edición para archivos Python con Ruff linter y Pytest.",
    version: "v1.4.0",
    author: "DevPilot Core",
    installed: false,
    official: true,
  },
];

export const ExtensionsView: React.FC = () => {
  const [query, setQuery] = useState("");
  const [extensions, setExtensions] = useState(EXTENSIONS_LIST);

  const filtered = extensions.filter(
    (e) =>
      e.name.toLowerCase().includes(query.toLowerCase()) ||
      e.description.toLowerCase().includes(query.toLowerCase())
  );

  const toggleInstall = (id: string) => {
    setExtensions((prev) =>
      prev.map((ext) => (ext.id === id ? { ...ext, installed: !ext.installed } : ext))
    );
  };

  return (
    <div className="h-full flex flex-col select-none text-xs">
      <div className="h-9 px-3 border-b border-ide-border flex items-center justify-between text-ide-text-muted">
        <span className="text-2xs font-semibold uppercase tracking-wider text-ide-text">
          Extensiones
        </span>
        <span className="text-2xs text-ide-text-muted">
          {extensions.filter((e) => e.installed).length} instaladas
        </span>
      </div>

      <div className="p-3 border-b border-ide-border">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Buscar extensiones..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="ide-input pl-8 py-1.5 text-xs"
          />
          <Search className="w-3.5 h-3.5 text-ide-text-muted absolute left-2.5" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {filtered.map((ext) => (
          <div
            key={ext.id}
            className="p-3 rounded-lg border border-ide-border bg-surface-900/40 hover:border-ide-border/80 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-surface-800 border border-ide-border flex items-center justify-center shrink-0">
                  <Boxes className="w-4 h-4 text-electric-400" />
                </div>
                <div>
                  <div className="font-semibold text-ide-text flex items-center gap-1.5">
                    <span>{ext.name}</span>
                    {ext.official && (
                      <span title="Extensión oficial">
                        <ShieldCheck className="w-3.5 h-3.5 text-electric-400" />
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-ide-text-muted">
                    {ext.author} · {ext.version}
                  </div>
                </div>
              </div>

              <button
                onClick={() => toggleInstall(ext.id)}
                className={`ide-btn px-2.5 py-1 text-2xs rounded ${
                  ext.installed
                    ? "bg-surface-800 text-ide-text border border-ide-border hover:bg-surface-700"
                    : "ide-btn-primary"
                }`}
              >
                {ext.installed ? (
                  <>
                    <Check className="w-3 h-3 text-ide-success" />
                    <span>Instalada</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3 h-3" />
                    <span>Instalar</span>
                  </>
                )}
              </button>
            </div>
            <p className="mt-2 text-2xs text-ide-text-muted leading-relaxed">
              {ext.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
