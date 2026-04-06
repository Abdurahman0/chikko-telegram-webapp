"use client";

import { create } from "zustand";
import { getCatalog, getCategoryProducts } from "@/lib/api/telegram-webapp.service";
import { TelegramApiError } from "@/lib/api/telegram-api-client";
import type { CatalogCategory, Product, CatalogSortOption } from "@/types/telegram-webapp";

type CatalogStatus = "idle" | "loading" | "success" | "error";

type CatalogStore = {
  categories: CatalogCategory[];
  promotedProducts: Product[];
  products: Product[];
  activeCategory: string;
  search: string;
  brand: string;
  priceFrom: number | undefined;
  priceTo: number | undefined;
  sort: CatalogSortOption;
  status: CatalogStatus;
  lastQueryKey: string | null;
  loadingQueryKey: string | null;
  lastFetchedAt: number;
  errorCode: "forbidden" | "bad_request" | "network" | "unknown" | null;
  errorMessage: string | null;
  resetFilters: () => void;
  setCategory: (category: string) => void;
  setSearch: (search: string) => void;
  setBrand: (brand: string) => void;
  setSort: (sort: CatalogSortOption) => void;
  setPriceRange: (from?: number, to?: number) => void;
  loadCatalog: (params: {
    initData: string;
    category?: string;
    search?: string;
    brand?: string;
    priceFrom?: number;
    priceTo?: number;
    sort?: CatalogSortOption;
  }) => Promise<void>;
};

function createCatalogQueryKey(params: {
  category?: string;
  search?: string;
  brand?: string;
  priceFrom?: number;
  priceTo?: number;
  sort?: CatalogSortOption;
}) {
  return `category=${params.category ?? ""};search=${params.search ?? ""};brand=${params.brand ?? ""};from=${params.priceFrom ?? ""};to=${params.priceTo ?? ""};sort=${params.sort ?? ""}`;
}

export const useCatalogStore = create<CatalogStore>((set) => ({
  categories: [],
  promotedProducts: [],
  products: [],
  activeCategory: "",
  search: "",
  brand: "",
  priceFrom: undefined,
  priceTo: undefined,
  sort: "popular",
  status: "idle",
  lastQueryKey: null,
  loadingQueryKey: null,
  lastFetchedAt: 0,
  errorCode: null,
  errorMessage: null,
  resetFilters: () => set({
    search: "",
    brand: "",
    priceFrom: undefined,
    priceTo: undefined,
    sort: "popular"
  }),
  setCategory: (category: string) => set({ activeCategory: category }),
  setSearch: (search: string) => set({ search }),
  setBrand: (brand: string) => set({ brand }),
  setSort: (sort: CatalogSortOption) => set({ sort }),
  setPriceRange: (from?: number, to?: number) => set({ priceFrom: from, priceTo: to }),
  loadCatalog: async ({ initData, category, search, brand, priceFrom, priceTo, sort }) => {
    const queryKey = createCatalogQueryKey({ category, search, brand, priceFrom, priceTo, sort });
    set({
      status: "loading",
      loadingQueryKey: queryKey,
      errorCode: null,
      errorMessage: null,
    });
    try {
      let data;
      if (category && category !== "") {
        const detailData = await getCategoryProducts(initData, category, {
          brand,
          priceFrom,
          priceTo,
          search,
          sort,
        });
        // Adapt detailData to the format expected by the rest of the store logic
        data = {
          categories: [], // chips already have categories
          promotedProducts: [], 
          products: detailData.products,
        };
      } else {
        data = await getCatalog(initData, { category, search });
      }

      set((state: CatalogStore) => ({
        categories: data.categories && data.categories.length > 0 ? data.categories : state.categories,
        promotedProducts: data.promotedProducts && data.promotedProducts.length > 0 ? data.promotedProducts : state.promotedProducts,
        products: data.products,
        status: "success",
        lastQueryKey: queryKey,
        loadingQueryKey: null,
        lastFetchedAt: Date.now(),
      }));
    } catch (error) {
      if (error instanceof TelegramApiError) {
        set({
          status: "error",
          lastQueryKey: queryKey,
          loadingQueryKey: null,
          errorCode: error.code,
          errorMessage: error.message,
        });
        return;
      }
      set({
        status: "error",
        lastQueryKey: queryKey,
        loadingQueryKey: null,
        errorCode: "unknown",
        errorMessage: "Unknown error",
      });
    }
  },
}));
