"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { FaInstagram, FaTelegramPlane } from "react-icons/fa";
import { FloatingBackButton } from "@/components/shared/floating-back-button";
import { SectionHeader } from "@/components/shared/section-header";
import { useI18n } from "@/components/shared/locale-provider";
import { isSupportedLocale, type AppLocale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils/cn";

type WorkDay = {
  key: "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
  jsDay: number;
  hours: string;
};

const workSchedule: WorkDay[] = [
  { key: "mon", jsDay: 1, hours: "09:00 - 20:00" },
  { key: "tue", jsDay: 2, hours: "09:00 - 20:00" },
  { key: "wed", jsDay: 3, hours: "09:00 - 20:00" },
  { key: "thu", jsDay: 4, hours: "09:00 - 20:00" },
  { key: "fri", jsDay: 5, hours: "09:00 - 20:00" },
  { key: "sat", jsDay: 6, hours: "09:00 - 20:00" },
  { key: "sun", jsDay: 0, hours: "closed" },
];

export default function AboutPage() {
  const params = useParams<{ locale: string }>();
  const locale = params.locale;
  if (!isSupportedLocale(locale)) {
    return null;
  }
  return <AboutScreen locale={locale} />;
}

function AboutScreen({ locale }: { locale: AppLocale }) {
  const { messages } = useI18n();
  const today = new Date().getDay();

  const dayLabels: Record<WorkDay["key"], string> = useMemo(
    () => ({
      mon: messages.about.mon,
      tue: messages.about.tue,
      wed: messages.about.wed,
      thu: messages.about.thu,
      fri: messages.about.fri,
      sat: messages.about.sat,
      sun: messages.about.sun,
    }),
    [messages],
  );

  return (
    <div className="space-y-4 pt-12">
      <FloatingBackButton href={`/${locale}/profile`} />
      <SectionHeader title={messages.about.title} subtitle={messages.about.subtitle} />

      <div className="rounded-3xl bg-surface p-5 text-center shadow-soft">
        <div className="mx-auto mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-2xl">
          C
        </div>
        <p className="text-lg font-bold">Chikko Shop</p>
        <p className="mt-2 text-sm text-app-muted">{messages.about.description}</p>
      </div>

      <div className="rounded-3xl bg-surface p-4 shadow-soft">
        <p className="text-base font-semibold">{messages.about.workingHours}</p>
        <div className="mt-3 space-y-2">
          {workSchedule.map((day) => {
            const isToday = today === day.jsDay;
            const hours = day.hours === "closed" ? messages.about.closed : day.hours;
            return (
              <div
                key={day.key}
                className={cn(
                  "flex items-center justify-between rounded-2xl px-3 py-2 text-sm",
                  isToday ? "bg-brand-soft font-semibold text-brand-strong" : "text-app-text",
                )}
              >
                <span>{dayLabels[day.key]}</span>
                <span>{hours}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div id="contacts" className="rounded-3xl bg-surface p-4 shadow-soft">
        <p className="text-base font-semibold">{messages.about.contactsTitle}</p>
        <div className="mt-3 space-y-2 text-sm">
          <p>
            <span className="text-app-muted">{messages.about.phoneLabel}: </span>
            <a href="tel:+998999922090" className="font-semibold text-brand-strong">
              +998 99 992 20 90
            </a>
          </p>
          <p>
            <span className="text-app-muted">{messages.about.addressLabel}: </span>
            Toshkent shahri
          </p>
        </div>
      </div>

      <div className="rounded-3xl bg-surface p-4 shadow-soft">
        <p className="text-base font-semibold">{messages.about.socialsTitle}</p>
        <div className="mt-3 flex items-center gap-3">
          <a
            href="https://instagram.com/chikko_shop"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#E1306C] text-white shadow-[0_10px_20px_-12px_rgba(225,48,108,0.9)]"
            aria-label={messages.about.instagram}
          >
            <FaInstagram className="h-6 w-6" />
          </a>
          <a
            href="https://t.me/chikko_shop"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#229ED9] text-white shadow-[0_10px_20px_-12px_rgba(34,158,217,0.95)]"
            aria-label={messages.about.telegram}
          >
            <FaTelegramPlane className="h-6 w-6" />
          </a>
        </div>
      </div>
    </div>
  );
}
