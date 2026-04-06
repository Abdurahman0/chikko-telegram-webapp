import { notFound } from "next/navigation";
import type { PropsWithChildren } from "react";
import { AppInitializer } from "@/components/shared/app-initializer";
import { AppShell } from "@/components/shared/app-shell";
import { LocaleProvider } from "@/components/shared/locale-provider";
import { TelegramBootstrap } from "@/components/telegram/telegram-bootstrap";
import { isSupportedLocale, locales } from "@/lib/i18n/config";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: PropsWithChildren<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  return (
    <LocaleProvider locale={locale}>
      <AppInitializer />
      <AppShell locale={locale}>
        <TelegramBootstrap />
        {children}
      </AppShell>
    </LocaleProvider>
  );
}
