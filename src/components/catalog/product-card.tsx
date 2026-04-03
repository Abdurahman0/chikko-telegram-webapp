"use client";

import Link from "next/link";
import { ProductImage } from "@/components/shared/product-image";
import { Button } from "@/components/shared/button";
import { formatCurrency } from "@/lib/formatters/currency";
import type { AppLocale } from "@/lib/i18n/config";
import type { Product } from "@/types/telegram-webapp";

export function ProductCard({
  locale,
  product,
  addToCartLabel,
  outOfStockLabel,
  inStockLabel,
  detailsLabel,
  currencyLabel,
  onAddToCart,
}: {
  locale: AppLocale;
  product: Product;
  addToCartLabel: string;
  outOfStockLabel: string;
  inStockLabel: string;
  detailsLabel: string;
  currencyLabel: string;
  onAddToCart: (product: Product) => void;
}) {
  const isOut = typeof product.stock === "number" && product.stock <= 0;

  return (
    <div className="flex h-full min-h-[18.8rem] flex-col rounded-3xl bg-surface p-3 shadow-soft">
      <Link href={`/${locale}/product/${product.id}`}>
        <ProductImage
          src={product.image}
          alt={product.name}
          className="h-[8.5rem] w-full rounded-2xl object-cover"
        />
      </Link>
      <div className="mt-3 flex flex-1 flex-col">
        <Link href={`/${locale}/product/${product.id}`} className="block min-h-[3.45rem]">
          <p className="truncate text-sm font-semibold leading-5">{product.name}</p>
          <p className="truncate-2 mt-1 h-8 text-xs leading-4 text-app-muted">
            {product.shortDescription || product.description || detailsLabel}
          </p>
        </Link>
        <div className="mt-2 flex h-8 items-center justify-between gap-2">
          <p className="whitespace-nowrap text-base font-bold leading-none">
            {formatCurrency(product.price, locale)} {currencyLabel}
          </p>
          <p
            className={`whitespace-nowrap text-xs font-medium ${
              isOut ? "text-danger" : "text-brand-strong"
            }`}
          >
            {isOut ? outOfStockLabel : inStockLabel}
          </p>
        </div>
        <Button
          fullWidth
          className="mt-3 h-9 rounded-2xl"
          onClick={() => onAddToCart(product)}
          disabled={isOut}
        >
          {addToCartLabel}
        </Button>
      </div>
    </div>
  );
}
