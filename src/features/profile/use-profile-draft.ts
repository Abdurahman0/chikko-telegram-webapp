"use client";

import { useMemo } from "react";
import { useBootstrapStore } from "@/store/bootstrap-store";

export function useProfileDraft() {
  const customer = useBootstrapStore((state) => state.customer);
  const telegramUser = useBootstrapStore((state) => state.telegramUser);

  return useMemo(
    () => ({
      telegramName:
        `${telegramUser?.firstName ?? ""} ${telegramUser?.lastName ?? ""}`.trim(),
      telegramUsername: telegramUser?.username
        ? `@${telegramUser.username}`
        : undefined,
      fullName: customer?.fullName ?? "",
      phone: customer?.phone ?? "",
      address: customer?.address ?? "",
    }),
    [customer, telegramUser],
  );
}
