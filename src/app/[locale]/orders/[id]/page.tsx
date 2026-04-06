"use client";

import { use, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiPackage, FiTruck, FiMapPin, FiUser, FiPhone, FiCreditCard } from "react-icons/fi";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/components/shared/locale-provider";
import { useOrdersData } from "@/features/orders/use-orders-data";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatOrderStatus, formatPaymentStatus } from "@/lib/formatters/order-status";
import { StateCard } from "@/components/shared/state-card";

function getStatusColor(status?: string) {
  if (!status) return "amber";
  const normalized = status.toLowerCase();
  if (["completed", "delivered", "success", "paid", "approved"].includes(normalized)) return "emerald";
  if (["canceled", "cancelled", "failed", "error"].includes(normalized)) return "rose";
  if (["new", "pending", "processing"].includes(normalized)) return "amber";
  return "brand";
}

export default function OrderDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = use(paramsPromise) as { locale: "uz" | "ru"; id: string };
  const { messages } = useI18n();
  const router = useRouter();
  const { orders, status } = useOrdersData();

  const order = useMemo(() => orders.find((o) => o.id === id), [orders, id]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app-bg">
        <StateCard title={messages.common.loading} />
      </div>
    );
  }

  if (!order && status === "success") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-app-bg px-4 text-center">
        <div className="mb-4 text-4xl opacity-20">🛒</div>
        <h2 className="text-xl font-bold">{messages.orders.noActiveOrder}</h2>
        <button 
          onClick={() => router.back()}
          className="mt-4 rounded-xl bg-brand px-6 py-2 font-bold text-white shadow-md active:scale-95"
        >
          {messages.common.back}
        </button>
      </div>
    );
  }

  if (!order) return null;

  const statusColor = getStatusColor(order.status);
  const colorClasses = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    brand: "bg-brand-soft text-brand-strong border-brand/10",
  }[statusColor];

  return (
    <div className="min-h-screen bg-app-bg pb-12">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center gap-4 bg-app-bg/80 px-4 py-4 backdrop-blur-md">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface shadow-sm active:scale-95"
        >
          <FiArrowLeft className="h-6 w-6 stroke-[2.5px]" />
        </button>
        <div>
          <h1 className="text-lg font-black tracking-tight">{messages.orders.title}</h1>
          <p className="text-[10px] font-bold text-app-muted/60 uppercase tracking-widest">#{order.id}</p>
        </div>
      </header>

      <main className="space-y-4 px-4 pt-2">
        {/* Status Card */}
        <div className={cn("rounded-3xl border p-5 shadow-sm", colorClasses)}>
          <div className="flex items-center gap-3">
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm")}>
              {order.status?.toLowerCase().includes('delivered') ? <FiPackage className="h-5 w-5" /> : <FiTruck className="h-5 w-5" />}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Buyurtma holati</p>
              <p className="text-base font-black">{formatOrderStatus(order.status, locale) || "New"}</p>
            </div>
          </div>
        </div>

        {/* Customer & Delivery Section */}
        {(order.contactName || order.shippingAddress) && (
          <div className="rounded-[32px] bg-surface p-6 shadow-soft space-y-5">
            <div className="flex items-center gap-3 border-b border-surface-accent/20 pb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-soft/30 text-brand">
                <FiMapPin className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-wider">{messages.checkout.addressTitle}</h3>
            </div>
            
            <div className="space-y-4">
              {order.contactName && (
                <div className="flex items-start gap-3">
                  <FiUser className="mt-0.5 h-4 w-4 text-app-muted/40" />
                  <div>
                    <p className="text-[10px] font-bold text-app-muted/60 uppercase tracking-wide">Qabul qiluvchi</p>
                    <p className="text-sm font-bold text-app-text">{order.contactName}</p>
                  </div>
                </div>
              )}
              {order.contactPhone && (
                <div className="flex items-start gap-3">
                  <FiPhone className="mt-0.5 h-4 w-4 text-app-muted/40" />
                  <div>
                    <p className="text-[10px] font-bold text-app-muted/60 uppercase tracking-wide">Telefon raqami</p>
                    <p className="text-sm font-bold text-app-text">{order.contactPhone}</p>
                  </div>
                </div>
              )}
              {order.shippingAddress && (
                <div className="flex items-start gap-3">
                  <FiMapPin className="mt-0.5 h-4 w-4 text-app-muted/40" />
                  <div>
                    <p className="text-[10px] font-bold text-app-muted/60 uppercase tracking-wide">Manzil</p>
                    <p className="text-sm font-bold text-app-text leading-relaxed">{order.shippingAddress}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Ordered Products Section */}
        <div className="rounded-[32px] bg-surface p-6 shadow-soft space-y-5">
          <div className="flex items-center gap-3 border-b border-surface-accent/20 pb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-soft/30 text-brand">
              <FiPackage className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-wider">{messages.orders.orderItems}</h3>
          </div>

          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-surface-accent/10">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-app-muted/30">
                      <FiPackage className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-app-text truncate">{item.name}</p>
                  <p className="text-[11px] font-bold text-app-muted/60 mt-0.5 tracking-wide">
                    {formatCurrency(item.price, locale)} {messages.common.som} × {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-app-text">
                    {formatCurrency(item.price * item.quantity, locale)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="rounded-[32px] bg-surface p-6 shadow-soft space-y-4">
           {order.paymentStatus && (
              <div className="flex items-center justify-between border-b border-surface-accent/10 pb-4">
                <div className="flex items-center gap-2">
                  <FiCreditCard className="text-app-muted/40 h-4 w-4" />
                  <span className="text-[10px] font-bold text-app-muted/60 uppercase tracking-widest">{messages.success.paymentStatus}</span>
                </div>
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest",
                   order.paymentStatus.toLowerCase().includes('paid') || order.paymentStatus.toLowerCase().includes('success') 
                   ? "text-emerald-600" : "text-amber-600"
                )}>
                  {formatPaymentStatus(order.paymentStatus, locale)}
                </span>
              </div>
           )}
           
           <div className="flex items-center justify-between pt-1">
             <span className="text-base font-black uppercase tracking-[0.1em] text-app-text">Jami</span>
             <span className="text-xl font-black text-brand">
                {formatCurrency(order.totalAmount, locale)} {messages.common.som}
             </span>
           </div>
        </div>
        
        {/* Footer info */}
        {order.createdAt && (
          <p className="text-center text-[10px] font-bold text-app-muted/40 uppercase tracking-widest pt-4">
             Buyurtma qilingan vaqti: {new Date(order.createdAt).toLocaleString(locale === 'uz' ? 'uz-UZ' : 'ru-RU')}
          </p>
        )}
      </main>
    </div>
  );
}
