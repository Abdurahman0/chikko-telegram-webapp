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
    <div className="flex gap-5 overflow-x-auto pb-4 pt-2 no-scrollbar px-1">
      {/* All Categories Item */}
      <div 
        className="flex shrink-0 flex-col items-center gap-2 cursor-pointer group"
        onClick={() => onSelect("")}
      >
        <div className={cn(
          "flex h-[72px] w-[72px] items-center justify-center rounded-full transition-all duration-300 relative",
          activeCategory === "" 
            ? "bg-brand/10 ring-[3px] ring-brand ring-offset-2 ring-offset-surface shadow-lg scale-105" 
            : "bg-surface-accent/20 group-hover:bg-surface-accent/40"
        )}>
          <div className={cn(
            "h-12 w-12 rounded-full border-2 border-dashed flex items-center justify-center transition-colors",
            activeCategory === "" ? "border-brand text-brand" : "border-app-muted/20 text-app-muted"
          )}>
            <span className="text-[10px] font-black uppercase tracking-widest">All</span>
          </div>
        </div>
        <span className={cn(
          "text-[11px] font-black transition-all duration-300 tracking-tight",
          activeCategory === "" ? "text-brand scale-105" : "text-app-text/60"
        )}>
          {allLabel}
        </span>
      </div>

      {/* Category Items */}
      {categories.map((category) => (
        <div
          key={category.id}
          className="flex shrink-0 flex-col items-center gap-2 cursor-pointer group"
          onClick={() => onSelect(category.id)}
        >
          <div className={cn(
            "relative h-[72px] w-[72px] flex items-center justify-center overflow-hidden rounded-full transition-all duration-300",
            activeCategory === category.id 
              ? "ring-[3px] ring-brand ring-offset-2 ring-offset-surface shadow-lg scale-105" 
              : "ring-[2px] ring-surface-accent/30"
          )}>
            <div className="absolute inset-0 bg-surface-accent/10" />
            {category.image ? (
              <Image 
                src={category.image} 
                alt={category.name} 
                fill
                unoptimized
                className={cn(
                  "object-cover transition-transform duration-500",
                  activeCategory === category.id ? "scale-110" : "group-hover:scale-105"
                )}
              />
            ) : (
              <div className="text-3xl opacity-50 transform group-hover:scale-110 transition-transform">📦</div>
            )}
            
            {activeCategory === category.id && (
              <div className="absolute inset-0 bg-brand/5" />
            )}
          </div>
          <span className={cn(
            "text-[11px] font-black transition-all duration-300 truncate max-w-[80px] text-center capitalize tracking-tight",
            activeCategory === category.id ? "text-brand scale-105" : "text-app-text/60"
          )}>
            {category.name.toLowerCase()}
          </span>
        </div>
      ))}
    </div>
  );
}
