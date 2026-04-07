"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { ProductCard } from "@/components/catalog/product-card";
import { ProductSkeletonGrid } from "@/components/catalog/product-skeleton-grid";
import { StateCard } from "@/components/shared/state-card";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/shared/button";
import { useI18n } from "@/components/shared/locale-provider";
import { useBootstrapStore } from "@/store/bootstrap-store";
import { useFavoritesStore } from "@/store/favorites-store";
import { useCartStore } from "@/store/cart-store";
import { isSupportedLocale } from "@/lib/i18n/config";
import { FiHeart } from "react-icons/fi";
import Link from "next/link";

export default function FavoritesPage() {
  const params = useParams<{ locale: string }>();
  const locale = params.locale;
  if (!isSupportedLocale(locale)) {
    return null;
  }
  return <FavoritesScreen locale={locale} />;
}

function FavoritesScreen({ locale }: { locale: "uz" | "ru" }) {
  const { messages } = useI18n();
  const initData = useBootstrapStore((state) => state.initData);
  const products = useFavoritesStore((state) => state.products);
  const loadStatus = useFavoritesStore((state) => state.loadStatus);
  const loadFavorites = useFavoritesStore((state) => state.loadFavorites);
  
  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const decrement = useCartStore((state) => state.decrement);

  useEffect(() => {
    if (initData) {
      loadFavorites({ initData });
    }
  }, [initData, loadFavorites]);

  const handleAddToCart = (
    product: (typeof products)[number],
    sourceElement: HTMLElement | null,
  ) => {
    addItem(product);
    // Generic add animation or feedback could go here if needed
  };

  return (
    <div className="space-y-4 pt-2">
      <SectionHeader 
        title={messages.favorites.title} 
        subtitle={messages.favorites.subtitle} 
      />

      {loadStatus === "loading" ? <ProductSkeletonGrid /> : null}

      {loadStatus === "error" ? (
        <StateCard
          title={messages.favorites.loadFailed}
          action={
            <Button onClick={() => loadFavorites({ initData })}>
              {messages.common.retry}
            </Button>
          }
        />
      ) : null}

      {loadStatus === "success" && products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-surface-accent text-app-muted">
            <FiHeart className="h-10 w-10" />
          </div>
          <p className="text-lg font-bold">{messages.favorites.emptyTitle}</p>
          <p className="mb-6 mt-1 text-sm text-app-muted">
            {messages.favorites.emptyDescription}
          </p>
          <Link href={`/${locale}/catalog`}>
            <Button>{messages.common.openCatalog}</Button>
          </Link>
        </div>
      ) : null}

      {loadStatus === "success" && products.length > 0 ? (
        <div className="grid grid-cols-2 items-stretch gap-3 pb-20">
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
              compact={true}
              showStockLabel={false}
              onIncrement={handleAddToCart}
              onDecrement={decrement}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
