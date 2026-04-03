"use client";

import { Button } from "@/components/shared/button";
import { ProductImage } from "@/components/shared/product-image";
import { formatCurrency } from "@/lib/formatters/currency";
import type { AppLocale } from "@/lib/i18n/config";
import type { CartItem } from "@/store/cart-store";

export function CartLineItem({
  locale,
  item,
  currencyLabel,
  piecesLabel,
  onIncrement,
  onDecrement,
  onRemove,
}: {
  locale: AppLocale;
  item: CartItem;
  currencyLabel: string;
  piecesLabel: string;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-3xl bg-surface p-3 shadow-soft">
      <div className="flex gap-3">
        <ProductImage
          src={item.image}
          alt={item.name}
          className="h-20 w-20 shrink-0 rounded-2xl object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{item.name}</p>
          <p className="mt-1 text-sm font-bold text-brand-strong">
            {formatCurrency(item.price * item.quantity, locale)} {currencyLabel}
          </p>
          <p className="text-xs text-app-muted">
            {item.quantity} {piecesLabel}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Button variant="soft" className="h-9 w-9 rounded-lg px-0 text-base" onClick={onDecrement}>
            -
          </Button>
          <span className="inline-flex h-9 min-w-8 items-center justify-center text-center text-sm font-semibold">
            {item.quantity}
          </span>
          <Button variant="soft" className="h-9 w-9 rounded-lg px-0 text-base" onClick={onIncrement}>
            +
          </Button>
        </div>
        <Button
          variant="ghost"
          className="h-9 w-9 rounded-lg border-danger/20 px-0 text-danger"
          onClick={onRemove}
          aria-label="Remove item"
        >
          <svg viewBox="0 0 24 24" className="mx-auto h-3.5 w-3.5" fill="none" aria-hidden="true">
            <path
              d="M9 4h6m-8 3h10m-1 0-.4 11a2 2 0 0 1-2 1.9h-2.2a2 2 0 0 1-2-1.9L8 7m2 3v6m4-6v6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Button>
      </div>
    </div>
  );
}
