"use client";

import { create } from "zustand";
import { getCatalog } from "@/lib/api/telegram-webapp.service";
import { TelegramApiError } from "@/lib/api/telegram-api-client";
import type { CatalogCategory, Product } from "@/types/telegram-webapp";

type CatalogStatus = "idle" | "loading" | "success" | "error";

type CatalogStore = {
  categories: CatalogCategory[];
  products: Product[];
  activeCategory: string;
  search: string;
  status: CatalogStatus;
  errorCode: "forbidden" | "bad_request" | "network" | "unknown" | null;
  errorMessage: string | null;
  setCategory: (category: string) => void;
  setSearch: (search: string) => void;
  loadCatalog: (params: {
    initData: string;
    category?: string;
    search?: string;
  }) => Promise<void>;
};

export const useCatalogStore = create<CatalogStore>((set) => ({
  categories: [],
  products: [],
  activeCategory: "",
  search: "",
  status: "idle",
  errorCode: null,
  errorMessage: null,
  setCategory: (category) => set({ activeCategory: category }),
  setSearch: (search) => set({ search }),
  loadCatalog: async ({ initData, category, search }) => {
    set({ status: "loading", errorCode: null, errorMessage: null });
    try {
      const data = await getCatalog(initData, { category, search });
      set({
        categories: data.categories,
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
}));
