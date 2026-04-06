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
    <div className="flex gap-4 overflow-x-auto pb-4 pt-2 no-scrollbar">
      {/* All Categories Item */}
      <div 
        className="flex shrink-0 flex-col items-center gap-2 cursor-pointer group"
        onClick={() => onSelect("")}
      >
        <div className={cn(
          "flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-200",
          activeCategory === "" 
            ? "bg-brand ring-4 ring-brand/10 shadow-lg" 
            : "bg-surface-accent/30 group-hover:bg-surface-accent/50"
        )}>
          <div className={cn(
            "h-10 w-10 rounded-full border-2 border-dashed flex items-center justify-center",
            activeCategory === "" ? "border-white/50 text-white" : "border-app-muted/30 text-app-muted"
          )}>
            <span className="text-[10px] font-bold uppercase tracking-tighter">All</span>
          </div>
        </div>
        <span className={cn(
          "text-[11px] font-bold transition-colors",
          activeCategory === "" ? "text-brand" : "text-app-text"
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
            "relative h-16 w-16 flex items-center justify-center overflow-hidden rounded-2xl transition-all duration-200",
            activeCategory === category.id 
              ? "bg-brand ring-4 ring-brand/10 shadow-lg" 
              : "bg-surface-accent/30 group-hover:bg-surface-accent/50"
          )}>
            {category.image ? (
              <Image 
                src={category.image} 
                alt={category.name} 
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <div className="text-2xl opacity-40">📦</div>
            )}
            
            {activeCategory === category.id && (
              <div className="absolute inset-0 bg-brand/10" />
            )}
          </div>
          <span className={cn(
            "text-[11px] font-bold transition-colors truncate max-w-[72px] text-center capitalize",
            activeCategory === category.id ? "text-brand" : "text-app-text"
          )}>
            {category.name.toLowerCase()}
          </span>
        </div>
      ))}
    </div>
  );
}
