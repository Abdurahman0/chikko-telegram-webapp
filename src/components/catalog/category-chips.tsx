"use client";

import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import type { CatalogCategory } from "@/types/telegram-webapp";

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
    <div className="flex gap-5 overflow-x-auto pb-6 pt-2 no-scrollbar px-1 snap-x select-none">
      {/* All Categories Item */}
      <div 
        className="flex shrink-0 flex-col items-center gap-2.5 cursor-pointer group snap-start"
        onClick={() => onSelect("")}
      >
        <div className={cn(
          "flex h-[76px] w-[76px] items-center justify-center rounded-full transition-all duration-500 ease-out relative",
          activeCategory === "" 
            ? "bg-brand/15 ring-[3.5px] ring-brand ring-offset-[3px] ring-offset-surface shadow-[0_8px_20px_rgba(255,126,139,0.25)] scale-110" 
            : "bg-surface-accent/15 group-hover:bg-surface-accent/30 group-active:scale-95 shadow-sm"
        )}>
          <div className={cn(
            "h-12 w-12 rounded-full border-[2.5px] border-dashed flex items-center justify-center transition-colors duration-300",
            activeCategory === "" ? "border-brand text-brand" : "border-app-muted/30 text-app-muted/50"
          )}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
              <rect width="7" height="7" x="3" y="3" rx="1.5"/><rect width="7" height="7" x="14" y="3" rx="1.5"/><rect width="7" height="7" x="3" y="14" rx="1.5"/><rect width="7" height="7" x="14" y="14" rx="1.5"/>
            </svg>
          </div>
          
          {/* Subtle glow for active state */}
          {activeCategory === "" && (
             <div className="absolute inset-0 rounded-full bg-brand/10 -z-10 blur-xl scale-125" />
          )}
        </div>
        <span className={cn(
          "text-[12px] font-black transition-all duration-300 tracking-tight",
          activeCategory === "" ? "text-brand scale-110" : "text-app-text/60"
        )}>
          {allLabel}
        </span>
      </div>

      {/* Category Items */}
      {categories.map((category) => (
        <div
          key={category.id}
          className="flex shrink-0 flex-col items-center gap-2.5 cursor-pointer group snap-start"
          onClick={() => onSelect(category.id)}
        >
          <div className={cn(
            "relative h-[76px] w-[76px] flex items-center justify-center overflow-hidden rounded-full transition-all duration-500 ease-out",
            activeCategory === category.id 
              ? "ring-[3.5px] ring-brand ring-offset-[3px] ring-offset-surface shadow-[0_8px_20px_rgba(255,126,139,0.25)] scale-110" 
              : "ring-[1px] ring-surface-accent/40 group-hover:ring-surface-accent/60 group-active:scale-95 shadow-sm"
          )}>
            <div className="absolute inset-0 bg-surface-accent/10" />
            {category.image ? (
              <Image 
                src={category.image} 
                alt={category.name} 
                fill
                unoptimized
                className={cn(
                  "object-cover transition-all duration-700",
                  activeCategory === category.id ? "scale-115 rotate-1" : "group-hover:scale-110"
                )}
              />
            ) : (
              <div className="text-3xl opacity-60 transform group-hover:scale-115 transition-transform drop-shadow-sm font-emoji">📦</div>
            )}
            
            {activeCategory === category.id && (
              <div className="absolute inset-0 bg-brand/10 transition-opacity duration-300" />
            )}
            
            {/* Subtle glow for active state */}
            {activeCategory === category.id && (
              <div className="absolute inset-0 rounded-full bg-brand/10 -z-10 blur-xl scale-125" />
            )}
          </div>
          <span className={cn(
            "text-[12px] font-black transition-all duration-300 truncate max-w-[84px] text-center capitalize tracking-tight",
            activeCategory === category.id ? "text-brand scale-110" : "text-app-text/60"
          )}>
            {category.name.toLowerCase()}
          </span>
        </div>
      ))}
    </div>
  );
}
