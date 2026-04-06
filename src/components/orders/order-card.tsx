import Link from "next/link";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatOrderStatus, formatPaymentStatus } from "@/lib/formatters/order-status";
import { cn } from "@/lib/utils/cn";
import type { AppLocale } from "@/lib/i18n/config";
import type { Order } from "@/types/telegram-webapp";

function getStatusColorClasses(status?: string) {
  if (!status) {
    return "bg-surface-soft text-app-muted";
  }
  const normalized = status.toLowerCase();
  
  if (["completed", "delivered", "success", "paid", "approved"].includes(normalized)) {
    return "bg-emerald-100 text-emerald-700";
  }
  if (["canceled", "cancelled", "failed", "error"].includes(normalized)) {
    return "bg-rose-100 text-rose-700";
  }
  if (["new", "pending", "processing"].includes(normalized)) {
    return "bg-amber-100 text-amber-700";
  }
  return "bg-brand-soft text-brand-strong";
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
  const orderStatusClasses = getStatusColorClasses(order.status);
  const paymentStatusClasses = getStatusColorClasses(order.paymentStatus);

  return (
    <Link 
      href={`/${locale}/orders/${order.id}`}
      className="block rounded-3xl bg-surface p-4 shadow-soft active:scale-[0.98] transition-transform"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-xs text-app-muted">#{order.id}</p>
        </div>
        <div
          className={cn(
            "rounded-full px-3 py-1 text-[11px] font-bold whitespace-nowrap flex-shrink-0",
            orderStatusClasses
          )}
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
            className={`font-semibold ${
              paymentStatusClasses.replace("bg-", "").split(" ").find(c => c.startsWith("text-")) || "text-app-muted"
            }`}
          >
            {formatPaymentStatus(order.paymentStatus, locale)}
          </span>
        </p>
      ) : null}
    </Link>
  );
}
