"use client";

import { use, useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiSearch, FiSliders, FiChevronRight } from "react-icons/fi";
import { TbArrowsSort } from "react-icons/tb";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/components/shared/locale-provider";
import { useCatalogStore } from "@/store/catalog-store";
import { useCartStore } from "@/store/cart-store";
import { useCatalog } from "@/features/catalog/use-catalog";
import { ProductCard } from "@/components/catalog/product-card";
import { ProductSkeletonGrid } from "@/components/catalog/product-skeleton-grid";
import { Input } from "@/components/shared/input";
import { Sheet } from "@/components/shared/sheet";
import { FilterSheet, CategoryPickerSheet, BrandPickerSheet } from "@/components/catalog/filter-sheets";
import { triggerHaptic } from "@/lib/telegram/webapp";

function SortSheet({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { messages } = useI18n();
  const sort = useCatalogStore((state) => state.sort);
  const setSort = useCatalogStore((state) => state.setSort);

  const options = [
    { id: "new", label: messages.catalog.sortNew },
    { id: "popular", label: messages.catalog.sortPopular },
    { id: "high_rating", label: messages.catalog.sortHighRating },
    { id: "cheap", label: messages.catalog.sortCheap },
    { id: "expensive", label: messages.catalog.sortExpensive },
  ] as const;

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title={messages.catalog.sortTitle}>
      <div className="space-y-1.5 pb-2">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => {
              triggerHaptic("light");
              setSort(option.id);
              onClose();
            }}
            className={cn(
              "flex w-full items-center justify-between rounded-2xl p-4 transition-all duration-300",
              sort === option.id ? "bg-brand/5 border border-brand/20 shadow-sm" : "hover:bg-surface-accent/10 border border-transparent"
            )}
          >
            <span className={cn("text-base font-bold transition-colors", sort === option.id ? "text-brand" : "text-app-text/70")}>
              {option.label}
            </span>
            <div className={cn(
              "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 scale-110",
              sort === option.id ? "border-brand bg-brand shadow-[0_2px_8px_rgba(255,126,139,0.3)]" : "border-surface-accent bg-transparent"
            )}>
              {sort === option.id && (
                 <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                    <polyline points="20 6 9 17 4 12" />
                 </svg>
              )}
            </div>
          </button>
        ))}
      </div>
    </Sheet>
  );
}

