"use client";

import { useState } from "react";
import { FiChevronRight, FiChevronLeft } from "react-icons/fi";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/components/shared/locale-provider";
import { useCatalogStore } from "@/store/catalog-store";
import { Sheet } from "@/components/shared/sheet";

export function FilterSheet({ 
  isOpen, 
  onClose,
  onOpenCategories 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onOpenCategories: () => void;
}) {
  const { messages } = useI18n();
  const activeCategoryId = useCatalogStore((state) => state.activeCategory);
  const categories = useCatalogStore((state) => state.categories);
  const priceFrom = useCatalogStore((state) => state.priceFrom);
  const priceTo = useCatalogStore((state) => state.priceTo);
  const setPriceRange = useCatalogStore((state) => state.setPriceRange);

  const [localFrom, setLocalFrom] = useState(priceFrom ?? 0);
  const [localTo, setLocalTo] = useState(priceTo ?? 5000000);

  const activeCategory = categories.find(c => c.id === activeCategoryId);
  const categoryName = activeCategoryId === "" ? messages.catalog.allCategories : activeCategory?.name ?? messages.common.unknown;

  const handleApply = () => {
    setPriceRange(localFrom, localTo);
    onClose();
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title={messages.catalog.filterTitle}>
      <div className="space-y-8">
        {/* Category Selector Link */}
        <button 
          onClick={onOpenCategories}
          className="flex w-full items-center justify-between border-b border-surface-accent/30 pr-1 pb-4"
        >
          <div className="text-left">
            <span className="block text-sm font-bold text-app-text">{messages.catalog.categoryTitle}</span>
            <span className="text-sm font-medium text-app-muted">{categoryName}</span>
          </div>
          <FiChevronRight className="text-app-muted/60" />
        </button>

        {/* Price Range Section */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold text-app-text">
            {messages.catalog.priceRange}
          </h3>
          
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="number"
                value={localFrom}
                onChange={(e) => setLocalFrom(Number(e.target.value))}
                className="h-12 w-full rounded-xl bg-surface-accent/20 px-4 pt-1 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-brand/30"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-app-muted uppercase">
                {messages.catalog.priceFromLabel}
              </span>
            </div>
            <div className="relative flex-1">
              <input
                type="number"
                value={localTo}
                onChange={(e) => setLocalTo(Number(e.target.value))}
                className="h-12 w-full rounded-xl bg-surface-accent/20 px-4 pt-1 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-brand/30"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-app-muted uppercase">
                {messages.catalog.priceToLabel}
              </span>
            </div>
          </div>

          <div className="px-2">
            <input 
              type="range" 
              min={0}
              max={10000000}
              step={100000}
              value={localTo}
              onChange={(e) => setLocalTo(Number(e.target.value))}
              className="h-1.5 w-full accent-brand bg-surface-accent/50 rounded-full appearance-none cursor-pointer"
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={handleApply}
            className="w-full rounded-2xl bg-brand py-4 text-center font-bold text-white shadow-lg active:scale-95 transition-transform"
          >
            {messages.catalog.show}
          </button>
        </div>
      </div>
    </Sheet>
  );
}

export function CategoryPickerSheet({ 
  isOpen, 
  onClose,
  onBack 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onBack: () => void;
}) {
  const { messages } = useI18n();
  const activeCategory = useCatalogStore((state) => state.activeCategory);
  const setCategory = useCatalogStore((state) => state.setCategory);
  const categories = useCatalogStore((state) => state.categories);

  return (
    <Sheet 
      isOpen={isOpen} 
      onClose={onClose} 
      title={""} 
    >
      <div className="space-y-4">
        {/* Special Header with Back Button */}
        <div className="flex items-center gap-4 mb-4">
          <button onClick={onBack} className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-accent/30">
            <FiChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-bold">{messages.catalog.categoryTitle}</h2>
        </div>

        <div className="space-y-1 overflow-y-auto max-h-[50vh] pr-2 no-scrollbar">
          {/* All category */}
          <button
            onClick={() => setCategory("")}
            className="flex w-full items-center justify-between rounded-xl p-4 transition-colors hover:bg-surface-accent/10"
          >
            <span className={cn("text-base font-semibold", activeCategory === "" ? "text-app-text" : "text-app-muted")}>
              {messages.catalog.allCategories}
            </span>
            <div className={cn(
              "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all",
              activeCategory === "" ? "border-brand bg-brand shadow-sm" : "border-surface-accent bg-transparent"
            )}>
              {activeCategory === "" && (
                 <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                    <polyline points="20 6 9 17 4 12" />
                 </svg>
              )}
            </div>
          </button>

          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setCategory(category.id)}
              className="flex w-full items-center justify-between rounded-xl p-4 transition-colors hover:bg-surface-accent/10"
            >
              <span className={cn("text-base font-semibold", activeCategory === category.id ? "text-app-text" : "text-app-muted")}>
                {category.name}
              </span>
              <div className={cn(
                "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all",
                activeCategory === category.id ? "border-brand bg-brand shadow-sm" : "border-surface-accent bg-transparent"
              )}>
                {activeCategory === category.id && (
                   <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                      <polyline points="20 6 9 17 4 12" />
                   </svg>
                )}
              </div>
            </button>
          ))}
        </div>
        
        <div className="pt-6">
          <button
            onClick={onBack}
            className="w-full rounded-2xl bg-brand py-4 text-center font-bold text-white shadow-lg active:scale-95 transition-transform"
          >
            {messages.catalog.continueLabel}
          </button>
        </div>
      </div>
    </Sheet>
  );
}
