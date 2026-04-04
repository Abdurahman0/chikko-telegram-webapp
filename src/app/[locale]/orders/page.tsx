"use client";

import { useParams } from "next/navigation";
import { Button } from "@/components/shared/button";
import { OrderCard } from "@/components/orders/order-card";
import { SectionHeader } from "@/components/shared/section-header";
import { StateCard } from "@/components/shared/state-card";
import { useI18n } from "@/components/shared/locale-provider";
import { useOrdersData } from "@/features/orders/use-orders-data";
import { isSupportedLocale } from "@/lib/i18n/config";
import { useBootstrapStore } from "@/store/bootstrap-store";

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
  const { status, orders, guestMode, reload } = useOrdersData();
  const telegramUser = useBootstrapStore((state) => state.telegramUser);
  const showGuestMode = guestMode && !telegramUser?.id;

  return (
    <div className="space-y-4">
      <SectionHeader title={messages.orders.title} subtitle={messages.orders.subtitle} />

      {showGuestMode ? (
        <StateCard title={messages.orders.guestModeTitle} description={messages.orders.guestModeDescription} />
      ) : null}

      {status === "loading" ? <StateCard title={messages.common.loading} /> : null}

      {status === "error" ? (
        <StateCard
          title={messages.checkout.failed}
          action={<Button onClick={() => void reload()}>{messages.common.retry}</Button>}
        />
      ) : null}

      {status === "success" && orders.length === 0 ? (
        <StateCard title={messages.orders.noActiveOrder} />
      ) : null}

      {status === "success"
        ? orders.map((order, index) => (
        <OrderCard
          key={order.id}
          locale={locale}
          title={index === 0 ? messages.orders.activeOrder : messages.orders.historyOrder}
          order={order}
          orderItemsLabel={messages.orders.orderItems}
          paymentStatusLabel={messages.success.paymentStatus}
          currencyLabel={messages.common.som}
        />
          ))
        : null}
    </div>
  );
}
