"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/shared/button";
import { SectionHeader } from "@/components/shared/section-header";
import { StateCard } from "@/components/shared/state-card";
import { useI18n } from "@/components/shared/locale-provider";
import { formatCurrency } from "@/lib/formatters/currency";
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
      <div className="rounded-3xl bg-surface p-4 shadow-soft space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-app-muted">{messages.success.orderId}</span>
          <span className="font-semibold">#{checkoutResult.order.id}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-app-muted">{messages.success.total}</span>
          <span className="font-semibold">
            {formatCurrency(checkoutResult.order.totalAmount, locale)} {messages.common.som}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-app-muted">{messages.success.paymentMethod}</span>
          <span className="font-semibold">{checkoutResult.payment.method}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-app-muted">{messages.success.status}</span>
          <span className="font-semibold">{checkoutResult.order.status ?? messages.common.unknown}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-app-muted">{messages.success.paymentStatus}</span>
          <span className="font-semibold">{checkoutResult.payment.status ?? messages.common.unknown}</span>
        </div>
      </div>

      <Link href={`/${locale}/orders`}>
        <Button fullWidth>{messages.success.toOrders}</Button>
      </Link>
    </div>
  );
}
