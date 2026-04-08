"use client";

import { create } from "zustand";
import { getFavorites, toggleFavorite } from "@/lib/api/telegram-webapp.service";
import { TelegramApiError } from "@/lib/api/telegram-api-client";
import type { Product } from "@/types/telegram-webapp";

type FavoritesStatus = "idle" | "loading" | "success" | "error";

type FavoritesStore = {
  products: Product[];
  loadStatus: FavoritesStatus;
  errorCode: string | null;
  errorMessage: string | null;
  // Track in-flight toggle requests.
  inFlightToggles: number;
  // Track the latest toggle request id to ignore stale responses.
  lastToggleRequestId: number;
  loadFavorites: (params: { initData: string }) => Promise<void>;
  toggleFavorite: (params: { initData: string; product: Product }) => Promise<void>;
};

export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
  products: [],
  loadStatus: "idle",
  errorCode: null,
  errorMessage: null,
  inFlightToggles: 0,
  lastToggleRequestId: 0,
  loadFavorites: async ({ initData }) => {
    if (get().loadStatus === "loading") return;
    
    set({ loadStatus: "loading", errorCode: null, errorMessage: null });
    try {
      const data = await getFavorites(initData);
      // Only update if no toggles happened while loading and data is valid
      if (data && get().inFlightToggles === 0) {
        set({
          products: data.products,
          loadStatus: "success",
        });
      } else if (data) {
        // Even if in-flight toggles > 0, we can still set success if we got data
        set({ loadStatus: "success" });
      }
    } catch (error) {
      if (error instanceof TelegramApiError) {
        set({
          loadStatus: "error",
          errorCode: error.code,
          errorMessage: error.message,
        });
        return;
      }
      set({
        loadStatus: "error",
        errorCode: "unknown",
        errorMessage: "Unknown error",
      });
    }
  },
  toggleFavorite: async ({ initData, product }) => {
    const productId = String(product.id);
    const requestId = get().lastToggleRequestId + 1;
    
    // Optimistic update
    set((state) => {
      const isFavorite = state.products.some((p) => String(p.id) === productId);
      const nextProducts = isFavorite
        ? state.products.filter((p) => String(p.id) !== productId)
        : [...state.products, product];
        
      return {
        products: nextProducts,
        inFlightToggles: state.inFlightToggles + 1,
        lastToggleRequestId: requestId,
      };
    });

    try {
      const data = await toggleFavorite(initData, productId);
      
      set((state) => {
        const nextInFlight = Math.max(0, state.inFlightToggles - 1);
        
        // Ignore out-of-order responses from older toggle requests.
        if (data && requestId === state.lastToggleRequestId) {
          return { 
            products: data.products, 
            inFlightToggles: nextInFlight,
            loadStatus: "success" 
          };
        }
        return { 
          inFlightToggles: nextInFlight 
        };
      });
    } catch (error) {
      console.error("Failed to toggle favorite:", error);

      set((state) => ({
        inFlightToggles: Math.max(0, state.inFlightToggles - 1),
      }));

      // If the latest request failed, resync from server state.
      if (requestId === get().lastToggleRequestId) {
        await get().loadFavorites({ initData });
      }
    }
  },
}));
