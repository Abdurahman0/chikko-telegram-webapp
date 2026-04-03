"use client";

import { useEffect } from "react";
import { useBootstrapStore } from "@/store/bootstrap-store";
import { useCatalogStore } from "@/store/catalog-store";

const CATALOG_STALE_MS = 2 * 60 * 1000;

export function useCatalog() {
  const initData = useBootstrapStore((state) => state.initData);
  const hasBootstrapped = useBootstrapStore((state) => state.hasBootstrapped);
  const activeCategory = useCatalogStore((state) => state.activeCategory);
  const search = useCatalogStore((state) => state.search);
  const status = useCatalogStore((state) => state.status);
  const lastQueryKey = useCatalogStore((state) => state.lastQueryKey);
  const loadingQueryKey = useCatalogStore((state) => state.loadingQueryKey);
  const lastFetchedAt = useCatalogStore((state) => state.lastFetchedAt);
  const loadCatalog = useCatalogStore((state) => state.loadCatalog);

  useEffect(() => {
    if (!hasBootstrapped) {
      return;
    }

    const queryKey = `category=${activeCategory || ""};search=${search || ""}`;
    const isSameSuccessfulQuery =
      status === "success" &&
      lastQueryKey === queryKey &&
      Date.now() - lastFetchedAt < CATALOG_STALE_MS;
    const isAlreadyLoadingThisQuery =
      status === "loading" && loadingQueryKey === queryKey;

    if (isSameSuccessfulQuery || isAlreadyLoadingThisQuery) {
      return;
    }

    const timeout = setTimeout(() => {
      void loadCatalog({
        initData,
        category: activeCategory || undefined,
        search: search || undefined,
      });
    }, 300);

    return () => clearTimeout(timeout);
  }, [
    activeCategory,
    search,
    initData,
    loadCatalog,
    hasBootstrapped,
    status,
    lastQueryKey,
    loadingQueryKey,
    lastFetchedAt,
  ]);
}
