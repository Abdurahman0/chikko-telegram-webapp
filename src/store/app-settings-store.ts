"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type AppSettingsStore = {
  hideOutOfStock: boolean;
  showStockLabel: boolean;
  autoPlayPromotions: boolean;
  compactCards: boolean;
  setHideOutOfStock: (value: boolean) => void;
  setShowStockLabel: (value: boolean) => void;
  setAutoPlayPromotions: (value: boolean) => void;
  setCompactCards: (value: boolean) => void;
};

export const useAppSettingsStore = create<AppSettingsStore>()(
  persist(
    (set) => ({
      hideOutOfStock: false,
      showStockLabel: true,
      autoPlayPromotions: true,
      compactCards: false,
      setHideOutOfStock: (value) => set({ hideOutOfStock: value }),
      setShowStockLabel: (value) => set({ showStockLabel: value }),
      setAutoPlayPromotions: (value) => set({ autoPlayPromotions: value }),
      setCompactCards: (value) => set({ compactCards: value }),
    }),
    {
      name: "chikko-app-settings",
    },
  ),
);
