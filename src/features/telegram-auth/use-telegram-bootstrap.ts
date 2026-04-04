"use client";

import { useEffect } from "react";
import {
  ensureTelegramWebAppScript,
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

    const tryBootstrap = () => {
      if (cancelled) {
        return;
      }

      ensureTelegramWebAppScript();
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
      }
    };

    tryBootstrap();
    const timer = window.setInterval(tryBootstrap, 1000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [hasBootstrapped, status, setTelegramContext, fetchBootstrap]);

  return {
    hasTelegramWebApp: Boolean(getTelegramWebApp()),
  };
}
