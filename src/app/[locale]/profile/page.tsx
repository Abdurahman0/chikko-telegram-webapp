"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/shared/button";
import { SectionHeader } from "@/components/shared/section-header";
import { StateCard } from "@/components/shared/state-card";
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
  const profile = useProfileDraft();

  const initials = useMemo(() => {
    const value = profile.fullName || profile.telegramName || "C";
    return value
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }, [profile.fullName, profile.telegramName]);

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

      <div className="rounded-3xl bg-surface p-4 shadow-soft">
        <Link href={`/${locale}/settings`} className="block">
          <Button fullWidth>{messages.profile.settingsTitle}</Button>
        </Link>
      </div>
    </div>
  );
}
