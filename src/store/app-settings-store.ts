"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type AppSettingsStore = {
  notificationsEnabled: boolean;
  hapticsEnabled: boolean;
  autoPlayPromotions: boolean;
  compactCards: boolean;
  setNotificationsEnabled: (value: boolean) => void;
  setHapticsEnabled: (value: boolean) => void;
  setAutoPlayPromotions: (value: boolean) => void;
  setCompactCards: (value: boolean) => void;
};

export const useAppSettingsStore = create<AppSettingsStore>()(
  persist(
    (set) => ({
      notificationsEnabled: true,
      hapticsEnabled: true,
      autoPlayPromotions: true,
      compactCards: false,
      setNotificationsEnabled: (value) => set({ notificationsEnabled: value }),
      setHapticsEnabled: (value) => set({ hapticsEnabled: value }),
      setAutoPlayPromotions: (value) => set({ autoPlayPromotions: value }),
      setCompactCards: (value) => set({ compactCards: value }),
    }),
    {
      name: "chikko-app-settings",
    },
  ),
);
