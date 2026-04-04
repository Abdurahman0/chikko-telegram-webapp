"use client";

import { cn } from "@/lib/utils/cn";

export function FloatingReloadButton({
  className,
  ariaLabel = "Reload page",
}: {
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={() => window.location.reload()}
      className={cn(
        "fixed right-4 top-4 z-40 inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface text-brand-strong shadow-soft ring-1 ring-surface-accent",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path
          d="M20 11a8 8 0 1 0 2 5.4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M20 4v7h-7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

