"use client";

import { use, useEffect, useState, useMemo } from "react";
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
import { FilterSheet, CategoryPickerSheet } from "@/components/catalog/filter-sheets";

// Temporary sheet components, will be moved to separate files in Phase 14
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
      <div className="space-y-1">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => {
              setSort(option.id);
              onClose();
            }}
            className="flex w-full items-center justify-between rounded-xl p-4 transition-colors hover:bg-surface-accent/20"
          >
            <span className={cn("text-base font-semibold", sort === option.id ? "text-app-text" : "text-app-muted")}>
              {option.label}
            </span>
            {sort === option.id && (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand p-1">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            )}
          </button>
        ))}
        
        <div className="pt-4">
          <button
            onClick={onClose}
            className="w-full rounded-2xl bg-brand py-4 text-center font-bold text-white shadow-lg active:scale-95 transition-transform"
          >
            {messages.catalog.show}
          </button>
        </div>
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
  const brand = useCatalogStore((state) => state.brand);
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

  // Initialize and update catalog data
  useCatalog();

  const activeCategory = useCatalogStore((state) => state.activeCategory);
  const brands = useCatalogStore((state) => state.brands);
  const setBrand = useCatalogStore((state) => state.setBrand);

  useEffect(() => {
    // Default to empty (all) if id is "all" or missing
    const targetId = !id || id === "all" ? "" : id;
    setCategory(targetId);
  }, [id, setCategory]);
  
  const activeCategoryData = categories.find((c) => c.id === activeCategory);
  const activeBrandData = brands.find((b) => b.id === brand);

  const categoryName = activeCategory === "" ? messages.catalog.allCategories : activeCategoryData?.name ?? messages.common.unknown;
  
  // Header title should show Brand if brand filter is active
  const headerTitle = brand && activeBrandData ? activeBrandData.name : categoryName;
  
  const productCount = messages.catalog.productCount.replace("{count}", String(products.length));

  const totalCategoryProducts = useMemo(() => {
    // If we have brands, sum their counts if possible, otherwise use products.length when no brand filter
    if (brands.length > 0) {
      return brands.reduce((acc, b) => acc + (b.productsCount ?? 0), 0);
    }
    return products.length;
  }, [brands, products]);

  const hasActiveFilters = useMemo(() => {
    return search !== "" || brand !== "" || priceFrom !== undefined || priceTo !== undefined || sort !== "popular";
  }, [search, brand, priceFrom, priceTo, sort]);

  return (
    <div className="min-h-screen bg-app-bg pb-24">
      {/* Scrollable Header (Not fixed) */}
      <header className="relative z-10 bg-app-bg px-4 pt-3 pb-2 transition-all duration-300">
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-8 shrink-0 items-center justify-start text-app-text active:scale-95 transition-transform"
          >
            <FiArrowLeft className="h-6 w-6 stroke-[2.2px]" />
          </button>
          <div className="relative flex-1 group">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={messages.catalog.searchPlaceholder}
              className="h-10 rounded-xl border-none bg-surface-accent/25 pl-10 text-xs font-medium focus:ring-1 focus:ring-brand/10 transition-all shadow-inner"
            />
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-app-muted/50 h-3.5 w-3.5" />
          </div>
        </div>

        <div className="flex items-end justify-between px-0.5 mt-1">
          <div className="flex-1">
            <h1 className="text-xl font-black text-app-text tracking-tight capitalize leading-tight">
              {headerTitle.toLowerCase()}
            </h1>
            <p className="text-[11px] font-bold text-app-muted/60 uppercase tracking-wide mt-0.5">{productCount}</p>
          </div>

          {hasActiveFilters && (
            <button 
              onClick={() => resetFilters()}
              className="text-[10px] font-black uppercase tracking-widest text-[#FF4B55] active:opacity-60 transition-opacity mb-0.5"
            >
              Tozalash
            </button>
          )}
        </div>

        {/* Control Bar (Relative) */}
        <div className="mt-3 flex items-center gap-2">
          <button 
            onClick={() => setIsSortOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-accent/20 text-app-text transition-all active:bg-surface-accent/40 shadow-sm"
            aria-label="Sort"
          >
            <TbArrowsSort className="h-4.5 w-4.5" />
          </button>
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="flex h-9 items-center gap-1.5 px-3 rounded-full bg-surface-accent/20 text-[11px] font-black uppercase tracking-wider text-app-text transition-all active:bg-surface-accent/40 shadow-sm"
          >
            <FiSliders className="h-3.5 w-3.5" />
            {messages.catalog.filterTitle}
          </button>
          
          {brand && (
            <button 
              onClick={() => setBrand("")}
              className="flex h-9 items-center gap-1.5 px-3 rounded-full bg-brand/10 text-[11px] font-black uppercase tracking-wider text-brand transition-all active:bg-brand/20 shadow-sm"
            >
              All Brands
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="px-3 pt-4">
        {status === "loading" ? (
          <ProductSkeletonGrid />
        ) : !brand && brands.length > 0 ? (
          // Brand List View (Image 1 Style)
          <div className="bg-app-bg rounded-t-3xl ">
            {/* All items entry */}
            <button
               onClick={() => {
                 // In this design, "All products" is just the current view but restricted to category
                 // Since brand is already empty, we might want to just show the products directly below
                 // But Image 1 shows it as a clickable item. If clicked, we just show the products.
                 // We'll use a state to toggle between brand list and product grid if needed, 
                 // but typically Image 1 is an "Index" view.
               }}
               className="flex w-full items-center justify-between border-b border-surface-accent/10 py-5 active:bg-surface-accent/5 transition-colors"
            >
              <span className="text-sm font-bold text-app-text">
                {messages.catalog.allProductsInCategory}
              </span>
              <div className="flex items-center gap-2">
                <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-surface-accent/20 px-2 text-[10px] font-black text-brand/80">
                  {totalCategoryProducts}
                </span>
                <FiChevronRight className="text-app-muted/40 h-4 w-4" />
              </div>
            </button>

            <div className="divide-y divide-surface-accent/5">
              {brands.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setBrand(b.id)}
                  className="flex w-full items-center justify-between py-5 active:bg-surface-accent/5 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-surface-accent/10 flex items-center justify-center text-lg font-black text-app-text/30 group-active:bg-brand/10 group-active:text-brand transition-all">
                      {b.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-[15px] font-bold text-app-text group-active:text-brand transition-colors">
                      {b.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-surface-accent/20 px-2 text-[10px] font-black text-brand/80">
                      {b.productsCount ?? 0}
                    </span>
                    <FiChevronRight className="text-app-muted/40 h-4 w-4" />
                  </div>
                </button>
              ))}
            </div>
            
            {/* If no brands but products exist, show products grid automatically */}
            {brands.length === 0 && products.length > 0 && (
               <div className="grid grid-cols-2 gap-2.5 items-stretch mt-2">
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
            )}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 gap-2.5 items-stretch">
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
          <div className="flex flex-col items-center justify-center pt-20 text-center">
            <div className="mb-4 text-4xl opacity-20">🔍</div>
            <h3 className="text-lg font-bold text-app-text">{messages.catalog.emptyTitle}</h3>
            <p className="text-sm text-app-muted">{messages.catalog.emptyDescription}</p>
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
      />

      <CategoryPickerSheet 
        isOpen={isPickerOpen} 
        onClose={() => setIsPickerOpen(false)} 
        onBack={() => {
          setIsPickerOpen(false);
          setIsFilterOpen(true);
        }}
      />
    </div>
  );
}
