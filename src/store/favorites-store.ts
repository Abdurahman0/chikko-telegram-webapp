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
  toggleFavorite: (params: { initData: string; product: Product }) => Promise<void>;
};

export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
  products: [],
  status: "idle",
  errorCode: null,
  errorMessage: null,
  loadFavorites: async ({ initData }) => {
    // If already loading or success, we can skip or only refresh if needed
    if (get().status === "loading") return;
    
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
  toggleFavorite: async ({ initData, product }) => {
    const previousProducts = get().products;
    const isCurrentlyFavorite = previousProducts.some(p => p.id === product.id);
    
    // OPTIMISTIC UPDATE
    let nextProducts;
    if (isCurrentlyFavorite) {
      nextProducts = previousProducts.filter(p => p.id !== product.id);
    } else {
      nextProducts = [...previousProducts, product];
    }
    
    set({ products: nextProducts });

    try {
      const data = await toggleFavorite(initData, product.id);
      // SYNC WITH SERVER
      // The server returns the full list of current favorites
      set({ products: data.products, status: "success" });
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      // ROLLBACK on error
      set({ products: previousProducts });
    }
  },
}));
