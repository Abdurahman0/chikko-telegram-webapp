"use client";

import { useMemo } from "react";
import { useI18n } from "@/components/shared/locale-provider";
import { useTelegramBootstrap } from "@/features/telegram-auth/use-telegram-bootstrap";
import { useBootstrapStore } from "@/store/bootstrap-store";
import { Button } from "@/components/shared/button";

export function TelegramBootstrap() {
  useTelegramBootstrap();
  const { messages } = useI18n();
  const status = useBootstrapStore((state) => state.status);
  const errorCode = useBootstrapStore((state) => state.errorCode);
  const fetchBootstrap = useBootstrapStore((state) => state.fetchBootstrap);

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

  if (status === "loading") {
    return (
      <div className="mb-4 rounded-2xl bg-brand-soft px-4 py-3 text-sm text-brand-strong">
        {messages.bootstrap.loading}
      </div>
    );
  }

  if (status !== "error" || !errorMessage) {
    return null;
  }

  return (
    <div className="mb-4 rounded-2xl border border-danger/25 bg-red-50 px-4 py-3">
      <p className="text-sm text-danger">{errorMessage}</p>
      <Button variant="soft" className="mt-3" onClick={() => void fetchBootstrap()}>
        {messages.common.retry}
      </Button>
    </div>
  );
}
