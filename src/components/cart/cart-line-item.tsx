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
          <p className="line-clamp-2 text-sm font-semibold">{item.name}</p>
          <p className="mt-1 text-sm font-bold text-brand-strong">
            {formatCurrency(item.price * item.quantity, locale)} {currencyLabel}
          </p>
          <p className="text-xs text-app-muted">
            {item.quantity} {piecesLabel}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="soft" className="px-3 py-2" onClick={onDecrement}>
            -
          </Button>
          <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
          <Button variant="soft" className="px-3 py-2" onClick={onIncrement}>
            +
          </Button>
        </div>
        <Button variant="ghost" className="px-3 py-2 text-danger" onClick={onRemove}>
          x
        </Button>
      </div>
    </div>
  );
}
