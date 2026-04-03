"use client";

import { useEffect, useMemo } from "react";
import { useBootstrapStore } from "@/store/bootstrap-store";
import { useProfileStore } from "@/store/profile-store";

export function useProfileDraft() {
  const initData = useBootstrapStore((state) => state.initData);
  const hasBootstrapped = useBootstrapStore((state) => state.hasBootstrapped);
  const bootstrapCustomer = useBootstrapStore((state) => state.customer);
  const bootstrapTelegramUser = useBootstrapStore((state) => state.telegramUser);
  const loadProfile = useProfileStore((state) => state.loadProfile);
  const profileStatus = useProfileStore((state) => state.status);
  const profileErrorCode = useProfileStore((state) => state.errorCode);
  const profileUser = useProfileStore((state) => state.user);
  const profileCustomer = useProfileStore((state) => state.customer);
  const guestMode = useProfileStore((state) => state.guestMode);

  useEffect(() => {
    if (!hasBootstrapped) {
      return;
    }
    void loadProfile({ initData });
  }, [hasBootstrapped, initData, loadProfile]);

  return useMemo(
    () => ({
      status: profileStatus,
      guestMode,
      errorCode: profileErrorCode,
      reload: () => loadProfile({ initData, force: true }),
      telegramName:
        profileUser?.fullName?.trim() ||
        `${bootstrapTelegramUser?.firstName ?? ""} ${bootstrapTelegramUser?.lastName ?? ""}`.trim(),
      telegramUsername: profileUser?.username
        ? `@${profileUser.username}`
        : bootstrapTelegramUser?.username
          ? `@${bootstrapTelegramUser.username}`
        : undefined,
      fullName: profileCustomer?.fullName ?? bootstrapCustomer?.fullName ?? "",
      phone: profileCustomer?.phone ?? bootstrapCustomer?.phone ?? "",
      address: profileCustomer?.address ?? bootstrapCustomer?.address ?? "",
    }),
    [
      profileStatus,
      guestMode,
      profileErrorCode,
      loadProfile,
      initData,
      profileUser,
      bootstrapTelegramUser,
      profileCustomer,
      bootstrapCustomer,
    ],
  );
}
