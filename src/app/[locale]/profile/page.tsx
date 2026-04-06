"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { FiChevronRight } from "react-icons/fi";
import { TbBrandInstagram, TbBrandTelegram } from "react-icons/tb";
import { SectionHeader } from "@/components/shared/section-header";
import { StateCard } from "@/components/shared/state-card";
import { LanguageBottomSheet } from "@/components/profile/language-bottom-sheet";
import { useI18n } from "@/components/shared/locale-provider";
import { isSupportedLocale, type AppLocale } from "@/lib/i18n/config";
import { useProfileDraft } from "@/features/profile/use-profile-draft";

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
  const router = useRouter();
  const pathname = usePathname();
  const profile = useProfileDraft();
  const [languageOpen, setLanguageOpen] = useState(false);

  const initials = useMemo(() => {
    const value = profile.fullName || profile.telegramName || "C";
    return value
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }, [profile.fullName, profile.telegramName]);

  const languageLabel =
    locale === "uz" ? messages.profile.uzbek : messages.profile.russian;

  const switchLocale = (nextLocale: AppLocale) => {
    if (nextLocale === locale) {
      setLanguageOpen(false);
      return;
    }
    const nextPath = pathname.replace(/^\/(uz|ru)(?=\/|$)/, `/${nextLocale}`);
    setLanguageOpen(false);
    router.push(nextPath);
  };

  return (
    <div className="space-y-4 pb-1">
      <SectionHeader title={messages.profile.title} subtitle={messages.profile.subtitle} />

      {profile.status === "loading" ? <StateCard title={messages.common.loading} /> : null}

      {profile.status === "error" ? (
        <StateCard
          title={messages.checkout.failed}
          action={
            <button
              type="button"
              onClick={() => void profile.reload()}
              className="inline-flex items-center justify-center rounded-2xl bg-brand px-4 py-2.5 text-sm font-semibold text-white"
            >
              {messages.common.retry}
            </button>
          }
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
        <Link
          href={`/${locale}/settings`}
          className="flex items-center justify-between rounded-2xl px-3 py-3 text-left hover:bg-surface-soft"
        >
          <span className="text-sm font-medium">{messages.profile.settingsTitle}</span>
          <span className="text-app-muted">
            <FiChevronRight className="h-5 w-5" />
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setLanguageOpen(true)}
          className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left hover:bg-surface-soft"
        >
          <span className="text-sm font-medium">{messages.profile.language}</span>
          <span className="inline-flex items-center gap-2 text-sm text-app-muted">
            {languageLabel}
            <FiChevronRight className="h-5 w-5" />
          </span>
        </button>

        <Link
          href={`/${locale}/about`}
          className="flex items-center justify-between rounded-2xl px-3 py-3 text-left hover:bg-surface-soft"
        >
          <span className="text-sm font-medium">{messages.profile.aboutUs}</span>
          <span className="text-app-muted">
            <FiChevronRight className="h-5 w-5" />
          </span>
        </Link>

        <Link
          href={`/${locale}/about#contacts`}
          className="flex items-center justify-between rounded-2xl px-3 py-3 text-left hover:bg-surface-soft"
        >
          <span className="text-sm font-medium">{messages.profile.contactUs}</span>
          <span className="text-app-muted">
            <FiChevronRight className="h-5 w-5" />
          </span>
        </Link>
      </div>

      <div className="rounded-3xl bg-surface p-4 shadow-soft">
        <p className="text-sm font-semibold">{messages.about.socialsTitle}</p>
        <div className="mt-3 flex items-center gap-3">
          <a
            href="https://instagram.com/chikko_shop"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#E1306C] text-white shadow-[0_10px_20px_-12px_rgba(225,48,108,0.9)]"
            aria-label={messages.about.instagram}
          >
            <TbBrandInstagram className="h-[26px] w-[26px] stroke-[1.5px]" />
          </a>
          <a
            href="https://t.me/chikko_shop"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#229ED9] text-white shadow-[0_10px_20px_-12px_rgba(34,158,217,0.95)]"
            aria-label={messages.about.telegram}
          >
            <TbBrandTelegram className="h-[26px] w-[26px] stroke-[1.5px] -ml-[2px]" />
          </a>
        </div>
      </div>

      <LanguageBottomSheet
        open={languageOpen}
        locale={locale}
        title={messages.profile.languageModalTitle}
        uzbekLabel={messages.profile.uzbek}
        russianLabel={messages.profile.russian}
        onClose={() => setLanguageOpen(false)}
        onSelect={switchLocale}
      />
    </div>
  );
}

