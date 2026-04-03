"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/shared/button";
import { SectionHeader } from "@/components/shared/section-header";
import { StateCard } from "@/components/shared/state-card";
import { useI18n } from "@/components/shared/locale-provider";
import { formatCurrency } from "@/lib/formatters/currency";
import { isSupportedLocale } from "@/lib/i18n/config";
import { useBootstrapStore } from "@/store/bootstrap-store";
import { useCartStore } from "@/store/cart-store";
import { useCatalogStore } from "@/store/catalog-store";

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
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const initData = useBootstrapStore((state) => state.initData);
  const products = useCatalogStore((state) => state.products);
  const status = useCatalogStore((state) => state.status);
  const loadCatalog = useCatalogStore((state) => state.loadCatalog);
  const addItem = useCartStore((state) => state.addItem);

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

  return (
    <div className="space-y-4 pt-12">
      <Link
        href={`/${locale}/catalog`}
        className="fixed left-4 top-4 z-40 inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface text-brand-strong shadow-soft ring-1 ring-surface-accent"
        aria-label="Go back"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M15 6 9 12l6 6"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>

      <SectionHeader title={product.name} subtitle={messages.product.noEndpointNote} />

      <div className="rounded-3xl bg-surface p-3 shadow-soft">
        <div className="overflow-hidden rounded-2xl bg-surface-soft">
          {currentImage ? (
            <Image
              src={currentImage}
              alt={product.name}
              width={900}
              height={900}
              unoptimized
              className="h-64 w-full object-cover"
            />
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-app-muted">
              {product.name.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        {images.length > 1 ? (
          <div className="mt-3 flex gap-2 overflow-x-auto">
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
      </div>

      <div className="rounded-3xl bg-surface p-4 shadow-soft">
        <p className="text-xl font-bold">
          {formatCurrency(product.price, locale)} {messages.common.som}
        </p>
        <p className="mt-2 text-sm text-app-muted">{product.description || product.shortDescription}</p>
        <p className={`mt-3 text-sm font-semibold ${isOut ? "text-danger" : "text-brand-strong"}`}>
          {isOut
            ? messages.product.outOfStock
            : `${messages.product.stockLeft}: ${product.stock ?? messages.common.unknown}`}
        </p>
      </div>

      <div className="rounded-3xl bg-surface p-4 shadow-soft">
        <p className="text-sm font-semibold">{messages.product.quantity}</p>
        <div className="mt-2 flex items-center gap-2">
          <Button variant="soft" onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}>
            -
          </Button>
          <div className="min-w-10 text-center text-base font-semibold">{quantity}</div>
          <Button variant="soft" onClick={() => setQuantity((prev) => prev + 1)}>
            +
          </Button>
        </div>
        <Button
          fullWidth
          className="mt-4"
          onClick={() => addItem(product, quantity)}
          disabled={isOut}
        >
          {messages.product.addToCart}
        </Button>
      </div>
    </div>
  );
}
