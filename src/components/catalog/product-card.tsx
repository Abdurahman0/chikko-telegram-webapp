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
    <div className="flex h-full flex-col rounded-3xl bg-surface p-3 shadow-soft">
      <Link href={`/${locale}/product/${product.id}`}>
        <ProductImage
          src={product.image}
          alt={product.name}
          className="h-[8.5rem] w-full rounded-2xl object-cover"
        />
      </Link>
      <div className="mt-3 flex flex-1 flex-col">
        <Link href={`/${locale}/product/${product.id}`} className="block">
          <p className="truncate text-sm font-semibold">{product.name}</p>
          <p className="truncate-2 mt-1 min-h-10 text-xs text-app-muted">
            {product.shortDescription || product.description || detailsLabel}
          </p>
        </Link>
        <div className="mt-2 flex items-start justify-between gap-2">
          <p className="text-sm font-bold leading-tight">
            {formatCurrency(product.price, locale)} {currencyLabel}
          </p>
          <p
            className={`text-xs font-medium whitespace-nowrap ${
              isOut ? "text-danger" : "text-brand-strong"
            }`}
          >
            {isOut ? outOfStockLabel : inStockLabel}
          </p>
        </div>
        <Button
          fullWidth
          className="mt-3 h-10 rounded-2xl"
          onClick={() => onAddToCart(product)}
          disabled={isOut}
        >
          {addToCartLabel}
        </Button>
      </div>
    </div>
  );
}
