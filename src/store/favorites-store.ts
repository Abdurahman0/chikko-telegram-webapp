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
    // Increment in-flight toggle counter
    set((state) => ({ 
      status: "loading",
      inFlightToggles: state.inFlightToggles + 1 
    }));

    try {
      const data = await toggleFavorite(initData, String(product.id));
      
      set((state) => {
        const nextInFlight = state.inFlightToggles - 1;
        
        // Only update the products list if this is the latest result
        if (nextInFlight === 0) {
          return { 
            products: data.products, 
            inFlightToggles: 0, 
            status: "success" 
          };
        }
        return { 
          inFlightToggles: nextInFlight 
        };
      });
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      set((state) => ({ 
        status: "error",
        inFlightToggles: Math.max(0, state.inFlightToggles - 1) 
      }));
    }
  },
}));
