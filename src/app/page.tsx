"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { detectLocaleFromLanguageCode } from "@/lib/i18n/config";
import { getTelegramLanguageCode, initializeTelegramWebApp } from "@/lib/telegram/webapp";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    initializeTelegramWebApp();
    const locale = detectLocaleFromLanguageCode(
      getTelegramLanguageCode() ?? (typeof navigator !== "undefined" ? navigator.language : undefined),
    );
    router.replace(`/${locale}/catalog`);
  }, [router]);

  return (
    <div className="min-h-screen bg-app-bg text-app-text flex items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-3xl bg-surface shadow-soft p-6 text-center">
        <p className="text-sm text-app-muted">Chikko</p>
      </div>
    </div>
  );
}
