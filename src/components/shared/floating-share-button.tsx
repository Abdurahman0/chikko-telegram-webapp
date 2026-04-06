"use client";

import { cn } from "@/lib/utils/cn";
import { getTelegramWebApp } from "@/lib/telegram/webapp";
import { FiShare } from "react-icons/fi";

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
    <FiShare className="h-5 w-5 stroke-[2.5px]" aria-hidden="true" />
  );

  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface text-brand-strong shadow-soft ring-1 ring-surface-accent/20 active:bg-surface-soft transition-colors",
        className,
      )}
      onClick={handleShare}
      aria-label={ariaLabel}
    >
      {content}
    </button>
  );
}
