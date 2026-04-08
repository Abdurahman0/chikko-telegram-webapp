"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/shared/button";
import { SectionHeader } from "@/components/shared/section-header";
import { StateCard } from "@/components/shared/state-card";
import { useI18n } from "@/components/shared/locale-provider";
import { formatCurrency } from "@/lib/formatters/currency";
import {
  formatFulfillmentMethod,
  formatOrderStatus,
  formatPaymentMethod,
  formatPaymentStatus,
} from "@/lib/formatters/order-status";
import { isSupportedLocale } from "@/lib/i18n/config";
import { useCheckoutStore } from "@/store/checkout-store";

export default function SuccessPage() {
  const params = useParams<{ locale: string }>();
  const locale = params.locale;
  if (!isSupportedLocale(locale)) {
    return null;
  }
  return <SuccessScreen locale={locale} />;
}

function SuccessScreen({ locale }: { locale: "uz" | "ru" }) {
  const { messages } = useI18n();
  const checkoutResult = useCheckoutStore((state) => state.checkoutResult);

  if (!checkoutResult) {
    return (
      <StateCard
        title={messages.success.title}
        description={messages.success.subtitle}
        action={
          <Link href={`/${locale}/catalog`}>
            <Button>{messages.common.openCatalog}</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <SectionHeader title={messages.success.title} subtitle={messages.success.subtitle} />
      <div className="rounded-3xl bg-surface p-5 shadow-soft">
        <div className="mb-4 flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft text-brand-strong">
            <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" aria-hidden="true">
              <path
                d="M4.6 10.4 8.1 14l7.3-7.2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <p className="text-sm text-app-muted">
            {messages.success.created}
          </p>
        </div>

        <div className="space-y-3 rounded-2xl bg-surface-soft/70 p-4">
          <div className="flex items-start justify-between gap-4 text-sm">
            <span className="text-app-muted">{messages.success.orderId}</span>
            <span className="max-w-[70%] break-all text-right font-semibold">
              #{checkoutResult.order.id}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-app-muted">{messages.success.total}</span>
            <span className="font-semibold">
              {formatCurrency(checkoutResult.order.totalAmount, locale)} {messages.common.som}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-app-muted">{messages.success.paymentMethod}</span>
            <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand-strong">
              {formatPaymentMethod(checkoutResult.payment.method, locale)}
            </span>
          </div>
          {checkoutResult.order.fulfillmentMethod ? (
            <div className="flex items-center justify-between text-sm">
              <span className="text-app-muted">{messages.orders.fulfillmentMethod}</span>
              <span className="rounded-full bg-surface px-2.5 py-1 text-xs font-semibold text-app-text">
                {formatFulfillmentMethod(checkoutResult.order.fulfillmentMethod, locale)}
              </span>
            </div>
          ) : null}
          <div className="flex items-center justify-between text-sm">
            <span className="text-app-muted">{messages.success.status}</span>
            <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand-strong">
              {formatOrderStatus(checkoutResult.order.status, locale) || messages.common.unknown}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-app-muted">{messages.success.paymentStatus}</span>
            <span className="rounded-full bg-surface px-2.5 py-1 text-xs font-semibold text-app-text">
              {formatPaymentStatus(checkoutResult.payment.status, locale) || messages.common.unknown}
            </span>
          </div>
        </div>
      </div>

      <Link href={`/${locale}/orders`}>
        <Button fullWidth>{messages.success.toOrders}</Button>
      </Link>
    </div>
  );
}
