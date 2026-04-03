import { formatCurrency } from "@/lib/formatters/currency";
import type { AppLocale } from "@/lib/i18n/config";
import type { Order } from "@/types/telegram-webapp";

export function OrderCard({
  locale,
  title,
  order,
  orderItemsLabel,
  paymentStatusLabel,
  currencyLabel,
}: {
  locale: AppLocale;
  title: string;
  order: Order;
  orderItemsLabel: string;
  paymentStatusLabel: string;
  currencyLabel: string;
}) {
  return (
    <div className="rounded-3xl bg-surface p-4 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-xs text-app-muted">#{order.id}</p>
        </div>
        <div className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-strong">
          {order.status ?? "new"}
        </div>
      </div>
      <p className="mt-3 text-sm font-bold">
        {formatCurrency(order.totalAmount, locale)} {currencyLabel}
      </p>
      <p className="mt-2 text-xs text-app-muted">
        {orderItemsLabel}: {order.items.length}
      </p>
      {order.paymentStatus ? (
        <p className="mt-1 text-xs text-app-muted">
          {paymentStatusLabel}: {order.paymentStatus}
        </p>
      ) : null}
    </div>
  );
}
