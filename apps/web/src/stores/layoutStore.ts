import { create } from "zustand";

export type SidebarView =
  | "explorer"
  | "search"
  | "git"
  | "extensions"
  | "ai-history";

export type BottomTab =
  | "terminal"
  | "output"
  | "problems"
  | "tests"
  | "logs";

interface LayoutState {
  // Paneles visibles
  isSidebarOpen: boolean;
  activeSidebarView: SidebarView;
  isBottomPanelOpen: boolean;
  activeBottomTab: BottomTab;
  isAIPanelOpen: boolean;
  isZenMode: boolean;

  // Dimensiones
  sidebarWidth: number;
  bottomPanelHeight: number;
  aiPanelWidth: number;

  // Modales
  isSettingsOpen: boolean;
  isPreviewOpen: boolean;
  previewUrl: string;

  // Acciones
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveSidebarView: (view: SidebarView) => void;
  toggleBottomPanel: () => void;
  setBottomPanelOpen: (open: boolean) => void;
  setActiveBottomTab: (tab: BottomTab) => void;
  toggleAIPanel: () => void;
  setAIPanelOpen: (open: boolean) => void;
  toggleZenMode: () => void;
  setSidebarWidth: (width: number) => void;
  setBottomPanelHeight: (height: number) => void;
  setAIPanelWidth: (width: number) => void;
  setSettingsOpen: (open: boolean) => void;
  setPreviewOpen: (open: boolean, url?: string) => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  isSidebarOpen: true,
  activeSidebarView: "explorer",
  isBottomPanelOpen: true,
  activeBottomTab: "terminal",
  isAIPanelOpen: true,
  isZenMode: false,

  sidebarWidth: 260,
  bottomPanelHeight: 220,
  aiPanelWidth: 380,

  isSettingsOpen: false,
  isPreviewOpen: false,
  previewUrl: "http://localhost:3000",

  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  setActiveSidebarView: (view) =>
    set((state) => ({
      activeSidebarView: view,
      isSidebarOpen: state.activeSidebarView === view && state.isSidebarOpen ? false : true,
    })),

  toggleBottomPanel: () =>
    set((state) => ({ isBottomPanelOpen: !state.isBottomPanelOpen })),
  setBottomPanelOpen: (open) => set({ isBottomPanelOpen: open }),
  setActiveBottomTab: (tab) =>
    set({ activeBottomTab: tab, isBottomPanelOpen: true }),

  toggleAIPanel: () =>
    set((state) => ({ isAIPanelOpen: !state.isAIPanelOpen })),
  setAIPanelOpen: (open) => set({ isAIPanelOpen: open }),

  toggleZenMode: () =>
    set((state) => {
      const nextZen = !state.isZenMode;
      return {
        isZenMode: nextZen,
        isSidebarOpen: !nextZen,
        isBottomPanelOpen: !nextZen,
        isAIPanelOpen: !nextZen,
      };
    }),

  setSidebarWidth: (width) => set({ sidebarWidth: Math.max(180, Math.min(width, 500)) }),
  setBottomPanelHeight: (height) =>
    set({ bottomPanelHeight: Math.max(120, Math.min(height, 600)) }),
  setAIPanelWidth: (width) =>
    set({ aiPanelWidth: Math.max(280, Math.min(width, 600)) }),

  setSettingsOpen: (open) => set({ isSettingsOpen: open }),
  setPreviewOpen: (open, url) =>
    set((state) => ({
      isPreviewOpen: open,
      previewUrl: url ?? state.previewUrl,
    })),
}));
