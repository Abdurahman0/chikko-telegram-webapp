"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/shared/button";
import { FloatingBackButton } from "@/components/shared/floating-back-button";
import { FloatingShareButton } from "@/components/shared/floating-share-button";
import { StateCard } from "@/components/shared/state-card";
import { useI18n } from "@/components/shared/locale-provider";
import { formatCurrency } from "@/lib/formatters/currency";
import { isSupportedLocale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils/cn";
import { useBootstrapStore } from "@/store/bootstrap-store";
import { useCartStore } from "@/store/cart-store";
import { useCatalogStore } from "@/store/catalog-store";
import { useFavoritesStore } from "@/store/favorites-store";
import { FiHeart } from "react-icons/fi";

export default function ProductPage() {
  const params = useParams<{ locale: string; id: string }>();
  const locale = params.locale;
  const productId = params.id;

  if (!isSupportedLocale(locale) || !productId) {
    return null;
  }

  return <ProductScreen locale={locale} productId={productId} />;
}

function ProductScreen({
  locale,
  productId,
}: {
  locale: "uz" | "ru";
  productId: string;
}) {
  const { messages } = useI18n();
  const [activeImage, setActiveImage] = useState(0);
  const initData = useBootstrapStore((state) => state.initData);
  const products = useCatalogStore((state) => state.products);
  const status = useCatalogStore((state) => state.status);
  const loadCatalog = useCatalogStore((state) => state.loadCatalog);
  const addItem = useCartStore((state) => state.addItem);
  const increment = useCartStore((state) => state.increment);
  const decrement = useCartStore((state) => state.decrement);
  const cartItems = useCartStore((state) => state.items);
  const favoriteProducts = useFavoritesStore((state) => state.products);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  
  const isFavorite = useMemo(
    () => favoriteProducts.some((p) => p.id === productId),
    [favoriteProducts, productId],
  );

  const product = useMemo(
    () => products.find((item) => item.id === productId) ?? null,
    [products, productId],
  );

  useEffect(() => {
    if (product) {
      return;
    }
    void loadCatalog({ initData });
  }, [product, loadCatalog, initData]);

  if (status === "loading" && !product) {
    return <StateCard title={messages.common.loading} />;
  }

  if (!product) {
    return (
      <StateCard
        title={messages.product.notFound}
        description={messages.product.noEndpointNote}
        action={
          <Link href={`/${locale}/catalog`}>
            <Button>{messages.common.openCatalog}</Button>
          </Link>
        }
      />
    );
  }

  const images =
    product.images.length > 0
      ? product.images
      : [product.image].filter((value): value is string => Boolean(value));
  const currentImage = images[activeImage] ?? null;
  const isOut = typeof product.stock === "number" && product.stock <= 0;
  
  const inCartQuantity = cartItems[product.id]?.quantity || 0;

  return (
    <div className="pb-8">
      <FloatingBackButton href={`/${locale}/catalog`} />
      <div className="fixed right-4 top-4 z-50 flex flex-col gap-3">
        <FloatingShareButton productId={product.id} productName={product.name} />
        <button
          onClick={() => toggleFavorite({ initData, productId: product.id })}
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full shadow-soft transition-all active:scale-90",
            isFavorite ? "bg-brand text-white" : "bg-surface text-app-muted"
          )}
          aria-label="Toggle favorite"
        >
          <FiHeart className={cn("h-6 w-6", isFavorite && "fill-current")} />
        </button>
      </div>

      <div className="overflow-hidden rounded-b-[2.5rem] bg-surface pb-5 shadow-soft">
        <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden bg-surface-soft">
          {currentImage ? (
            <Image
              src={currentImage}
              alt={product.name}
              fill
              sizes="100vw"
              unoptimized
              className="object-cover"
            />
          ) : (
            <div className="text-2xl text-app-muted">
              {product.name.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        {images.length > 1 ? (
          <div className="mt-3 flex gap-2 overflow-x-auto px-4">
            {images.map((image, index) => (
              <button
                key={`${image}-${index}`}
                onClick={() => setActiveImage(index)}
                className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border ${
                  index === activeImage ? "border-brand" : "border-surface-accent"
                }`}
              >
                <Image
                  src={image}
                  alt={`${product.name}-${index + 1}`}
                  width={120}
                  height={120}
                  unoptimized
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        ) : null}

        <div className="mt-4 px-4">
          <h1 className="text-xl font-bold">{product.name}</h1>
          {product.description || product.shortDescription ? (
            <p className="mt-2 text-sm text-app-muted">{product.description || product.shortDescription}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-2 space-y-2">
        <div className="rounded-[2rem] bg-surface p-5 shadow-soft">
          <p className="text-xl font-bold">
            {formatCurrency(product.price, locale)} {messages.common.som}
          </p>
          <p className={`mt-2 text-sm font-semibold ${isOut ? "text-danger" : "text-brand-strong"}`}>
            {isOut
              ? messages.product.outOfStock
              : `${messages.product.stockLeft}: ${product.stock ?? messages.common.unknown}`}
          </p>
        </div>

        <div className="rounded-[2rem] bg-surface p-5 shadow-soft">
          {inCartQuantity === 0 ? (
            <Button
              fullWidth
              onClick={() => addItem(product, 1)}
              disabled={isOut}
            >
              {messages.product.addToCart}
            </Button>
          ) : (
            <div>
              <p className="mb-4 text-center text-sm font-semibold text-brand-strong">
                {messages.product.inCart} {inCartQuantity} {messages.common.pieces}
              </p>
              <div className="flex items-center justify-between gap-3">
                <Button
                  variant="soft"
                  className="flex-1"
                  onClick={() => decrement(product.id)}
                >
                  -
                </Button>
                <div className="w-12 text-center text-xl font-bold">{inCartQuantity}</div>
                <Button
                  variant="soft"
                  className="flex-1"
                  onClick={() => increment(product.id)}
                  disabled={
                    typeof product.stock === "number" &&
                    inCartQuantity >= product.stock
                  }
                >
                  +
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
