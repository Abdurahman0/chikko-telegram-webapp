"use client";

import { useParams } from "next/navigation";
import { ProfileSummary } from "@/components/profile/profile-summary";
import { SectionHeader } from "@/components/shared/section-header";
import { StateCard } from "@/components/shared/state-card";
import { useI18n } from "@/components/shared/locale-provider";
import { useProfileDraft } from "@/features/profile/use-profile-draft";
import { isSupportedLocale } from "@/lib/i18n/config";

export default function ProfilePage() {
  const params = useParams<{ locale: string }>();
  const locale = params.locale;
  if (!isSupportedLocale(locale)) {
    return null;
  }
  return <ProfileScreen />;
}

function ProfileScreen() {
  const { messages } = useI18n();
  const profile = useProfileDraft();

  return (
    <div className="space-y-4">
      <SectionHeader title={messages.profile.title} subtitle={messages.profile.subtitle} />

      <div className="space-y-3">
        <ProfileSummary
          label={messages.profile.telegramName}
          value={profile.telegramName}
        />
        <ProfileSummary
          label={messages.profile.telegramUsername}
          value={profile.telegramUsername}
        />
        <ProfileSummary label={messages.profile.fullName} value={profile.fullName} />
        <ProfileSummary label={messages.profile.phone} value={profile.phone} />
        <ProfileSummary label={messages.profile.address} value={profile.address} />
      </div>

      <StateCard
        title={messages.profile.noUpdateEndpoint}
        description={messages.profile.saveSoon}
      />
    </div>
  );
}
