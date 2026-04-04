"use client";

import Link from "next/link";
import { ProductImage } from "@/components/shared/product-image";
import { Button } from "@/components/shared/button";
import { formatCurrency } from "@/lib/formatters/currency";
import type { AppLocale } from "@/lib/i18n/config";
import type { Product } from "@/types/telegram-webapp";
import { cn } from "@/lib/utils/cn";

export function ProductCard({
  locale,
  product,
  addToCartLabel,
  outOfStockLabel,
  inStockLabel,
  detailsLabel,
  currencyLabel,
  quantity,
  compact,
  onIncrement,
  onDecrement,
}: {
  locale: AppLocale;
  product: Product;
  addToCartLabel: string;
  outOfStockLabel: string;
  inStockLabel: string;
  detailsLabel: string;
  currencyLabel: string;
  quantity: number;
  compact: boolean;
  onIncrement: (product: Product, sourceElement: HTMLElement | null) => void;
  onDecrement: (productId: string) => void;
}) {
  const isOut = typeof product.stock === "number" && product.stock <= 0;

  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-3xl bg-surface shadow-soft",
        compact ? "min-h-[17.6rem] p-2.5" : "min-h-[18.8rem] p-3",
      )}
    >
      <Link href={`/${locale}/product/${product.id}`}>
        <ProductImage
          src={product.image}
          alt={product.name}
          className={cn(
            "w-full rounded-2xl object-cover",
            compact ? "h-[7.8rem]" : "h-[8.5rem]",
          )}
        />
      </Link>
      <div className={cn("flex flex-1 flex-col", compact ? "mt-2.5" : "mt-3")}>
        <Link
          href={`/${locale}/product/${product.id}`}
          className={cn("block", compact ? "min-h-[3rem]" : "min-h-[3.45rem]")}
        >
          <p className="truncate text-sm font-semibold leading-5">{product.name}</p>
          <p className="truncate-2 mt-1 h-8 text-xs leading-4 text-app-muted">
            {product.shortDescription || product.description || detailsLabel}
          </p>
        </Link>
        <div className={cn("flex items-start justify-between gap-2", compact ? "mt-1.5 h-11" : "mt-2 h-12")}>
          <p className="text-base font-bold leading-none">
            <span className="block whitespace-nowrap">
              {formatCurrency(product.price, locale)}
            </span>
            <span className="mt-0.5 block whitespace-nowrap text-[0.92rem]">
              {currencyLabel}
            </span>
          </p>
          <p
            className={`whitespace-nowrap text-xs font-medium ${
              isOut ? "text-danger" : "text-brand-strong"
            }`}
          >
            {isOut ? outOfStockLabel : inStockLabel}
          </p>
        </div>
        {quantity > 0 ? (
          <div className={cn("flex items-center justify-between rounded-2xl bg-brand-soft px-2", compact ? "mt-2 h-8" : "mt-3 h-9")}>
            <button
              type="button"
              aria-label="Decrease quantity"
              className={cn(
                "inline-flex items-center justify-center rounded-xl bg-white text-brand-strong",
                compact ? "h-6 w-6" : "h-7 w-7",
              )}
              onClick={() => onDecrement(product.id)}
            >
              -
            </button>
            <span className="text-sm font-bold text-brand-strong">{quantity}</span>
            <button
              type="button"
              aria-label="Increase quantity"
              className={cn(
                "inline-flex items-center justify-center rounded-xl bg-white text-brand-strong",
                compact ? "h-6 w-6" : "h-7 w-7",
              )}
              onClick={(event) =>
                onIncrement(product, event.currentTarget as HTMLElement)
              }
            >
              +
            </button>
          </div>
        ) : (
          <Button
            fullWidth
            className={cn("rounded-2xl", compact ? "mt-2 h-8" : "mt-3 h-9")}
            onClick={(event) =>
              onIncrement(product, event.currentTarget as HTMLElement)
            }
            disabled={isOut}
          >
            {addToCartLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
