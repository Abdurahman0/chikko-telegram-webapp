"use client";

import { create } from "zustand";
import { getProfile } from "@/lib/api/telegram-webapp.service";
import { TelegramApiError } from "@/lib/api/telegram-api-client";
import type { Customer, Order, TelegramUser } from "@/types/telegram-webapp";

type ProfileStatus = "idle" | "loading" | "success" | "error";

type ProfileStore = {
  guestMode: boolean;
  user: TelegramUser | null;
  customer: Customer | null;
  activeOrder: Order | null;
  orderHistory: Order[];
  status: ProfileStatus;
  errorCode: "forbidden" | "bad_request" | "network" | "unknown" | null;
  errorMessage: string | null;
  lastFetchedAt: number;
  loadProfile: (params: { initData: string; force?: boolean }) => Promise<void>;
};

const PROFILE_STALE_MS = 60 * 1000;

export const useProfileStore = create<ProfileStore>((set, get) => ({
  guestMode: false,
  user: null,
  customer: null,
  activeOrder: null,
  orderHistory: [],
  status: "idle",
  errorCode: null,
  errorMessage: null,
  lastFetchedAt: 0,
  loadProfile: async ({ initData, force = false }) => {
    const state = get();
    if (state.status === "loading") {
      return;
    }
    if (
      !force &&
      state.status === "success" &&
      Date.now() - state.lastFetchedAt < PROFILE_STALE_MS
    ) {
      return;
    }

    set({
      status: "loading",
      errorCode: null,
      errorMessage: null,
    });

    try {
      const data = await getProfile(initData);
      set({
        guestMode: data.guestMode,
        user: data.user,
        customer: data.customer,
        activeOrder: data.activeOrder,
        orderHistory: data.orderHistory,
        status: "success",
        lastFetchedAt: Date.now(),
      });
    } catch (error) {
      if (error instanceof TelegramApiError) {
        set({
          status: "error",
          errorCode: error.code,
          errorMessage: error.message,
        });
        return;
      }
      set({
        status: "error",
        errorCode: "unknown",
        errorMessage: "Unknown error",
      });
    }
  },
}));
