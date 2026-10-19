"use client";

import React from "react";
import { MessageSquare, Clock, ArrowRight, Trash2 } from "lucide-react";
import { useLayoutStore } from "@/stores/layoutStore";
import { useAIStore } from "@/stores/aiStore";

interface ConversationHistoryItem {
  id: string;
  title: string;
  preview: string;
  date: string;
  mode: "CHAT" | "PLAN" | "EDIT" | "AGENT";
  messageCount: number;
}

const HISTORY_MOCK: ConversationHistoryItem[] = [
  {
    id: "conv-1",
    title: "Creación de FeatureCard y Header",
    preview: "Diseño e implementación de componentes modulares con Tailwind...",
    date: "Hoy, 15:30",
    mode: "EDIT",
    messageCount: 8,
  },
  {
    id: "conv-2",
    title: "Plan de arquitectura para DevPilot AI",
    preview: "Desglose de tareas por fases, modelos Prisma y contenedores Docker...",
    date: "Ayer, 18:45",
    mode: "PLAN",
    messageCount: 14,
  },
  {
    id: "conv-3",
    title: "Optimización de types de utils.ts",
    preview: "Corrección de tipos TypeScript estrictos y formateo de bytes...",
    date: "17 Oct, 11:20",
    mode: "CHAT",
    messageCount: 4,
  },
];

export const AIHistoryView: React.FC = () => {
  const { setAIPanelOpen } = useLayoutStore();
  const { setMode } = useAIStore();

  const handleResume = (item: ConversationHistoryItem) => {
    setMode(item.mode);
    setAIPanelOpen(true);
  };

  return (
    <div className="h-full flex flex-col select-none text-xs">
      <div className="h-9 px-3 border-b border-ide-border flex items-center justify-between text-ide-text-muted">
        <span className="text-2xs font-semibold uppercase tracking-wider text-ide-text">
          Historial de Conversaciones
        </span>
        <span className="text-2xs text-ide-text-muted">{HISTORY_MOCK.length} sesiones</span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {HISTORY_MOCK.map((item) => (
          <div
            key={item.id}
            onClick={() => handleResume(item)}
            className="p-3 rounded-lg border border-ide-border bg-surface-900/40 hover:border-electric-500/40 hover:bg-surface-800/40 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-2xs font-mono font-bold px-1.5 py-0.5 rounded bg-violet-950/60 text-violet-400 border border-violet-800/40">
                {item.mode}
              </span>
              <div className="flex items-center gap-1 text-[10px] text-ide-text-muted">
                <Clock className="w-3 h-3" />
                <span>{item.date}</span>
              </div>
            </div>

            <h4 className="font-semibold text-ide-text text-xs mb-1 group-hover:text-electric-300 transition-colors">
              {item.title}
            </h4>

            <p className="text-2xs text-ide-text-muted line-clamp-2 leading-relaxed mb-2">
              {item.preview}
            </p>

            <div className="flex items-center justify-between pt-1 border-t border-ide-border/30 text-[10px] text-ide-text-muted">
              <span>{item.messageCount} mensajes</span>
              <span className="flex items-center gap-1 text-electric-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Continuar</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
