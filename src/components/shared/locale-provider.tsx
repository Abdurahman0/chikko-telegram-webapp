"use client";

import {
  createContext,
  useContext,
  useMemo,
  type PropsWithChildren,
} from "react";
import { messagesByLocale } from "@/messages";
import type { Messages } from "@/messages/types";
import type { AppLocale } from "@/lib/i18n/config";

type LocaleContextValue = {
  locale: AppLocale;
  messages: Messages;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  locale,
  children,
}: PropsWithChildren<{ locale: AppLocale }>) {
  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      messages: messagesByLocale[locale],
    }),
    [locale],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useI18n must be used within LocaleProvider");
  }

  return context;
}