export default function CategoryPage({
  params: paramsPromise,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = use(paramsPromise) as { locale: "uz" | "ru"; id: string };
  const router = useRouter();
  const { messages } = useI18n();

  const setCategory = useCatalogStore((state) => state.setCategory);
  const search = useCatalogStore((state) => state.search);
  const setSearch = useCatalogStore((state) => state.setSearch);
  const priceFrom = useCatalogStore((state) => state.priceFrom);
  const priceTo = useCatalogStore((state) => state.priceTo);
  const brandId = useCatalogStore((state) => state.brand);
  const sort = useCatalogStore((state) => state.sort);
  const resetFilters = useCatalogStore((state) => state.resetFilters);

  const status = useCatalogStore((state) => state.status);
  const products = useCatalogStore((state) => state.products);
  const categories = useCatalogStore((state) => state.categories);
  const cartItems = useCartStore((state) => state.items);
  const { addItem, decrement } = useCartStore();

  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isBrandPickerOpen, setIsBrandPickerOpen] = useState(false);
  const [showFloatingHeader, setShowFloatingHeader] = useState(false);
  const pageRootRef = useRef<HTMLDivElement | null>(null);
  const lastScrollTopRef = useRef(0);
  
  useCatalog();

  const brands = useCatalogStore((state) => state.brands);
  const setBrand = useCatalogStore((state) => state.setBrand);
  const activeCategory = useCatalogStore((state) => state.activeCategory);

  // Sync category ID from URL to store
  useEffect(() => {
    const targetCategory = !id || id === "all" ? "" : id;
    if (activeCategory !== targetCategory) {
      setCategory(targetCategory);
    }
  }, [id, activeCategory, setCategory]);

  const activeCategoryData = categories.find((c) => c.id === activeCategory);
  const activeBrandData = brands.find((b) => b.id === brandId);

  const categoryName = activeCategory === "" ? messages.catalog.allCategories : activeCategoryData?.name ?? messages.common.unknown;
  const headerTitle = brandId && activeBrandData ? activeBrandData.name : categoryName;
  const productCount = messages.catalog.productCount.replace("{count}", String(products.length));

  const totalCategoryProducts = useMemo(() => {
    if (brands.length > 0) {
      return brands.reduce((acc, b) => acc + (b.productsCount ?? 0), 0);
    }
    return products.length;
  }, [brands, products]);

  const hasActiveFilters = useMemo(() => {
    return search !== "" || brandId !== "" || priceFrom !== undefined || priceTo !== undefined || sort !== "popular";
  }, [search, brandId, priceFrom, priceTo, sort]);

  useEffect(() => {
    const root = pageRootRef.current;
    const scrollHost = root?.closest("main");
    if (!scrollHost) {
      return;
    }

    lastScrollTopRef.current = scrollHost.scrollTop;

    const onScroll = () => {
      const currentTop = scrollHost.scrollTop;
      const prevTop = lastScrollTopRef.current;
      const delta = currentTop - prevTop;

      if (currentTop < 80) {
        setShowFloatingHeader(false);
      } else if (delta < -8) {
        setShowFloatingHeader(true);
      } else if (delta > 8) {
        setShowFloatingHeader(false);
      }

      lastScrollTopRef.current = currentTop;
    };

    scrollHost.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      scrollHost.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div ref={pageRootRef} className="min-h-screen bg-app-bg pb-24">
      <div
        className={cn(
          "fixed left-1/2 top-3 z-40 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 transition-all duration-300",
          showFloatingHeader
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "-translate-y-3 opacity-0 pointer-events-none",
        )}
      >
        <div className="rounded-2xl border border-black/5 bg-surface/95 p-2 shadow-[0_10px_25px_rgba(0,0,0,0.12)] backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/${locale}/catalog`)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-accent/20 text-app-text transition-all active:scale-95"
              aria-label="Go to home"
            >
              <FiArrowLeft className="h-5 w-5 stroke-[2.2px]" />
            </button>
            <div className="relative flex-1 group">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={messages.catalog.searchPlaceholder}
                className="h-10 rounded-xl border-none bg-surface-accent/25 pl-10 text-[12px] font-bold focus:ring-2 focus:ring-brand/10 transition-all"
              />
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-app-muted/40 h-4 w-4" />
            </div>

            <button
              onClick={() => setIsSortOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-accent/20 text-app-text transition-all active:scale-95"
              aria-label="Sort"
            >
              <TbArrowsSort className="h-5 w-5" />
            </button>

            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-accent/20 text-app-text transition-all active:scale-95"
              aria-label="Filter"
            >
              <FiSliders className="h-4 w-4 text-brand" />
            </button>
          </div>
        </div>
      </div>
      <header className="relative z-10 bg-app-bg px-4 pt-3 pb-2 transition-all duration-300">
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-8 shrink-0 items-center justify-start text-app-text active:scale-90 transition-transform"
          >
            <FiArrowLeft className="h-6 w-6 stroke-[2.2px]" />
          </button>
          <div className="relative flex-1 group">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={messages.catalog.searchPlaceholder}
              className="h-11 rounded-xl border-none bg-surface-accent/25 pl-10 text-[13px] font-bold focus:ring-2 focus:ring-brand/10 transition-all shadow-inner"
            />
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-app-muted/40 h-4 w-4" />
          </div>
        </div>

        <div className="flex items-end justify-between px-0.5 mt-2">
          <div className="flex-1">
            <h1 className="text-2xl font-black text-app-text tracking-tight capitalize leading-none">
              {headerTitle.toLowerCase()}
            </h1>
            <p className="text-[12px] font-black text-app-muted/50 uppercase tracking-widest mt-1">{productCount}</p>
          </div>

          {(hasActiveFilters) && (
            <button 
              onClick={() => {
                triggerHaptic("medium");
                resetFilters();
              }}
              className="text-[11px] font-black uppercase tracking-widest text-brand"
            >
              {messages.common.reset}
            </button>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2.5">
          <button 
            onClick={() => setIsSortOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-accent/20 text-app-text transition-all active:scale-95 active:bg-surface-accent/40 shadow-sm border border-black/5"
            aria-label="Sort"
          >
            <TbArrowsSort className="h-5 w-5" />
          </button>
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="flex h-10 items-center gap-2 px-4 rounded-full bg-surface-accent/20 text-[11px] font-black uppercase tracking-widest text-app-text transition-all active:scale-95 active:bg-surface-accent/40 shadow-sm border border-black/5"
          >
            <FiSliders className="h-4 w-4 text-brand" />
            {messages.catalog.filterTitle}
          </button>
          
          {(brandId) && (
            <button 
              onClick={() => {
                setBrand("");
              }}
              className="flex h-10 items-center gap-1.5 px-4 rounded-full bg-brand/10 text-[11px] font-black uppercase tracking-widest text-brand transition-all active:scale-95 active:bg-brand/20 shadow-sm border border-brand/5"
            >
              {messages.catalog.allBrands}
            </button>
          )}
        </div>
      </header>

      <main className="px-3 pt-4">
        {status === "loading" ? (
          <ProductSkeletonGrid />
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 gap-2.5 items-stretch animate-in fade-in slide-in-from-bottom-4 duration-500">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                locale={locale}
                product={product}
                addToCartLabel={messages.catalog.addToCart}
                outOfStockLabel={messages.catalog.outOfStock}
                inStockLabel={messages.catalog.inStock}
                detailsLabel={messages.catalog.details}
                currencyLabel={messages.common.som}
                quantity={cartItems[product.id]?.quantity ?? 0}
                compact={false}
                showStockLabel={true}
                onIncrement={(p) => addItem(p)}
                onDecrement={(pId) => decrement(pId)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center pt-24 text-center">
            <div className="mb-6 h-20 w-20 rounded-full bg-surface-accent/10 flex items-center justify-center text-4xl opacity-40 grayscale">🔍</div>
            <h3 className="text-xl font-black text-app-text tracking-tight">{messages.catalog.emptyTitle}</h3>
            <p className="mt-2 text-[13px] font-medium text-app-muted max-w-[240px] leading-relaxed">{messages.catalog.emptyDescription}</p>
            <button 
              onClick={() => resetFilters()} 
              className="mt-8 rounded-2xl bg-brand/10 px-6 py-3 text-[12px] font-black uppercase tracking-widest text-brand active:scale-95 transition-all"
            >
               {messages.catalog.tryAnotherSearch || "Tozalash"}
            </button>
          </div>
        )}
      </main>

      {/* Modals */}
      <SortSheet isOpen={isSortOpen} onClose={() => setIsSortOpen(false)} />
      
      <FilterSheet 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)} 
        onOpenCategories={() => {
          setIsFilterOpen(false);
          setIsPickerOpen(true);
        }}
        onOpenBrands={() => {
          setIsFilterOpen(false);
          setIsBrandPickerOpen(true);
        }}
      />

      <CategoryPickerSheet 
        isOpen={isPickerOpen} 
        onClose={() => setIsPickerOpen(false)} 
        onBack={() => {
          setIsPickerOpen(false);
          setIsFilterOpen(true);
        }}
      />

      <BrandPickerSheet
        isOpen={isBrandPickerOpen}
        onClose={() => setIsBrandPickerOpen(false)} 
        onBack={() => {
          setIsBrandPickerOpen(false);
          setIsFilterOpen(true);
        }}
      />
    </div>
  );
}
