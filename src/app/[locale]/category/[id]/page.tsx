"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiSearch, FiSliders } from "react-icons/fi";
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

  useEffect(() => {
    setCategory(id === "all" ? "" : id);
  }, [id, setCategory]);

  const activeCategoryData = categories.find((c) => c.id === id);
  const categoryName = id === "all" ? messages.catalog.allCategories : activeCategoryData?.name ?? messages.common.unknown;
  const productCount = messages.catalog.productCount.replace("{count}", String(products.length));

  return (
    <div className="min-h-screen bg-app-bg pb-24">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-app-bg/95 px-6 pt-10 pb-4 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface shadow-sm border border-surface-accent/20"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <div className="relative flex-1">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={messages.catalog.searchPlaceholder}
              className="h-10 rounded-xl border-none bg-surface-accent/30 pl-10 text-sm focus:ring-1 focus:ring-brand/20 transition-all shadow-inner"
            />
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-app-muted/60 h-4 w-4" />
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-black text-app-text tracking-tight capitalize">
            {categoryName.toLowerCase()}
          </h1>
          <p className="text-sm font-medium text-app-muted/80">{productCount}</p>
        </div>

        {/* Control Bar */}
        <div className="mt-6 flex items-center gap-3">
          <button 
            onClick={() => setIsSortOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-accent/30 text-app-text transition-colors active:bg-surface-accent"
          >
            <TbArrowsSort className="h-5 w-5" />
          </button>
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-surface-accent/30 text-sm font-bold text-app-text transition-colors active:bg-surface-accent"
          >
            <FiSliders className="h-4 w-4" />
            {messages.catalog.filterTitle}
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="px-6 pt-4">
        {status === "loading" ? (
          <ProductSkeletonGrid />
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 items-stretch">
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
                onIncrement={(p, el) => addItem(p)}
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
