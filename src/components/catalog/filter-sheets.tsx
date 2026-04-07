"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { FiChevronRight, FiChevronLeft } from "react-icons/fi";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/components/shared/locale-provider";
import { useCatalogStore } from "@/store/catalog-store";
import { Sheet } from "@/components/shared/sheet";
import { DualRangeSlider } from "@/components/catalog/dual-range-slider";

export function FilterSheet({ 
  isOpen, 
  onClose,
  onOpenCategories,
  onOpenBrands
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onOpenCategories: () => void;
  onOpenBrands: () => void;
}) {
  const { messages } = useI18n();
  const activeCategoryId = useCatalogStore((state) => state.activeCategory);
  const categories = useCatalogStore((state) => state.categories);
  const priceFrom = useCatalogStore((state) => state.priceFrom);
  const priceTo = useCatalogStore((state) => state.priceTo);
  const setPriceRange = useCatalogStore((state) => state.setPriceRange);
  const brandId = useCatalogStore((state) => state.brand);
  const brands = useCatalogStore((state) => state.brands);

  const [localFrom, setLocalFrom] = useState(priceFrom?.toString() ?? "0");
  const [localTo, setLocalTo] = useState(priceTo?.toString() ?? "10000000");

  const activeCategory = categories.find(c => c.id === activeCategoryId);
  const activeBrand = brands.find(b => b.id === brandId);
  const categoryName = activeCategoryId === "" ? messages.catalog.allCategories : activeCategory?.name ?? messages.common.unknown;
  const brandName = activeBrand?.name ?? (messages.catalog.allBrands || "All Brands");

  const handleApply = () => {
    const from = localFrom === "" ? 0 : Number(localFrom);
    const to = localTo === "" ? 10000000 : Number(localTo);
    setPriceRange(from, to);
    onClose();
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title={messages.catalog.filterTitle}>
      <div className="space-y-6 pb-2">
        {/* Category Selector Link */}
        <div className="space-y-3">
           <button 
             onClick={onOpenCategories}
             className="flex w-full items-center justify-between rounded-2xl bg-surface-accent/15 p-4 transition-all active:scale-[0.98] border border-transparent hover:border-brand/10 hover:bg-surface-accent/25 group"
           >
             <div className="text-left">
               <span className="block text-[11px] font-black uppercase tracking-wider text-app-muted/60 mb-0.5">{messages.catalog.categoryTitle}</span>
               <span className="text-[15px] font-bold text-app-text group-hover:text-brand transition-colors">
                 {categoryName}
               </span>
             </div>
             <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5">
                <FiChevronRight className="text-brand h-4 w-4" />
             </div>
           </button>

           {/* Brand Selector Link */}
           <button 
             onClick={onOpenBrands}
             className="flex w-full items-center justify-between rounded-2xl bg-surface-accent/15 p-4 transition-all active:scale-[0.98] border border-transparent hover:border-brand/10 hover:bg-surface-accent/25 group"
           >
             <div className="text-left">
               <span className="block text-[11px] font-black uppercase tracking-wider text-app-muted/60 mb-0.5">{messages.catalog.brandTitle || "Brand"}</span>
               <span className="text-[15px] font-bold text-app-text group-hover:text-brand transition-colors">
                 {brandName}
               </span>
             </div>
             <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5">
                <FiChevronRight className="text-brand h-4 w-4" />
             </div>
           </button>
        </div>

        {/* Price Range Section */}
        <div className="space-y-4 pt-2">
           <div className="flex items-center justify-between px-1">
             <h3 className="text-[11px] font-black uppercase tracking-wider text-app-muted/60">
               {messages.catalog.priceRange}
             </h3>
             <button 
               onClick={() => { setLocalFrom("0"); setLocalTo("10000000"); }}
               className="text-[11px] font-bold text-brand uppercase tracking-tight"
             >
               {messages.common.reset || "Reset"}
             </button>
           </div>
          
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="number"
                value={localFrom}
                onChange={(e) => setLocalFrom(e.target.value)}
                className="h-14 w-full rounded-2xl bg-surface-accent/15 px-4 pt-1.5 text-[15px] font-black focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all border-none ring-1 ring-black/5"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-app-muted/40 uppercase tracking-widest pointer-events-none">
                {messages.catalog.priceFromLabel}
              </span>
            </div>
            <div className="relative flex-1">
              <input
                type="number"
                value={localTo}
                onChange={(e) => setLocalTo(e.target.value)}
                className="h-14 w-full rounded-2xl bg-surface-accent/15 px-4 pt-1.5 text-[15px] font-black focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all border-none ring-1 ring-black/5"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-app-muted/40 uppercase tracking-widest pointer-events-none">
                {messages.catalog.priceToLabel}
              </span>
            </div>
          </div>

          <div className="px-2 py-6">
            <DualRangeSlider
              min={0}
              max={10000000}
              step={10000}
              value={[localFrom === "" ? 0 : Number(localFrom), localTo === "" ? 10000000 : Number(localTo)]}
              onChange={(val) => {
                setLocalFrom(String(val[0]));
                setLocalTo(String(val[1]));
              }}
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={handleApply}
            className="w-full rounded-3xl bg-brand py-5 text-center font-black text-[15px] uppercase tracking-wider text-white shadow-[0_12px_24px_rgba(255,126,139,0.35)] active:scale-[0.97] transition-all"
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
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const locale = params.locale;

  const activeCategory = useCatalogStore((state) => state.activeCategory);
  const categories = useCatalogStore((state) => state.categories);

  const handleSelect = (id: string) => {
    const targetId = id === "" ? "all" : id;
    router.push(`/${locale}/category/${targetId}`);
    onClose();
  };

  return (
    <Sheet 
      isOpen={isOpen} 
      onClose={onClose} 
      title={""} 
    >
      <div className="space-y-4 pb-4">
        <div className="flex items-center gap-4 mb-2">
          <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-accent/20 text-app-text transition-all active:scale-90">
            <FiChevronLeft className="h-6 w-6" />
          </button>
          <h2 className="text-xl font-black tracking-tight">{messages.catalog.categoryTitle}</h2>
        </div>

        <div className="space-y-1.5 overflow-y-auto max-h-[60vh] pr-1 no-scrollbar pt-2">
          <button
            onClick={() => handleSelect("")}
            className={cn(
              "flex w-full items-center justify-between rounded-2xl p-4 transition-all duration-300",
              activeCategory === "" ? "bg-brand/5 border border-brand/20" : "hover:bg-surface-accent/10 border border-transparent"
            )}
          >
            <span className={cn("text-[16px] font-bold", activeCategory === "" ? "text-brand" : "text-app-text/70")}>
              {messages.catalog.allCategories}
            </span>
            <div className={cn(
              "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 scale-110",
              activeCategory === "" ? "border-brand bg-brand shadow-[0_2px_8px_rgba(255,126,139,0.3)]" : "border-surface-accent bg-transparent"
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
              onClick={() => handleSelect(category.id)}
              className={cn(
                "flex w-full items-center justify-between rounded-2xl p-4 transition-all duration-300",
                activeCategory === category.id ? "bg-brand/5 border border-brand/20" : "hover:bg-surface-accent/10 border border-transparent"
              )}
            >
              <span className={cn("text-[16px] font-bold", activeCategory === category.id ? "text-brand" : "text-app-text/70")}>
                {category.name}
              </span>
              <div className={cn(
                "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 scale-110",
                activeCategory === category.id ? "border-brand bg-brand shadow-[0_2px_8px_rgba(255,126,139,0.3)]" : "border-surface-accent bg-transparent"
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
        
        <div className="pt-4 px-1">
          <button
            onClick={onBack}
            className="w-full rounded-2xl bg-surface-accent/20 py-4 text-center font-black text-app-text/80 h-14 active:scale-95 transition-all text-sm uppercase tracking-widest"
          >
            {messages.common.back || "Back"}
          </button>
        </div>
      </div>
    </Sheet>
  );
}

export function BrandPickerSheet({ 
  isOpen, 
  onClose,
  onBack 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onBack: () => void;
}) {
  const { messages } = useI18n();
  const brands = useCatalogStore((state) => state.brands);
  const brandId = useCatalogStore((state) => state.brand);
  const setBrand = useCatalogStore((state) => state.setBrand);

  const handleSelect = (id: string) => {
    setBrand(id);
    onBack(); // Go back to filters instead of closing everything
  };

  return (
    <Sheet 
      isOpen={isOpen} 
      onClose={onClose} 
      title={""} 
    >
      <div className="space-y-4 pb-4">
        <div className="flex items-center gap-4 mb-2">
          <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-accent/20 text-app-text transition-all active:scale-90">
            <FiChevronLeft className="h-6 w-6" />
          </button>
          <h2 className="text-xl font-black tracking-tight">{messages.catalog.brandTitle || "Brands"}</h2>
        </div>

        <div className="space-y-1.5 overflow-y-auto max-h-[60vh] pr-1 no-scrollbar pt-2">
          {/* All Brands option */}
          <button
            onClick={() => handleSelect("")}
            className={cn(
              "flex w-full items-center justify-between rounded-2xl p-4 transition-all duration-300",
              brandId === "" ? "bg-brand/5 border border-brand/20" : "hover:bg-surface-accent/10 border border-transparent"
            )}
          >
            <span className={cn("text-[16px] font-bold", brandId === "" ? "text-brand" : "text-app-text/70")}>
              {messages.catalog.allBrands || "All Brands"}
            </span>
            <div className={cn(
              "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 scale-110",
              brandId === "" ? "border-brand bg-brand shadow-[0_2px_8px_rgba(255,126,139,0.3)]" : "border-surface-accent bg-transparent"
            )}>
              {brandId === "" && (
                 <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                    <polyline points="20 6 9 17 4 12" />
                 </svg>
              )}
            </div>
          </button>

          {brands.map((brand) => (
            <button
              key={brand.id}
              onClick={() => handleSelect(brand.id)}
              className={cn(
                "flex w-full items-center justify-between rounded-2xl p-4 transition-all duration-300",
                brandId === brand.id ? "bg-brand/5 border border-brand/20" : "hover:bg-surface-accent/10 border border-transparent"
              )}
            >
              <span className={cn("text-[16px] font-bold", brandId === brand.id ? "text-brand" : "text-app-text/70")}>
                {brand.name}
              </span>
              <div className={cn(
                "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 scale-110",
                brandId === brand.id ? "border-brand bg-brand shadow-[0_2px_8px_rgba(255,126,139,0.3)]" : "border-surface-accent bg-transparent"
              )}>
                {brandId === brand.id && (
                   <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                      <polyline points="20 6 9 17 4 12" />
                   </svg>
                )}
              </div>
            </button>
          ))}
        </div>
        
        <div className="pt-4 px-1">
          <button
            onClick={onBack}
            className="w-full rounded-2xl bg-surface-accent/20 py-4 text-center font-black text-app-text/80 h-14 active:scale-95 transition-all text-sm uppercase tracking-widest"
          >
             {messages.common.back || "Back"}
          </button>
        </div>
      </div>
    </Sheet>
  );
}
