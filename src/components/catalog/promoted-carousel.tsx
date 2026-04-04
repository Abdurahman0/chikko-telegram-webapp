"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductImage } from "@/components/shared/product-image";
import type { AppLocale } from "@/lib/i18n/config";
import type { Product } from "@/types/telegram-webapp";
import { cn } from "@/lib/utils/cn";
import { useAppSettingsStore } from "@/store/app-settings-store";

export function PromotedCarousel({
  locale,
  products,
}: {
  locale: AppLocale;
  products: Product[];
}) {
  const autoPlayPromotions = useAppSettingsStore((state) => state.autoPlayPromotions);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!autoPlayPromotions || products.length <= 1) {
      return;
    }
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % products.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [autoPlayPromotions, products.length]);

  if (products.length === 0) {
    return null;
  }

  const safeIndex = Math.min(index, products.length - 1);

  return (
    <div className="relative overflow-hidden rounded-none bg-surface">
      <div
        className="flex transition-transform duration-500 ease-out"
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
              className="h-52 w-full object-cover"
            />
          </Link>
        ))}
      </div>

      {products.length > 1 ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5">
          {products.map((product, dotIndex) => (
            <span
              key={`${product.id}-dot`}
              className={cn(
                "h-1.5 rounded-full transition-all",
                dotIndex === safeIndex
                  ? "w-4 bg-white"
                  : "w-1.5 bg-white/65",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
