"use client";

import { create } from "zustand";
import { getFavorites, toggleFavorite } from "@/lib/api/telegram-webapp.service";
import { TelegramApiError } from "@/lib/api/telegram-api-client";
import type { Product } from "@/types/telegram-webapp";

type FavoritesStatus = "idle" | "loading" | "success" | "error";

type FavoritesStore = {
  products: Product[];
  status: FavoritesStatus;
  errorCode: string | null;
  errorMessage: string | null;
  loadFavorites: (params: { initData: string }) => Promise<void>;
  toggleFavorite: (params: { initData: string; productId: string }) => Promise<void>;
};

export const useFavoritesStore = create<FavoritesStore>((set) => ({
  products: [],
  status: "idle",
  errorCode: null,
  errorMessage: null,
  loadFavorites: async ({ initData }) => {
    set({ status: "loading", errorCode: null, errorMessage: null });
    try {
      const data = await getFavorites(initData);
      set({
        products: data.products,
        status: "success",
      });
    } catch (error) {
      if (error instanceof TelegramApiError) {
        set({
          status: "error",
          errorCode: error.code,
          errorMessage: error.message,
        });
        return;
      }
      set({
        status: "error",
        errorCode: "unknown",
        errorMessage: "Unknown error",
      });
    }
  },
  toggleFavorite: async ({ initData, productId }) => {
    try {
      const data = await toggleFavorite(initData, productId);
      set({ products: data.products });
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  },
}));
