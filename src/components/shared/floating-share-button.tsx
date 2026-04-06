"use client";

import { cn } from "@/lib/utils/cn";
import { getTelegramWebApp } from "@/lib/telegram/webapp";

export function FloatingShareButton({
  productId,
  productName,
  className,
  ariaLabel = "Share product",
}: {
  productId: string;
  productName: string;
  className?: string;
  ariaLabel?: string;
}) {
  const getShareLink = () => {
    const botUrl = process.env.NEXT_PUBLIC_BOT_URL || "https://t.me/chikko_test_bot";
    const appLink = `${botUrl}/app?startapp=${productId.replace(/-/g, "_")}`;
    const text = `Check out ${productName} \uD83E\uDD0D`;
    return `https://t.me/share/url?url=${encodeURIComponent(appLink)}&text=${encodeURIComponent(text)}`;
  };

  const handleShare = () => {
    const webApp = getTelegramWebApp();
    const link = getShareLink();
    
    if (webApp && (webApp as any).openTelegramLink) {
      try {
        (webApp as any).openTelegramLink(link);
        return;
      } catch {
        // Fallback if openTelegramLink fails in some strict environments
      }
    }
    window.open(link, "_blank");
  };

  const content = (
    <svg viewBox="0 0 24 24" className="h-[1.15rem] w-[1.15rem]" fill="none" aria-hidden="true" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );

  return (
    <button
      type="button"
      className={cn(
        "fixed right-4 top-4 z-40 inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface text-brand-strong shadow-soft ring-1 ring-surface-accent active:bg-surface-soft transition-colors",
        className,
      )}
      onClick={handleShare}
      aria-label={ariaLabel}
    >
      {content}
    </button>
  );
}
