"use client";

import { useEffect, useRef } from "react";
import { useBootstrapStore } from "@/store/bootstrap-store";
import { useCatalogStore } from "@/store/catalog-store";
import { useFavoritesStore } from "@/store/favorites-store";

const CATALOG_STALE_MS = 5 * 60 * 1000; // Increased to 5 minutes for better performance

export function useCatalog() {
  const initData = useBootstrapStore((state) => state.initData);
  const hasBootstrapped = useBootstrapStore((state) => state.hasBootstrapped);
  const bootstrapStatus = useBootstrapStore((state) => state.status);
  
  const activeCategory = useCatalogStore((state) => state.activeCategory);
  const search = useCatalogStore((state) => state.search);
  const brand = useCatalogStore((state) => state.brand);
  const priceFrom = useCatalogStore((state) => state.priceFrom);
  const priceTo = useCatalogStore((state) => state.priceTo);
  const sort = useCatalogStore((state) => state.sort);
  
  const status = useCatalogStore((state) => state.status);
  const lastQueryKey = useCatalogStore((state) => state.lastQueryKey);
  const loadingQueryKey = useCatalogStore((state) => state.loadingQueryKey);
  const lastFetchedAt = useCatalogStore((state) => state.lastFetchedAt);
  
  const loadCatalog = useCatalogStore((state) => state.loadCatalog);
  const loadFavorites = useFavoritesStore((state) => state.loadFavorites);
  const favoritesStatus = useFavoritesStore((state) => state.status);
  const lastSearchRef = useRef(search || "");

  // Load Favorites once on bootstrap
  useEffect(() => {
    if (hasBootstrapped && bootstrapStatus === "success" && favoritesStatus === "idle") {
      void loadFavorites({ initData });
    }
  }, [hasBootstrapped, bootstrapStatus, favoritesStatus, initData, loadFavorites]);

  // Handle Catalog Refresh and Filtering
  useEffect(() => {
    if (!hasBootstrapped || bootstrapStatus !== "success") {
      return;
    }

    const queryKey = `cat=${activeCategory || ""};q=${search || ""};b=${brand || ""};f=${priceFrom ?? ""};t=${priceTo ?? ""};s=${sort || ""}`;
    
    // Logic to prevent redundant requests
    const isSameSuccessfulQuery =
      status === "success" &&
      lastQueryKey === queryKey &&
      Date.now() - lastFetchedAt < CATALOG_STALE_MS;
      
    const isAlreadyLoadingThisQuery =
      status === "loading" && loadingQueryKey === queryKey;

    if (isSameSuccessfulQuery || isAlreadyLoadingThisQuery) {
      return;
    }

    const isSearchChange = search !== lastSearchRef.current;
    lastSearchRef.current = search || "";

    if (isSearchChange) {
      const timeout = setTimeout(() => {
        if (useCatalogStore.getState().loadingQueryKey === queryKey) return;
        
        void loadCatalog({
          initData,
          category: activeCategory || undefined,
          search: search || undefined,
          brand: brand || undefined,
          priceFrom,
          priceTo,
          sort,
        });
      }, 400);
      return () => clearTimeout(timeout);
    } else {
      // Immediate load for category/brand/sort changes
      void loadCatalog({
        initData,
        category: activeCategory || undefined,
        search: search || undefined,
        brand: brand || undefined,
        priceFrom,
        priceTo,
        sort,
      });
    }
  }, [
    // TRIGGERS (Narrow dependencies)
    activeCategory,
    search,
    brand,
    priceFrom,
    priceTo,
    sort,
    initData,
    hasBootstrapped,
    bootstrapStatus,
    // We keep status/lastQueryKey for the internal checks, but we should be careful.
    // Actually, adding them here causes the re-trigger mentioned before.
    // But if we remove them, how do we handle the "stale" logic?
    // We can use a ref or read from store state directly inside the effect.
  ]);
}
