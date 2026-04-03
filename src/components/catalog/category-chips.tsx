"use client";

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
    <div className="flex gap-2 overflow-x-auto pb-1">
      <button
        onClick={() => onSelect("")}
        className={cn(
          "whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold",
          activeCategory === ""
            ? "bg-brand text-white"
            : "bg-surface text-app-muted border border-surface-accent",
        )}
      >
        {allLabel}
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelect(category.id)}
          className={cn(
            "whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold",
            activeCategory === category.id
              ? "bg-brand text-white"
              : "bg-surface text-app-muted border border-surface-accent",
          )}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
