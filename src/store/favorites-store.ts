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
  // Use a counter to track in-flight toggle requests and avoid race conditions
  inFlightToggles: number;
  loadFavorites: (params: { initData: string }) => Promise<void>;
  toggleFavorite: (params: { initData: string; product: Product }) => Promise<void>;
};

export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
  products: [],
  status: "idle",
  errorCode: null,
  errorMessage: null,
  inFlightToggles: 0,
  loadFavorites: async ({ initData }) => {
    if (get().status === "loading") return;
    
    set({ status: "loading", errorCode: null, errorMessage: null });
    try {
      const data = await getFavorites(initData);
      // Only update if no toggles happened while loading
      if (get().inFlightToggles === 0) {
        set({
          products: data.products,
          status: "success",
        });
      }
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
    const isCurrentlyFavorite = previousProducts.some(p => String(p.id) === String(product.id));
    
    // Increment in-flight toggle counter
    set((state) => ({ inFlightToggles: state.inFlightToggles + 1 }));

    // OPTIMISTIC UPDATE
    let nextProducts;
    if (isCurrentlyFavorite) {
      nextProducts = previousProducts.filter(p => String(p.id) !== String(product.id));
    } else {
      nextProducts = [...previousProducts, product];
    }
    
    set({ products: nextProducts });

    try {
      const data = await toggleFavorite(initData, product.id);
      
      set((state) => {
        const nextInFlight = state.inFlightToggles - 1;
        // Only sync the full list from server if this was the LAST in-flight request
        // This prevents intermediate server responses from overwriting newer local states
        if (nextInFlight === 0) {
          return { products: data.products, inFlightToggles: 0, status: "success" };
        }
        return { inFlightToggles: nextInFlight };
      });
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      // Rollback and decrement
      set((state) => ({ 
        products: previousProducts, 
        inFlightToggles: Math.max(0, state.inFlightToggles - 1) 
      }));
    }
  },
}));
