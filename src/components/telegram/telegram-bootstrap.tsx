"use client";

import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/components/shared/locale-provider";
import { useTelegramBootstrap } from "@/features/telegram-auth/use-telegram-bootstrap";
import { useBootstrapStore } from "@/store/bootstrap-store";
import { Button } from "@/components/shared/button";
import { getTelegramDebugSnapshot, type TelegramDebugSnapshot } from "@/lib/telegram/webapp";

export function TelegramBootstrap() {
  useTelegramBootstrap();
  const { messages } = useI18n();
  const status = useBootstrapStore((state) => state.status);
  const errorCode = useBootstrapStore((state) => state.errorCode);
  const errorMessageRaw = useBootstrapStore((state) => state.errorMessage);
  const fetchBootstrap = useBootstrapStore((state) => state.fetchBootstrap);
  const initDataInStore = useBootstrapStore((state) => state.initData);
  const [debug, setDebug] = useState<TelegramDebugSnapshot>(() => getTelegramDebugSnapshot());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setDebug(getTelegramDebugSnapshot());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const errorMessage = useMemo(() => {
    if (!errorCode) {
      return null;
    }
    if (errorCode === "forbidden") {
      return messages.bootstrap.forbidden;
    }
    if (errorCode === "network") {
      return messages.bootstrap.network;
    }
    return messages.checkout.failed;
  }, [errorCode, messages]);

  const debugPanel = (
    <div className="mb-4 rounded-2xl border border-surface-accent bg-surface px-3 py-2.5">
      <p className="text-xs font-semibold text-app-muted">Telegram Debug</p>
      <div className="mt-2 space-y-1 font-mono text-[11px] leading-4 text-app-muted">
        <p>status={status}</p>
        <p>errorCode={errorCode ?? "-"}</p>
        <p>errorMessage={errorMessageRaw ?? "-"}</p>
        <p>hasTelegram={String(debug.hasTelegramObject)}</p>
        <p>hasWebApp={String(debug.hasWebAppObject)}</p>
        <p>initDataSource={debug.initDataSource}</p>
        <p>initDataLen={debug.initDataLength}</p>
        <p>storeInitDataLen={initDataInStore.length}</p>
        <p>search={debug.search || "-"}</p>
        <p>hash={debug.hash || "-"}</p>
      </div>
    </div>
  );

  if (status === "loading") {
    return (
      <>
        {debugPanel}
        <div className="mb-4 rounded-2xl bg-brand-soft px-4 py-3 text-sm text-brand-strong">
          {messages.bootstrap.loading}
        </div>
      </>
    );
  }

  if (status !== "error" || !errorMessage) {
    return debugPanel;
  }

  return (
    <>
      {debugPanel}
      <div className="mb-4 rounded-2xl border border-danger/25 bg-red-50 px-4 py-3">
        <p className="text-sm text-danger">{errorMessage}</p>
        <Button variant="soft" className="mt-3" onClick={() => void fetchBootstrap()}>
          {messages.common.retry}
        </Button>
      </div>
    </>
  );
}
