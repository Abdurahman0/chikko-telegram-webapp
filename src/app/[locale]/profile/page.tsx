"use client";

import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/shared/button";
import { SectionHeader } from "@/components/shared/section-header";
import { StateCard } from "@/components/shared/state-card";
import { useI18n } from "@/components/shared/locale-provider";
import { isSupportedLocale, type AppLocale } from "@/lib/i18n/config";
import { useProfileDraft } from "@/features/profile/use-profile-draft";
import { cn } from "@/lib/utils/cn";

export default function ProfilePage() {
  const params = useParams<{ locale: string }>();
  const locale = params.locale;
  if (!isSupportedLocale(locale)) {
    return null;
  }
  return <ProfileScreen locale={locale} />;
}

function ProfileScreen({ locale }: { locale: AppLocale }) {
  const { messages } = useI18n();
  const profile = useProfileDraft();
  const pathname = usePathname();
  const router = useRouter();
  const [languageOpen, setLanguageOpen] = useState(false);

  const currentLanguageLabel =
    locale === "uz" ? messages.profile.uzbek : messages.profile.russian;

  const initials = useMemo(() => {
    const value = profile.fullName || profile.telegramName || "C";
    return value
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }, [profile.fullName, profile.telegramName]);

  const switchLocale = (nextLocale: AppLocale) => {
    const nextPath = pathname.replace(/^\/(uz|ru)(?=\/|$)/, `/${nextLocale}`);
    setLanguageOpen(false);
    router.push(nextPath);
  };

  return (
    <div className="space-y-4">
      <SectionHeader title={messages.profile.title} subtitle={messages.profile.subtitle} />

      {profile.status === "loading" ? <StateCard title={messages.common.loading} /> : null}

      {profile.status === "error" ? (
        <StateCard
          title={messages.checkout.failed}
          action={<Button onClick={() => void profile.reload()}>{messages.common.retry}</Button>}
        />
      ) : null}

      <div className="rounded-3xl bg-surface p-4 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-base font-bold text-brand-strong">
            {initials || "C"}
          </div>
          <div>
            <p className="text-sm font-semibold">
              {profile.fullName || profile.telegramName || messages.profile.noData}
            </p>
            <p className="text-xs text-app-muted">
              {profile.phone || profile.telegramUsername || messages.profile.noData}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-surface p-2 shadow-soft">
        <div className="flex items-center justify-between rounded-2xl px-3 py-2">
          <p className="text-sm font-semibold">{messages.profile.settingsTitle}</p>
          <span className="rounded-full bg-brand-soft px-2 py-1 text-xs font-semibold text-brand-strong">
            {messages.profile.soon}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setLanguageOpen(true)}
          className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left hover:bg-surface-soft"
        >
          <span className="text-sm font-medium">{messages.profile.language}</span>
          <span className="text-sm text-app-muted">{currentLanguageLabel} ›</span>
        </button>

        <Link
          href={`/${locale}/about`}
          className="flex items-center justify-between rounded-2xl px-3 py-3 text-left hover:bg-surface-soft"
        >
          <span className="text-sm font-medium">{messages.profile.aboutUs}</span>
          <span className="text-sm text-app-muted">›</span>
        </Link>

        <Link
          href={`/${locale}/about#contacts`}
          className="flex items-center justify-between rounded-2xl px-3 py-3 text-left hover:bg-surface-soft"
        >
          <span className="text-sm font-medium">{messages.profile.contactUs}</span>
          <span className="text-sm text-app-muted">›</span>
        </Link>
      </div>

      <StateCard title={messages.profile.noUpdateEndpoint} description={messages.profile.saveSoon} />

      {languageOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/30 p-2"
          onClick={() => setLanguageOpen(false)}
        >
          <div
            className="w-full rounded-3xl bg-surface p-3 shadow-soft"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-surface-accent" />
            <p className="px-2 pb-2 text-sm font-semibold">{messages.profile.languageModalTitle}</p>
            <button
              type="button"
              onClick={() => switchLocale("uz")}
              className={cn(
                "flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left",
                locale === "uz" ? "bg-brand-soft text-brand-strong" : "hover:bg-surface-soft",
              )}
            >
              <span className="text-sm">🇺🇿 {messages.profile.uzbek}</span>
              <span>{locale === "uz" ? "●" : "○"}</span>
            </button>
            <button
              type="button"
              onClick={() => switchLocale("ru")}
              className={cn(
                "mt-1 flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left",
                locale === "ru" ? "bg-brand-soft text-brand-strong" : "hover:bg-surface-soft",
              )}
            >
              <span className="text-sm">🇷🇺 {messages.profile.russian}</span>
              <span>{locale === "ru" ? "●" : "○"}</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
