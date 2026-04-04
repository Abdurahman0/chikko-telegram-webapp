"use client";

import { create } from "zustand";
import { getCatalog } from "@/lib/api/telegram-webapp.service";
import { TelegramApiError } from "@/lib/api/telegram-api-client";
import type { CatalogCategory, Product } from "@/types/telegram-webapp";

type CatalogStatus = "idle" | "loading" | "success" | "error";

type CatalogStore = {
  categories: CatalogCategory[];
  promotedProducts: Product[];
  products: Product[];
  activeCategory: string;
  search: string;
  status: CatalogStatus;
  lastQueryKey: string | null;
  loadingQueryKey: string | null;
  lastFetchedAt: number;
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

function createCatalogQueryKey(params: { category?: string; search?: string }) {
  return `category=${params.category ?? ""};search=${params.search ?? ""}`;
}

export const useCatalogStore = create<CatalogStore>((set) => ({
  categories: [],
  promotedProducts: [],
  products: [],
  activeCategory: "",
  search: "",
  status: "idle",
  lastQueryKey: null,
  loadingQueryKey: null,
  lastFetchedAt: 0,
  errorCode: null,
  errorMessage: null,
  setCategory: (category) => set({ activeCategory: category }),
  setSearch: (search) => set({ search }),
  loadCatalog: async ({ initData, category, search }) => {
    const queryKey = createCatalogQueryKey({ category, search });
    set({
      status: "loading",
      loadingQueryKey: queryKey,
      errorCode: null,
      errorMessage: null,
    });
    try {
      const data = await getCatalog(initData, { category, search });
      set({
        categories: data.categories,
        promotedProducts: data.promotedProducts,
        products: data.products,
        status: "success",
        lastQueryKey: queryKey,
        loadingQueryKey: null,
        lastFetchedAt: Date.now(),
      });
    } catch (error) {
      if (error instanceof TelegramApiError) {
        set({
          status: "error",
          loadingQueryKey: null,
          errorCode: error.code,
          errorMessage: error.message,
        });
        return;
      }
      set({
        status: "error",
        loadingQueryKey: null,
        errorCode: "unknown",
        errorMessage: "Unknown error",
      });
    }
  },
}));
