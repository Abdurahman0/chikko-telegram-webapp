"use client";

import { create } from "zustand";
import { getBootstrap } from "@/lib/api/telegram-webapp.service";
import { detectLocaleFromLanguageCode, type AppLocale } from "@/lib/i18n/config";
import type {
  BootstrapData,
  TelegramUser,
  TelegramThemeParams,
} from "@/types/telegram-webapp";
import { TelegramApiError } from "@/lib/api/telegram-api-client";

type BootstrapStatus = "idle" | "loading" | "success" | "error";

type BootstrapStore = {
  initData: string;
  locale: AppLocale;
  telegramUser: TelegramUser | null;
  theme: TelegramThemeParams | null;
  customer: BootstrapData["customer"];
  activeOrder: BootstrapData["activeOrder"];
  paymentMethods: BootstrapData["paymentMethods"];
  status: BootstrapStatus;
  errorCode: "forbidden" | "bad_request" | "network" | "unknown" | null;
  errorMessage: string | null;
  hasBootstrapped: boolean;
  setLocale: (locale: AppLocale) => void;
  setTelegramContext: (payload: {
    initData: string;
    user: TelegramUser | null;
    theme: TelegramThemeParams | null;
    languageCode?: string | null;
  }) => void;
  fetchBootstrap: () => Promise<void>;
};

export const useBootstrapStore = create<BootstrapStore>((set, get) => ({
  initData: "",
  locale: "uz",
  telegramUser: null,
  theme: null,
  customer: null,
  activeOrder: null,
  paymentMethods: ["payme", "click"],
  status: "idle",
  errorCode: null,
  errorMessage: null,
  hasBootstrapped: false,
  setLocale: (locale) => set({ locale }),
  setTelegramContext: ({ initData, user, theme, languageCode }) =>
    set({
      initData,
      telegramUser: user,
      theme,
      locale: detectLocaleFromLanguageCode(languageCode ?? user?.languageCode),
    }),
  fetchBootstrap: async () => {
    const current = get();
    if (current.status === "loading") {
      return;
    }
    set({ status: "loading", errorCode: null, errorMessage: null });
    try {
      const data = await getBootstrap(current.initData);
      set((state) => ({
        customer: data.customer,
        activeOrder: data.activeOrder,
        paymentMethods: data.paymentMethods,
        telegramUser: data.user ?? state.telegramUser,
        locale: detectLocaleFromLanguageCode(
          data.user?.languageCode ?? state.telegramUser?.languageCode,
        ),
        status: "success",
        hasBootstrapped: true,
      }));
    } catch (error) {
      if (error instanceof TelegramApiError) {
        set({
          status: "error",
          hasBootstrapped: true,
          errorCode: error.code,
          errorMessage: error.message,
        });
        return;
      }
      set({
        status: "error",
        hasBootstrapped: true,
        errorCode: "unknown",
        errorMessage: "Unknown error",
      });
    }
  },
}));
