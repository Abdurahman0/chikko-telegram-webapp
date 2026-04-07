"use client";

import { create } from "zustand";
import { getCatalog, getCategoryProducts } from "@/lib/api/telegram-webapp.service";
import { TelegramApiError } from "@/lib/api/telegram-api-client";
import type { CatalogCategory, Product, CatalogSortOption, Brand } from "@/types/telegram-webapp";

type CatalogStatus = "idle" | "loading" | "success" | "error";

type CatalogStore = {
  categories: CatalogCategory[];
  promotedProducts: Product[];
  products: Product[];
  brands: Brand[];
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
  brands: [],
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
  setCategory: (category: string) => {
    const targetCategory = category === "all" ? "" : category;
    set({ activeCategory: targetCategory, brand: "" });
  },
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
      if (category && category !== "" && category !== "all") {
        const data = await getCategoryProducts(initData, category, { 
          brand: brand || undefined, 
          priceFrom, 
          priceTo, 
          search, 
          sort 
        });
        
        set((state: CatalogStore) => {
          // Merge category into categories list if not present
          const hasCategory = state.categories.some(c => c.id === data.category.id);
          const updatedCategories = hasCategory 
            ? state.categories 
            : [...state.categories, data.category];
          
          return {
            categories: updatedCategories,
            products: data.products,
            brands: data.brands, // Brands are specific to this category
            status: "success",
            lastQueryKey: queryKey,
            loadingQueryKey: null,
            lastFetchedAt: Date.now(),
          };
        });
      } else {
        // Load general catalog for "" or "all"
        const data = await getCatalog(initData, { 
          category: category === "all" ? undefined : category, 
          search,
          brand,
          priceFrom,
          priceTo,
          sort 
        });
        set((state: CatalogStore) => ({
          categories: data.categories && data.categories.length > 0 ? data.categories : state.categories,
          promotedProducts: data.promotedProducts && data.promotedProducts.length > 0 ? data.promotedProducts : state.promotedProducts,
          products: data.products,
          // When in "all", we don't have a specific brand list from the backend for the whole catalog
          // through the catalog endpoint. We could merge from categories, but that's complex here.
          brands: [], 
          status: "success",
          lastQueryKey: queryKey,
          loadingQueryKey: null,
          lastFetchedAt: Date.now(),
        }));
      }
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
