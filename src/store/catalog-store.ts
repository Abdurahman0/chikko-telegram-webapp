"use client";

import { create } from "zustand";
import { getCatalog } from "@/lib/api/telegram-webapp.service";
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
  lastRequestId: number;
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

function resolveCategoryToId(
  category: string | undefined,
  categories: CatalogCategory[],
): string | undefined {
  if (!category || category === "all") {
    return undefined;
  }

  const directMatch = categories.find((c) => c.id === category);
  if (directMatch) {
    return directMatch.id;
  }

  const codeMatch = categories.find((c) => c.code === category);
  if (codeMatch) {
    return codeMatch.id;
  }

  return category;
}

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

function applyClientSort(products: Product[], sort?: CatalogSortOption): Product[] {
  if (sort !== "high_rating") {
    return products;
  }
  return [...products].sort(
    (a, b) => (b.rating ?? 0) - (a.rating ?? 0) || (b.reviewsCount ?? 0) - (a.reviewsCount ?? 0),
  );
}

export const useCatalogStore = create<CatalogStore>((set, get) => ({
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
  lastRequestId: 0,
  resetFilters: () => set({
    search: "",
    brand: "",
    priceFrom: undefined,
    priceTo: undefined,
    sort: "popular"
  }),
  setCategory: (category: string) => {
    const targetCategory = category === "all" ? "" : category;
    const categoryId = resolveCategoryToId(targetCategory, get().categories);
    set({ activeCategory: categoryId ?? "", brand: "" });
  },
  setSearch: (search: string) => set({ search }),
  setBrand: (brand: string) => set({ brand }),
  setSort: (sort: CatalogSortOption) => set({ sort }),
  setPriceRange: (from?: number, to?: number) => set({ priceFrom: from, priceTo: to }),
  loadCatalog: async ({ initData, category, search, brand, priceFrom, priceTo, sort }) => {
    const queryKey = createCatalogQueryKey({ category, search, brand, priceFrom, priceTo, sort });
    const requestId = get().lastRequestId + 1;
    set({
      status: "loading",
      loadingQueryKey: queryKey,
      errorCode: null,
      errorMessage: null,
      lastRequestId: requestId,
    });
    try {
      // Use catalog endpoint consistently since it supports filtering by category UUID or code.
      const normalizedCategory = resolveCategoryToId(category, get().categories);
      const data = await getCatalog(initData, {
        category: normalizedCategory,
        search,
        brand,
        priceFrom,
        priceTo,
        sort,
      });

      set((state: CatalogStore) => ({
        ...(state.lastRequestId !== requestId
          ? {}
          : {
        categories: data.categories && data.categories.length > 0 ? data.categories : state.categories,
        promotedProducts: data.promotedProducts && data.promotedProducts.length > 0 ? data.promotedProducts : state.promotedProducts,
        products: applyClientSort(data.products, sort),
        brands: data.brands && data.brands.length > 0 ? data.brands : state.brands,
        status: "success",
        lastQueryKey: queryKey,
        loadingQueryKey: null,
        lastFetchedAt: Date.now(),
          }),
      }));
    } catch (error) {
      if (get().lastRequestId !== requestId) {
        return;
      }
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
