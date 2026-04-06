"use client";

import { useEffect } from "react";
import { useBootstrapStore } from "@/store/bootstrap-store";
import { useCatalogStore } from "@/store/catalog-store";

const CATALOG_STALE_MS = 2 * 60 * 1000;

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

  useEffect(() => {
    if (!hasBootstrapped || bootstrapStatus !== "success") {
      return;
    }

    const queryKey = `category=${activeCategory || ""};search=${search || ""};brand=${brand || ""};from=${priceFrom ?? ""};to=${priceTo ?? ""};sort=${sort || ""}`;
    const isSameSuccessfulQuery =
      status === "success" &&
      lastQueryKey === queryKey &&
      Date.now() - lastFetchedAt < CATALOG_STALE_MS;
    const isAlreadyLoadingThisQuery =
      status === "loading" && loadingQueryKey === queryKey;
    const isSameFailedQuery =
      status === "error" && lastQueryKey === queryKey;

    if (isSameSuccessfulQuery || isAlreadyLoadingThisQuery || isSameFailedQuery) {
      return;
    }

    const timeout = setTimeout(() => {
      void loadCatalog({
        initData,
        category: activeCategory || undefined,
        search: search || undefined,
        brand: brand || undefined,
        priceFrom,
        priceTo,
        sort,
      });
    }, 300);

    return () => clearTimeout(timeout);
  }, [
    activeCategory,
    search,
    brand,
    priceFrom,
    priceTo,
    sort,
    initData,
    loadCatalog,
    hasBootstrapped,
    bootstrapStatus,
    status,
    lastQueryKey,
    loadingQueryKey,
    lastFetchedAt,
  ]);
}
