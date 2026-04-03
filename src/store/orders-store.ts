"use client";

import { create } from "zustand";
import { getOrders } from "@/lib/api/telegram-webapp.service";
import { TelegramApiError } from "@/lib/api/telegram-api-client";
import type { Order } from "@/types/telegram-webapp";

type OrdersStatus = "idle" | "loading" | "success" | "error";

type OrdersStore = {
  guestMode: boolean;
  orders: Order[];
  status: OrdersStatus;
  errorCode: "forbidden" | "bad_request" | "network" | "unknown" | null;
  errorMessage: string | null;
  lastFetchedAt: number;
  loadOrders: (params: { initData: string; force?: boolean }) => Promise<void>;
};

const ORDERS_STALE_MS = 60 * 1000;

export const useOrdersStore = create<OrdersStore>((set, get) => ({
  guestMode: false,
  orders: [],
  status: "idle",
  errorCode: null,
  errorMessage: null,
  lastFetchedAt: 0,
  loadOrders: async ({ initData, force = false }) => {
    const state = get();
    if (state.status === "loading") {
      return;
    }
    if (
      !force &&
      state.status === "success" &&
      Date.now() - state.lastFetchedAt < ORDERS_STALE_MS
    ) {
      return;
    }

    set({
      status: "loading",
      errorCode: null,
      errorMessage: null,
    });

    try {
      const data = await getOrders(initData);
      set({
        guestMode: data.guestMode,
        orders: data.orders,
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
