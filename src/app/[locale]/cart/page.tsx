"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CartLineItem } from "@/components/cart/cart-line-item";
import { Button } from "@/components/shared/button";
import { SectionHeader } from "@/components/shared/section-header";
import { StateCard } from "@/components/shared/state-card";
import { useI18n } from "@/components/shared/locale-provider";
import { formatCurrency } from "@/lib/formatters/currency";
import { isSupportedLocale } from "@/lib/i18n/config";
import { useCart } from "@/features/cart/use-cart";
import { useCartStore } from "@/store/cart-store";
import { useBootstrapStore } from "@/store/bootstrap-store";

export default function CartPage() {
  const params = useParams<{ locale: string }>();
  const locale = params.locale;
  if (!isSupportedLocale(locale)) {
    return null;
  }
  return <CartScreen locale={locale} />;
}

function CartScreen({ locale }: { locale: "uz" | "ru" }) {
  const { messages } = useI18n();
  const { list, totals, isEmpty } = useCart();
  const increment = useCartStore((state) => state.increment);
  const decrement = useCartStore((state) => state.decrement);
  const removeItem = useCartStore((state) => state.removeItem);
  const clear = useCartStore((state) => state.clear);
  const activeOrder = useBootstrapStore((state) => state.activeOrder);

  const hasUnpaidOrder = Boolean(
    activeOrder &&
      !["canceled", "cancelled", "failed", "error"].includes(
        activeOrder.status?.toLowerCase() || "",
      ) &&
      ["pending", "waiting", "waiting_payment", "new", ""].includes(
        activeOrder.paymentStatus?.toLowerCase() || "",
      ),
  );

  return (
    <div className="space-y-4">
      <SectionHeader
        title={messages.cart.title}
        subtitle={messages.cart.subtitle}
        right={
          !isEmpty ? (
            <Button variant="danger" onClick={clear}>
              {messages.cart.clear}
            </Button>
          ) : null
        }
      />

      {isEmpty ? (
        <StateCard
          title={messages.cart.emptyTitle}
          description={messages.cart.emptyDescription}
          action={
            <Link href={`/${locale}/catalog`}>
              <Button>{messages.common.continueShopping}</Button>
            </Link>
          }
        />
      ) : null}

      {!isEmpty ? (
        <div className="space-y-3">
          {list.map((item) => (
            <CartLineItem
              key={item.productId}
              locale={locale}
              item={item}
              currencyLabel={messages.common.som}
              piecesLabel={messages.common.pieces}
              onIncrement={() => increment(item.productId)}
              onDecrement={() => decrement(item.productId)}
              onRemove={() => removeItem(item.productId)}
            />
          ))}
        </div>
      ) : null}

      {!isEmpty ? (
        <div className="rounded-3xl bg-surface p-4 shadow-soft">
          <div className="flex items-center justify-between text-sm">
            <span>{messages.cart.subtotal}</span>
            <span>
              {formatCurrency(totals.total, locale)} {messages.common.som}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-base font-bold">
            <span>{messages.cart.total}</span>
            <span>
              {formatCurrency(totals.total, locale)} {messages.common.som}
            </span>
          </div>

          {hasUnpaidOrder ? (
            <div className="mt-4 rounded-xl bg-orange-100 p-3 text-center text-xs font-medium text-orange-700">
              {messages.cart.unpaidOrderWarning}
            </div>
          ) : null}

          {hasUnpaidOrder ? (
            <div className="mt-2 block">
              <Button fullWidth disabled>
                {messages.cart.checkout}
              </Button>
            </div>
          ) : (
            <Link href={`/${locale}/checkout`} className="mt-4 block">
              <Button fullWidth>{messages.cart.checkout}</Button>
            </Link>
          )}
        </div>
      ) : null}
    </div>
  );
}
