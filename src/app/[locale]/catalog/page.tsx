"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CategoryChips } from "@/components/catalog/category-chips";
import { ProductCard } from "@/components/catalog/product-card";
import { ProductSkeletonGrid } from "@/components/catalog/product-skeleton-grid";
import { PromotedCarousel } from "@/components/catalog/promoted-carousel";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";
import { StateCard } from "@/components/shared/state-card";
import { useI18n } from "@/components/shared/locale-provider";
import { isSupportedLocale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils/cn";
import { useCatalog } from "@/features/catalog/use-catalog";
import { useBootstrapStore } from "@/store/bootstrap-store";
import { useCartStore } from "@/store/cart-store";
import { useCatalogStore } from "@/store/catalog-store";
import { useAppSettingsStore } from "@/store/app-settings-store";

export default function CatalogPage() {
  const params = useParams<{ locale: string }>();
  const locale = params.locale;
  if (!isSupportedLocale(locale)) {
    return null;
  }
  return <CatalogScreen locale={locale} />;
}

function CatalogScreen({ locale }: { locale: "uz" | "ru" }) {
  type FlyItem = {
    id: string;
    image: string | null;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    started: boolean;
  };

  const { messages } = useI18n();
  const router = useRouter();

  const setSearch = useCatalogStore((state) => state.setSearch);
  const setCategory = useCatalogStore((state) => state.setCategory);
  const activeCategory = useCatalogStore((state) => state.activeCategory);
  const categories = useCatalogStore((state) => state.categories);
  const products = useCatalogStore((state) => state.products);
  const promotedProducts = useCatalogStore((state) => state.promotedProducts);
  const search = useCatalogStore((state) => state.search);

  // Synchronize category to "All" ("") when on the Home page
  useEffect(() => {
    if (activeCategory !== "") {
      setCategory("");
    }
  }, [activeCategory, setCategory]);

  useCatalog();
  const status = useCatalogStore((state) => state.status);
  const addItem = useCartStore((state) => state.addItem);
  const decrement = useCartStore((state) => state.decrement);
  const cartItems = useCartStore((state) => state.items);
  const hideOutOfStock = useAppSettingsStore((state) => state.hideOutOfStock);
  const showStockLabel = useAppSettingsStore((state) => state.showStockLabel);
  const compactCards = useAppSettingsStore((state) => state.compactCards);
  const [flyItems, setFlyItems] = useState<FlyItem[]>([]);

  const visibleProducts = useMemo(
    () =>
      hideOutOfStock
        ? products.filter((product) => product.stock === null || product.stock === undefined || product.stock > 0)
        : products,
    [hideOutOfStock, products],
  );

  const hasProducts = useMemo(() => visibleProducts.length > 0, [visibleProducts.length]);

  const handleAddToCart = (
    product: (typeof products)[number],
    sourceElement: HTMLElement | null,
  ) => {
    addItem(product);

    const cartFooterTarget = document.querySelector(
      '[data-cart-target="true"]',
    ) as HTMLElement | null;

    if (!sourceElement || !cartFooterTarget) {
      return;
    }

    const sourceRect = sourceElement.getBoundingClientRect();
    const targetRect = cartFooterTarget.getBoundingClientRect();
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;

    const next: FlyItem = {
      id,
      image: product.image ?? product.images[0] ?? null,
      startX: sourceRect.left + sourceRect.width / 2,
      startY: sourceRect.top + sourceRect.height / 2,
      endX: targetRect.left + targetRect.width / 2,
      endY: targetRect.top + targetRect.height / 2,
      started: false,
    };

    setFlyItems((prev) => [...prev, next]);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setFlyItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, started: true } : item)),
        );
      });
    });

    setTimeout(() => {
      setFlyItems((prev) => prev.filter((item) => item.id !== id));
    }, 700);
  };

  // Synchronize category to "All" ("") when on the Home page
  // (Removed duplicate call from here, now handled by useEffect above)

  return (
    <div className="min-h-screen bg-app-bg">
      {/* Hero Carousel */}
      <div className="-mx-4 -mt-3 overflow-hidden shadow-md">
        <PromotedCarousel locale={locale} products={promotedProducts} />
      </div>

      {/* Floating Card Container */}
      <div className="relative z-20 -mt-10 rounded-t-[44px] bg-surface shadow-[0_-12px_40px_rgba(0,0,0,0.06),0_20px_40px_rgba(0,0,0,0.12)]">
        <div className="px-5 pt-10 pb-6">
          {/* Search Bar & Reset */}
          <div className="relative flex items-center gap-3 mb-8">
            <div className="relative flex-1 group">
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={messages.catalog.searchPlaceholder}
                className="h-14 rounded-2xl border-none bg-surface-accent/20 pl-12 pr-4 text-[14px] font-bold focus:ring-[3px] focus:ring-brand/10 transition-all shadow-inner"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-app-muted/30 group-focus-within:text-brand transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
            </div>
            
            <button 
              onClick={() => {
                setSearch("");
                setCategory("");
              }}
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-accent/20 text-brand transition-all active:scale-90 active:bg-surface-accent/40 shadow-sm group"
              aria-label="Reset filters"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-active:rotate-180 duration-500"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>
          </div>

          {/* New Catalog Title */}
          <div className="flex items-center justify-between mb-5 px-1">
             <h2 className="text-[14px] font-black uppercase tracking-widest text-app-text/90">
               {messages.catalog.categoryTitle}
             </h2>
             <div className="h-px flex-1 mx-4 bg-surface-accent/30" />
          </div>

          {/* Categories Grid/Scroll */}
          <CategoryChips
            categories={categories}
            activeCategory={activeCategory}
            allLabel={messages.catalog.allCategories}
            onSelect={(id) => {
              const targetId = id === "" ? "all" : id;
              router.push(`/${locale}/category/${targetId}`);
            }}
          />
        </div>
      </div>

      {/* Featured/All Products Section */}
      <div className="mt-8 px-3.5">
        {status === "loading" ? <ProductSkeletonGrid /> : null}

        {status === "success" && hasProducts ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between px-1.5">
               <h2 className="text-[14px] font-black uppercase tracking-widest text-app-text/90">
                 {messages.catalog.sortPopular}
               </h2>
               <button 
                 onClick={() => router.push(`/${locale}/category/all`)}
                 className="text-[11px] font-black uppercase tracking-widest text-brand"
               >
                 {messages.catalog.viewAll}
               </button>
            </div>
            
            <div className="grid grid-cols-2 items-stretch gap-3 animate-in fade-in slide-in-from-bottom-6 duration-700">
              {visibleProducts.slice(0, 10).map((product) => (
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
                  compact={compactCards}
                  showStockLabel={showStockLabel}
                  onIncrement={handleAddToCart}
                  onDecrement={decrement}
                />
              ))}
            </div>
          </div>
        ) : status === "success" && !hasProducts ? (
           <div className="flex flex-col items-center justify-center pt-10 pb-20 text-center opacity-60">
              <div className="mb-4 text-4xl grayscale">📦</div>
              <h3 className="text-lg font-bold text-app-text">{messages.catalog.emptyTitle}</h3>
              <p className="text-sm text-app-muted">{messages.catalog.emptyDescription}</p>
           </div>
        ) : null}
      </div>

      <div className="pointer-events-none fixed inset-0 z-40">
        {flyItems.map((item) => (
          <div
            key={item.id}
            className="absolute h-8 w-8 overflow-hidden rounded-xl border-2 border-white bg-brand shadow-xl z-50"
            style={{
              left: item.started ? item.endX : item.startX,
              top: item.started ? item.endY : item.startY,
              opacity: item.started ? 0.2 : 1,
              transform: `translate(-50%, -50%) scale(${item.started ? 0.4 : 1})`,
              transition:
                "left 650ms cubic-bezier(0.22, 1, 0.36, 1), top 650ms cubic-bezier(0.22, 1, 0.36, 1), transform 650ms cubic-bezier(0.22, 1, 0.36, 1), opacity 650ms ease",
              backgroundImage: item.image ? `url(${item.image})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        ))}
      </div>
    </div>
  );
}
