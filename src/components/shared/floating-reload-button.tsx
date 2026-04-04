"use client";

import { usePathname } from "next/navigation";
import { IoRefresh } from "react-icons/io5";
import { cn } from "@/lib/utils/cn";

export function FloatingReloadButton({
  className,
  ariaLabel = "Reload page",
}: {
  className?: string;
  ariaLabel?: string;
}) {
  const pathname = usePathname();
  const isMainPage = /^\/(uz|ru)\/(catalog|cart|orders|profile)\/?$/.test(pathname);

  if (!isMainPage) {
    return null;
  }

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={() => window.location.reload()}
      className={cn(
        "fixed right-4 top-4 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full bg-surface text-brand-strong shadow-soft ring-1 ring-surface-accent transition-colors active:bg-brand-soft",
        className,
      )}
    >
      <span className="inline-flex h-5 w-5 items-center justify-center">
        <IoRefresh className="h-5 w-5" aria-hidden="true" />
      </span>
    </button>
  );
}
