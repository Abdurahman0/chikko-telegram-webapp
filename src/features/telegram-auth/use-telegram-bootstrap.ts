"use client";

import { useEffect } from "react";
import {
  getTelegramInitData,
  getTelegramUser,
  getTelegramWebApp,
  initializeTelegramWebApp,
} from "@/lib/telegram/webapp";
import { useBootstrapStore } from "@/store/bootstrap-store";

export function useTelegramBootstrap() {
  const hasBootstrapped = useBootstrapStore((state) => state.hasBootstrapped);
  const status = useBootstrapStore((state) => state.status);
  const setTelegramContext = useBootstrapStore((state) => state.setTelegramContext);
  const fetchBootstrap = useBootstrapStore((state) => state.fetchBootstrap);

  useEffect(() => {
    if (hasBootstrapped || status === "loading") {
      return;
    }
    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 18;

    const tryBootstrap = () => {
      if (cancelled) {
        return;
      }

      const webApp = initializeTelegramWebApp();
      const initData = getTelegramInitData();

      setTelegramContext({
        initData,
        user: getTelegramUser(),
        theme: webApp?.themeParams ?? null,
        languageCode: webApp?.initDataUnsafe?.user?.language_code ?? null,
      });

      if (initData) {
        void fetchBootstrap();
        return;
      }

      if (attempts >= maxAttempts) {
        return;
      }

      attempts += 1;
      setTimeout(tryBootstrap, 150);
    };

    tryBootstrap();

    return () => {
      cancelled = true;
    };
  }, [hasBootstrapped, status, setTelegramContext, fetchBootstrap]);

  return {
    hasTelegramWebApp: Boolean(getTelegramWebApp()),
  };
}
