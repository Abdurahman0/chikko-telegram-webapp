"use client";

import Link from "next/link";
import Image from "next/image";
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
  showStockLabel,
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
  showStockLabel: boolean;
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
      <Link
        href={`/${locale}/product/${product.id}`}
        className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl bg-surface-soft"
      >
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            unoptimized
            className="object-cover"
          />
        ) : (
          <div className="text-sm text-app-muted">
            {product.name.slice(0, 2).toUpperCase()}
          </div>
        )}
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

        {/* Rating */}
        <div className="flex items-center gap-1 px-0.5 mt-1 animate-in fade-in slide-in-from-bottom-1 duration-500">
          <div className="flex items-center text-[#FFC107]">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2l-2.81 6.63L2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          </div>
          <span className="text-[10px] font-bold text-app-text">5.0</span>
          <span className="text-[10px] font-medium text-app-muted/60 lowercase">
            (Sharhlar yo'q)
          </span>
        </div>

        <div className={cn("flex items-start justify-between gap-2", compact ? "mt-1.5" : "mt-2")}>
          <p className="text-base font-bold leading-none">
            <span className="block whitespace-nowrap">
              {formatCurrency(product.price, locale)}
            </span>
            <span className="mt-0.5 block whitespace-nowrap text-[0.92rem]">
              {currencyLabel}
            </span>
          </p>
          {showStockLabel ? (
            <p
              className={`whitespace-nowrap text-xs font-medium ${
                isOut ? "text-danger" : "text-brand-strong"
              }`}
            >
              {isOut ? outOfStockLabel : inStockLabel}
            </p>
          ) : (
            <span />
          )}
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
