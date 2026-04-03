"use client";

import { useEffect } from "react";
import { useBootstrapStore } from "@/store/bootstrap-store";
import { useCatalogStore } from "@/store/catalog-store";

export function useCatalog() {
  const initData = useBootstrapStore((state) => state.initData);
  const hasBootstrapped = useBootstrapStore((state) => state.hasBootstrapped);
  const activeCategory = useCatalogStore((state) => state.activeCategory);
  const search = useCatalogStore((state) => state.search);
  const loadCatalog = useCatalogStore((state) => state.loadCatalog);

  useEffect(() => {
    if (!hasBootstrapped) {
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
  }, [activeCategory, search, initData, loadCatalog, hasBootstrapped]);
}
