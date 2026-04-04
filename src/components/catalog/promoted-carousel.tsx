"use client";

import Link from "next/link";
import { useState } from "react";
import { ProductImage } from "@/components/shared/product-image";
import type { AppLocale } from "@/lib/i18n/config";
import type { Product } from "@/types/telegram-webapp";
import { cn } from "@/lib/utils/cn";

export function PromotedCarousel({
  locale,
  products,
}: {
  locale: AppLocale;
  products: Product[];
}) {
  const [index, setIndex] = useState(0);

  if (products.length === 0) {
    return null;
  }

  const safeIndex = Math.min(index, products.length - 1);

  return (
    <div className="rounded-3xl bg-surface p-2 shadow-soft">
      <div className="relative overflow-hidden rounded-2xl">
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${safeIndex * 100}%)` }}
        >
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/${locale}/product/${product.id}`}
              className="block w-full shrink-0"
            >
              <ProductImage
                src={product.image}
                alt={product.name}
                className="h-44 w-full object-cover"
              />
            </Link>
          ))}
        </div>

        {products.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => setIndex((prev) => Math.max(0, prev - 1))}
              disabled={safeIndex === 0}
              className="absolute left-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white disabled:opacity-35"
              aria-label="Previous"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() =>
                setIndex((prev) => Math.min(products.length - 1, prev + 1))
              }
              disabled={safeIndex === products.length - 1}
              className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white disabled:opacity-35"
              aria-label="Next"
            >
              ›
            </button>
          </>
        ) : null}
      </div>

      {products.length > 1 ? (
        <div className="mt-2 flex items-center justify-center gap-1.5">
          {products.map((product, dotIndex) => (
            <button
              key={`${product.id}-dot`}
              type="button"
              aria-label={`Slide ${dotIndex + 1}`}
              onClick={() => setIndex(dotIndex)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                dotIndex === safeIndex ? "w-4 bg-brand" : "w-1.5 bg-surface-accent",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
