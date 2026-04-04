"use client";

import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { FaInstagram, FaTelegramPlane } from "react-icons/fa";
import { FloatingBackButton } from "@/components/shared/floating-back-button";
import { SectionHeader } from "@/components/shared/section-header";
import { LanguageBottomSheet } from "@/components/profile/language-bottom-sheet";
import { useI18n } from "@/components/shared/locale-provider";
import { isSupportedLocale, type AppLocale } from "@/lib/i18n/config";

export default function SettingsPage() {
  const params = useParams<{ locale: string }>();
  const locale = params.locale;
  if (!isSupportedLocale(locale)) {
    return null;
  }
  return <SettingsScreen locale={locale} />;
}

function SettingsScreen({ locale }: { locale: AppLocale }) {
  const { messages } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const [languageOpen, setLanguageOpen] = useState(false);

  const languageLabel =
    locale === "uz" ? messages.profile.uzbek : messages.profile.russian;

  const switchLocale = (nextLocale: AppLocale) => {
    const nextPath = pathname.replace(/^\/(uz|ru)(?=\/|$)/, `/${nextLocale}`);
    setLanguageOpen(false);
    router.push(nextPath);
  };

  return (
    <div className="space-y-4 pt-12">
      <FloatingBackButton href={`/${locale}/profile`} />
      <SectionHeader title={messages.profile.settingsTitle} subtitle={messages.profile.subtitle} />

      <div className="rounded-3xl bg-surface p-2 shadow-soft">
        <button
          type="button"
          onClick={() => setLanguageOpen(true)}
          className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left hover:bg-surface-soft"
        >
          <span className="text-sm font-medium">{messages.profile.language}</span>
          <span className="text-sm text-app-muted">{languageLabel} ›</span>
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

      <div className="rounded-3xl bg-surface p-4 shadow-soft">
        <p className="text-sm font-semibold">{messages.about.socialsTitle}</p>
        <div className="mt-3 flex items-center gap-3">
          <a
            href="https://instagram.com/chikko_shop"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface-soft text-[#E1306C]"
            aria-label={messages.about.instagram}
          >
            <FaInstagram className="h-5 w-5" />
          </a>
          <a
            href="https://t.me/chikko_shop"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface-soft text-[#229ED9]"
            aria-label={messages.about.telegram}
          >
            <FaTelegramPlane className="h-5 w-5" />
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
