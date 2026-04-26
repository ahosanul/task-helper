import { create } from 'zustand';

export const useUIStore = create((set) => ({
  sidebarView: 'all', // 'all' | 'today' | 'pinned' | 'tag:{id}'
  detailPanelOpen: false,
  miniBoardVisible: false,
  syncStatus: 'idle', // 'idle' | 'syncing' | 'error' | 'offline'
  lastSyncedAt: null,
  isOnline: navigator.onLine,

  setSidebarView: (sidebarView) => set({ sidebarView }),
  toggleDetailPanel: () => set((state) => ({ detailPanelOpen: !state.detailPanelOpen })),
  setDetailPanelOpen: (detailPanelOpen) => set({ detailPanelOpen }),
  toggleMiniBoard: async () => {
    // This will be handled by main process via IPC in future
    set((state) => ({ miniBoardVisible: !state.miniBoardVisible }));
  },
  setSyncStatus: (syncStatus) => set({ syncStatus }),
  setLastSyncedAt: (lastSyncedAt) => set({ lastSyncedAt }),
  setIsOnline: (isOnline) => set({ isOnline }),
}));
