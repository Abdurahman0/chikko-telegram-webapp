"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type AppSettingsStore = {
  hideOutOfStock: boolean;
  hapticsEnabled: boolean;
  autoPlayPromotions: boolean;
  compactCards: boolean;
  setHideOutOfStock: (value: boolean) => void;
  setHapticsEnabled: (value: boolean) => void;
  setAutoPlayPromotions: (value: boolean) => void;
  setCompactCards: (value: boolean) => void;
};

export const useAppSettingsStore = create<AppSettingsStore>()(
  persist(
    (set) => ({
      hideOutOfStock: false,
      hapticsEnabled: true,
      autoPlayPromotions: true,
      compactCards: false,
      setHideOutOfStock: (value) => set({ hideOutOfStock: value }),
      setHapticsEnabled: (value) => set({ hapticsEnabled: value }),
      setAutoPlayPromotions: (value) => set({ autoPlayPromotions: value }),
      setCompactCards: (value) => set({ compactCards: value }),
    }),
    {
      name: "chikko-app-settings",
    },
  ),
);
