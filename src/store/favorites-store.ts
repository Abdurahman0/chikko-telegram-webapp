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
  // Use a counter to track in-flight toggle requests and avoid race conditions
  inFlightToggles: number;
  loadFavorites: (params: { initData: string }) => Promise<void>;
  toggleFavorite: (params: { initData: string; product: Product }) => Promise<void>;
};

export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
  products: [],
  loadStatus: "idle",
  errorCode: null,
  errorMessage: null,
  inFlightToggles: 0,
  loadFavorites: async ({ initData }) => {
    if (get().loadStatus === "loading") return;
    
    set({ loadStatus: "loading", errorCode: null, errorMessage: null });
    try {
      const data = await getFavorites(initData);
      // Only update if no toggles happened while loading
      if (get().inFlightToggles === 0) {
        set({
          products: data.products,
          loadStatus: "success",
        });
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
    
    // Optimistic update
    set((state) => {
      const isFavorite = state.products.some((p) => String(p.id) === productId);
      const nextProducts = isFavorite
        ? state.products.filter((p) => String(p.id) !== productId)
        : [...state.products, product];
        
      return {
        products: nextProducts,
        inFlightToggles: state.inFlightToggles + 1,
      };
    });

    try {
      const data = await toggleFavorite(initData, productId);
      
      set((state) => {
        const nextInFlight = state.inFlightToggles - 1;
        
        // Only update products list from server if this was the last in-flight request
        if (nextInFlight === 0) {
          return { 
            products: data.products, 
            inFlightToggles: 0, 
            loadStatus: "success" 
          };
        }
        return { 
          inFlightToggles: nextInFlight 
        };
      });
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      
      // Revert optimistic update
      set((state) => {
        const isFavorite = state.products.some((p) => String(p.id) === productId);
        const nextProducts = isFavorite
          ? state.products.filter((p) => String(p.id) !== productId)
          : [...state.products, product];
          
        return {
          products: nextProducts,
          inFlightToggles: Math.max(0, state.inFlightToggles - 1),
        };
      });
    }
  },
}));
