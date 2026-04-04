"use client";

import { useEffect, useRef, useState, type TouchEvent } from "react";
import ReactCountryFlag from "react-country-flag";
import { cn } from "@/lib/utils/cn";
import type { AppLocale } from "@/lib/i18n/config";

export function LanguageBottomSheet({
  open,
  locale,
  title,
  uzbekLabel,
  russianLabel,
  onClose,
  onSelect,
}: {
  open: boolean;
  locale: AppLocale;
  title: string;
  uzbekLabel: string;
  russianLabel: string;
  onClose: () => void;
  onSelect: (locale: AppLocale) => void;
}) {
  const startYRef = useRef<number | null>(null);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  if (!open) {
    return null;
  }

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    startYRef.current = event.touches[0]?.clientY ?? null;
    setDragging(true);
  };

  const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    if (startYRef.current === null) {
      return;
    }
    const currentY = event.touches[0]?.clientY ?? startYRef.current;
    const delta = Math.max(0, currentY - startYRef.current);
    setDragY(delta);
  };

  const handleTouchEnd = () => {
    if (dragY > 90) {
      setDragY(0);
      setDragging(false);
      onClose();
      return;
    }
    setDragY(0);
    setDragging(false);
    startYRef.current = null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/35 p-2" onClick={onClose}>
      <div
        className={cn(
          "w-full rounded-3xl bg-surface p-3 shadow-soft transition-transform",
          dragging ? "duration-0" : "duration-200",
        )}
        style={{
          transform: `translateY(${dragY}px)`,
        }}
        onClick={(event) => event.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-surface-accent" />
        <p className="px-2 pb-2 text-sm font-semibold">{title}</p>

        <LanguageOption
          label={uzbekLabel}
          countryCode="UZ"
          selected={locale === "uz"}
          onClick={() => onSelect("uz")}
        />
        <LanguageOption
          label={russianLabel}
          countryCode="RU"
          selected={locale === "ru"}
          onClick={() => onSelect("ru")}
          className="mt-1"
        />
      </div>
    </div>
  );
}

function LanguageOption({
  label,
  countryCode,
  selected,
  className,
  onClick,
}: {
  label: string;
  countryCode: "UZ" | "RU";
  selected: boolean;
  className?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left",
        selected ? "bg-brand-soft text-brand-strong" : "bg-surface-soft/70 hover:bg-surface-soft",
        className,
      )}
    >
      <span className="inline-flex items-center gap-2 text-sm font-medium">
        <ReactCountryFlag
          svg
          countryCode={countryCode}
          style={{ width: "1.35em", height: "1.35em", borderRadius: "999px" }}
        />
        {label}
      </span>
      <span
        className={cn(
          "inline-flex h-6 w-6 items-center justify-center rounded-full border-2",
          selected ? "border-brand bg-brand text-white" : "border-app-muted/45",
        )}
      >
        {selected ? (
          <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
            <path
              d="M4.5 10.2 8 13.5l7.5-7.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </span>
    </button>
  );
}
