"use client";

import { useEffect, useRef } from "react";
import { useBootstrapStore } from "@/store/bootstrap-store";
import { useFavoritesStore } from "@/store/favorites-store";

export function AppInitializer() {
  const initData = useBootstrapStore((state) => state.initData);
  const hasBootstrapped = useBootstrapStore((state) => state.hasBootstrapped);
  const loadFavorites = useFavoritesStore((state) => state.loadFavorites);
  
  // Track if we've already performed the initial load to avoid redundant calls
  const hasInitialLoaded = useRef(false);

  useEffect(() => {
    // Only load once we have baseline Telegram data (initData)
    if (!hasBootstrapped || !initData || hasInitialLoaded.current) {
      return;
    }

    // Set flag and trigger global data loads
    hasInitialLoaded.current = true;
    
    // Global loads
    void loadFavorites({ initData });
    
  }, [hasBootstrapped, initData, loadFavorites]);

  return null;
}
