import { formatCurrency } from "@/lib/formatters/currency";
import { formatOrderStatus, formatPaymentStatus } from "@/lib/formatters/order-status";
import type { AppLocale } from "@/lib/i18n/config";
import type { Order } from "@/types/telegram-webapp";

function isCanceledStatus(status?: string) {
  if (!status) {
    return false;
  }
  const normalized = status.toLowerCase();
  return normalized === "canceled" || normalized === "cancelled";
}

function isPaidStatus(status?: string) {
  if (!status) {
    return false;
  }
  const normalized = status.toLowerCase();
  return normalized === "paid" || normalized === "success";
}

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
  const isCanceled = isCanceledStatus(order.status);
  const isPaymentCanceled = isCanceledStatus(order.paymentStatus);
  const isPaymentPaid = isPaidStatus(order.paymentStatus);

  return (
    <div className="rounded-3xl bg-surface p-4 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-xs text-app-muted">#{order.id}</p>
        </div>
        <div
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            isCanceled ? "bg-red-100 text-red-700" : "bg-brand-soft text-brand-strong"
          }`}
        >
          {formatOrderStatus(order.status, locale) || "New"}
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
          {paymentStatusLabel}:{" "}
          <span
            className={
              isPaymentCanceled
                ? "font-semibold text-red-700"
                : isPaymentPaid
                  ? "font-semibold text-brand-strong"
                  : "font-medium text-app-muted"
            }
          >
            {formatPaymentStatus(order.paymentStatus, locale)}
          </span>
        </p>
      ) : null}
    </div>
  );
}
