"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface SearchState {
  isOpen:         boolean;
  recentSearches: string[];
  openSearch:     () => void;
  closeSearch:    () => void;
  addRecent:      (query: string) => void;
  clearRecent:    () => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      isOpen:         false,
      recentSearches: [],

      openSearch:  () => set({ isOpen: true }),
      closeSearch: () => set({ isOpen: false }),

      addRecent: (query) => {
        const q = query.trim();
        if (!q) return;
        const current = get().recentSearches.filter((s) => s.toLowerCase() !== q.toLowerCase());
        set({ recentSearches: [q, ...current].slice(0, 5) });
      },

      clearRecent: () => set({ recentSearches: [] }),
    }),
    {
      name: "denova-search",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ recentSearches: state.recentSearches }),
    }
  )
);