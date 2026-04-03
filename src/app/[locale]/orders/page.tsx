"use client";

import { useParams } from "next/navigation";
import { OrderCard } from "@/components/orders/order-card";
import { SectionHeader } from "@/components/shared/section-header";
import { StateCard } from "@/components/shared/state-card";
import { useI18n } from "@/components/shared/locale-provider";
import { useOrdersData } from "@/features/orders/use-orders-data";
import { isSupportedLocale } from "@/lib/i18n/config";

export default function OrdersPage() {
  const params = useParams<{ locale: string }>();
  const locale = params.locale;
  if (!isSupportedLocale(locale)) {
    return null;
  }
  return <OrdersScreen locale={locale} />;
}

function OrdersScreen({ locale }: { locale: "uz" | "ru" }) {
  const { messages } = useI18n();
  const { primaryOrder, secondaryOrder } = useOrdersData();

  return (
    <div className="space-y-4">
      <SectionHeader title={messages.orders.title} subtitle={messages.orders.subtitle} />

      <StateCard
        title={messages.orders.noHistoryEndpoint}
        description={messages.orders.noHistoryEndpointDetail}
      />

      {primaryOrder ? (
        <OrderCard
          locale={locale}
          title={messages.orders.activeOrder}
          order={primaryOrder}
          orderItemsLabel={messages.orders.orderItems}
          paymentStatusLabel={messages.success.paymentStatus}
          currencyLabel={messages.common.som}
        />
      ) : (
        <StateCard title={messages.orders.noActiveOrder} />
      )}

      {secondaryOrder ? (
        <OrderCard
          locale={locale}
          title={messages.success.title}
          order={secondaryOrder}
          orderItemsLabel={messages.orders.orderItems}
          paymentStatusLabel={messages.success.paymentStatus}
          currencyLabel={messages.common.som}
        />
      ) : null}
    </div>
  );
}
