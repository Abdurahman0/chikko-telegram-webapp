"use client";

import { cn } from "@/lib/utils/cn";
import type { CatalogCategory } from "@/types/telegram-webapp";

const ABSOLUTE_URL_PATTERN = /^[a-z][a-z\d+\-.]*:/i;

// Normalize category image URLs for Telegram Android WebView compatibility.
const resolveImageUrl = (url: string | null | undefined) => {
  if (typeof url !== "string") return null;

  const normalized = url.trim().replace(/\\/g, "/");
  if (!normalized || normalized === "string") return null;

  if (normalized.startsWith("data:") || normalized.startsWith("blob:")) {
    return normalized;
  }

  if (normalized.startsWith("//")) {
    return `https:${normalized}`;
  }

  if (ABSOLUTE_URL_PATTERN.test(normalized)) {
    if (
      typeof window !== "undefined" &&
      window.location.protocol === "https:" &&
      normalized.startsWith("http://")
    ) {
      return `https://${normalized.slice("http://".length)}`;
    }
    return normalized;
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
    (typeof window !== "undefined" ? window.location.origin : "");

  if (!baseUrl) {
    return normalized.startsWith("/") ? normalized : `/${normalized}`;
  }

  try {
    const base = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
    return new URL(normalized, base).toString();
  } catch {
    return normalized.startsWith("/") ? normalized : `/${normalized}`;
  }
};

export function CategoryChips({
  categories,
  activeCategory,
  allLabel,
  onSelect,
}: {
  categories: CatalogCategory[];
  activeCategory: string;
  allLabel: string;
  onSelect: (category: string) => void;
}) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-5 pt-1 no-scrollbar px-2.5 snap-x select-none items-end">
      {/* All Categories Item */}
      <div 
        className="flex shrink-0 flex-col items-center gap-1.5 cursor-pointer group snap-start"
        onClick={() => onSelect("")}
      >
        <div className={cn(
          "flex h-[60px] w-[60px] items-center justify-center rounded-full transition-all duration-300 ease-out relative",
          activeCategory === "" 
            ? "bg-brand/10 ring-[2.5px] ring-brand ring-offset-[2px] ring-offset-surface shadow-[0_4px_12px_rgba(255,126,139,0.2)] scale-105" 
            : "bg-surface-accent/15 group-hover:bg-surface-accent/25 group-active:scale-95 shadow-sm"
        )}>
          <div className={cn(
            "h-9 w-9 rounded-full border-[1.5px] border-dashed flex items-center justify-center transition-colors duration-300",
            activeCategory === "" ? "border-brand text-brand" : "border-app-muted/20 text-app-muted/40"
          )}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <rect width="7" height="7" x="3" y="3" rx="1.5"/><rect width="7" height="7" x="14" y="3" rx="1.5"/><rect width="7" height="7" x="3" y="14" rx="1.5"/><rect width="7" height="7" x="14" y="14" rx="1.5"/>
            </svg>
          </div>
          
          {activeCategory === "" && (
             <div className="absolute inset-0 rounded-full bg-brand/5 -z-10 blur-lg scale-110" />
          )}
        </div>
        <span className={cn(
          "text-[10px] font-black transition-all duration-300 tracking-tight",
          activeCategory === "" ? "text-brand" : "text-app-text/50"
        )}>
          {allLabel}
        </span>
      </div>

      {/* Category Items */}
      {categories.map((category) => {
        const imageUrl = resolveImageUrl(category.imageUrl || category.image);
        return (
          <div
            key={category.id}
            className="flex shrink-0 flex-col items-center gap-2 cursor-pointer group snap-start"
            onClick={() => onSelect(category.id)}
          >
            <div className={cn(
              "relative h-[60px] w-[60px] flex items-center justify-center overflow-hidden rounded-full transition-all duration-300 ease-out",
              activeCategory === category.id 
                ? "ring-[2.5px] ring-brand ring-offset-[2px] ring-offset-surface shadow-[0_6px_16px_rgba(255,126,139,0.2)] scale-105" 
                : "ring-[1px] ring-black/[0.03] group-hover:ring-black/[0.08] group-active:scale-95 shadow-sm bg-surface-accent/10"
            )}>
              {imageUrl ? (
                <img
                  src={imageUrl} 
                  alt={category.name} 
                  loading="eager"
                  decoding="async"
                  className={cn(
                    "absolute inset-0 h-full w-full object-cover transition-all duration-500",
                    activeCategory === category.id ? "scale-110" : "group-hover:scale-105"
                  )}
                />
              ) : (
                <div className="text-2xl opacity-40 transform group-hover:scale-110 transition-transform drop-shadow-sm font-emoji">📦</div>
              )}
              
              {activeCategory === category.id && (
                <div className="absolute inset-0 bg-brand/5 transition-opacity duration-300" />
              )}
              
              {activeCategory === category.id && (
                <div className="absolute inset-0 rounded-full bg-brand/5 -z-10 blur-lg scale-110" />
              )}
            </div>
            <span className={cn(
              "text-[11px] font-black transition-all duration-300 truncate max-w-[70px] text-center capitalize tracking-tight",
              activeCategory === category.id ? "text-brand" : "text-app-text/50"
            )}>
              {category.name.toLowerCase()}
            </span>
          </div>
        );
      })}
    </div>
  );
}
