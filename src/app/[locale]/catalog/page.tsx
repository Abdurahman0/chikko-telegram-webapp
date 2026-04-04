"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { CategoryChips } from "@/components/catalog/category-chips";
import { ProductCard } from "@/components/catalog/product-card";
import { ProductSkeletonGrid } from "@/components/catalog/product-skeleton-grid";
import { PromotedCarousel } from "@/components/catalog/promoted-carousel";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";
import { SectionHeader } from "@/components/shared/section-header";
import { StateCard } from "@/components/shared/state-card";
import { useI18n } from "@/components/shared/locale-provider";
import { useCatalog } from "@/features/catalog/use-catalog";
import { useBootstrapStore } from "@/store/bootstrap-store";
import { useCartStore } from "@/store/cart-store";
import { useCatalogStore } from "@/store/catalog-store";
import { useAppSettingsStore } from "@/store/app-settings-store";
import { isSupportedLocale } from "@/lib/i18n/config";

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
  const setSearch = useCatalogStore((state) => state.setSearch);
  const setCategory = useCatalogStore((state) => state.setCategory);
  const loadCatalog = useCatalogStore((state) => state.loadCatalog);
  const initData = useBootstrapStore((state) => state.initData);
  const addItem = useCartStore((state) => state.addItem);
  const decrement = useCartStore((state) => state.decrement);
  const cartItems = useCartStore((state) => state.items);
  const compactCards = useAppSettingsStore((state) => state.compactCards);
  const [flyItems, setFlyItems] = useState<FlyItem[]>([]);

  const hasProducts = useMemo(() => products.length > 0, [products.length]);

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

  return (
    <div>
      <div className="-mx-4 -mt-3">
        <PromotedCarousel locale={locale} products={promotedProducts} />
      </div>

      <SectionHeader title={messages.catalog.title} subtitle={messages.catalog.subtitle} />
      <div className="sticky top-0 z-20 bg-app-bg/95 py-3 backdrop-blur-md">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={messages.catalog.searchPlaceholder}
          className="rounded-[18px] bg-white shadow-[0_1px_0_rgba(17,49,39,0.04)]"
        />
      </div>

      <div className="space-y-4 pt-2">
        <CategoryChips
          categories={categories}
          activeCategory={activeCategory}
          allLabel={messages.catalog.allCategories}
          onSelect={setCategory}
        />

        {status === "loading" ? <ProductSkeletonGrid /> : null}

        {status === "error" ? (
          <StateCard
            title={messages.checkout.failed}
            action={
              <Button
                onClick={() =>
                  void loadCatalog({
                    initData,
                    category: activeCategory || undefined,
                    search: search || undefined,
                  })
                }
              >
                {messages.common.retry}
              </Button>
            }
          />
        ) : null}

        {status === "success" && !hasProducts ? (
          <StateCard
            title={messages.catalog.emptyTitle}
            description={messages.catalog.emptyDescription}
          />
        ) : null}

        {status === "success" && hasProducts ? (
          <div className="grid grid-cols-2 items-stretch gap-3">
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
                compact={compactCards}
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
