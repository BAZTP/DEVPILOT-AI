"use client";

import React, { useRef, useEffect } from "react";
import { useLayoutStore } from "@/stores/layoutStore";
import { FileExplorer } from "./FileExplorer";
import { GlobalSearch } from "./GlobalSearch";
import { SourceControl } from "./SourceControl";
import { ExtensionsView } from "./ExtensionsView";
import { AIHistoryView } from "./AIHistoryView";

export const SidebarPanel: React.FC = () => {
  const {
    isSidebarOpen,
    activeSidebarView,
    sidebarWidth,
    setSidebarWidth,
  } = useLayoutStore();

  const isResizingRef = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return;
      // ActivityBar tiene ancho de 48px
      const newWidth = e.clientX - 48;
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [setSidebarWidth]);

  if (!isSidebarOpen) return null;

  const renderActiveView = () => {
    switch (activeSidebarView) {
      case "explorer":
        return <FileExplorer />;
      case "search":
        return <GlobalSearch />;
      case "git":
        return <SourceControl />;
      case "extensions":
        return <ExtensionsView />;
      case "ai-history":
        return <AIHistoryView />;
      default:
        return <FileExplorer />;
    }
  };

  return (
    <div
      style={{ width: `${sidebarWidth}px` }}
      className="h-full bg-ide-panel border-r border-ide-border flex flex-col relative shrink-0 z-10"
    >
      <div className="flex-1 overflow-hidden">{renderActiveView()}</div>

      {/* ── Manija de redimensionamiento horizontal ─────────────────────── */}
      <div
        onMouseDown={(e) => {
          e.preventDefault();
          isResizingRef.current = true;
          document.body.style.cursor = "col-resize";
          document.body.style.userSelect = "none";
        }}
        className="absolute top-0 right-0 bottom-0 w-1 cursor-col-resize hover:bg-electric-500/50 transition-colors z-20"
      />
    </div>
  );
};
