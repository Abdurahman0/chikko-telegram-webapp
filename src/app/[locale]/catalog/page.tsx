"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
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
  useCatalog();
  const status = useCatalogStore((state) => state.status);
  const categories = useCatalogStore((state) => state.categories);
  const promotedProducts = useCatalogStore((state) => state.promotedProducts);
  const products = useCatalogStore((state) => state.products);
  const search = useCatalogStore((state) => state.search);
  const activeCategory = useCatalogStore((state) => state.activeCategory);
  const sort = useCatalogStore((state) => state.sort);
  const brand = useCatalogStore((state) => state.brand);
  const priceFrom = useCatalogStore((state) => state.priceFrom);
  const priceTo = useCatalogStore((state) => state.priceTo);
  
  const setSearch = useCatalogStore((state) => state.setSearch);
  const setCategory = useCatalogStore((state) => state.setCategory);
  const setSort = useCatalogStore((state) => state.setSort);
  const loadCatalog = useCatalogStore((state) => state.loadCatalog);
  const initData = useBootstrapStore((state) => state.initData);
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

  const { useRouter } = require("next/navigation");
  const router = useRouter();

  return (
    <div className="min-h-screen bg-app-bg pb-20">
      {/* Hero Carousel */}
      <div className="-mx-4 -mt-3">
        <PromotedCarousel locale={locale} products={promotedProducts} />
      </div>

      {/* Floating Card Container */}
      <div className="relative z-20 -mt-10 rounded-[40px] bg-surface shadow-[0_-8px_30px_rgba(0,0,0,0.04),0_20px_40px_rgba(0,0,0,0.08)]">
        <div className="px-5 pt-8 pb-4">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={messages.catalog.searchPlaceholder}
              className="h-14 rounded-2xl border-none bg-surface-accent/30 pl-12 pr-4 text-sm focus:ring-2 focus:ring-brand/20 transition-all shadow-inner"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-app-muted/60">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
          </div>

          {/* Categories Grid/Scroll */}
          <CategoryChips
            categories={categories}
            activeCategory={activeCategory}
            allLabel={messages.catalog.allCategories}
            onSelect={(id) => {
              if (id === "") {
                router.push(`/${locale}/category/all`);
              } else {
                router.push(`/${locale}/category/${id}`);
              }
            }}
          />
        </div>
      </div>

      {/* Featured/All Products Section (Optional/Simplified) */}
      <div className="mt-6 px-4">
        {status === "loading" ? <ProductSkeletonGrid /> : null}

        {status === "success" && hasProducts ? (
          <div className="grid grid-cols-2 items-stretch gap-3">
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
        ) : null}
      </div>

      <div className="pointer-events-none fixed inset-0 z-40">
        {flyItems.map((item) => (
          <div
            key={item.id}
            className="absolute h-6 w-6 overflow-hidden rounded-full border border-white bg-brand-soft shadow-md"
            style={{
              left: item.started ? item.endX : item.startX,
              top: item.started ? item.endY : item.startY,
              opacity: item.started ? 0.35 : 1,
              transform: `translate(-50%, -50%) scale(${item.started ? 0.58 : 1})`,
              transition:
                "left 620ms cubic-bezier(0.22, 1, 0.36, 1), top 620ms cubic-bezier(0.22, 1, 0.36, 1), transform 620ms cubic-bezier(0.22, 1, 0.36, 1), opacity 620ms ease",
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
