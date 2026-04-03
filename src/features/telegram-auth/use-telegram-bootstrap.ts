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

    const webApp = initializeTelegramWebApp();
    setTelegramContext({
      initData: getTelegramInitData(),
      user: getTelegramUser(),
      theme: webApp?.themeParams ?? null,
      languageCode: webApp?.initDataUnsafe?.user?.language_code ?? null,
    });

    void fetchBootstrap();
  }, [hasBootstrapped, status, setTelegramContext, fetchBootstrap]);

  return {
    hasTelegramWebApp: Boolean(getTelegramWebApp()),
  };
}
