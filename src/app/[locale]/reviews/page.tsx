"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { StateCard } from "@/components/shared/state-card";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";
import { useI18n } from "@/components/shared/locale-provider";
import { useBootstrapStore } from "@/store/bootstrap-store";
import { useReviewsStore } from "@/store/reviews-store";
import { useOrdersStore } from "@/store/orders-store";
import { isSupportedLocale } from "@/lib/i18n/config";
import { formatCurrency } from "@/lib/formatters/currency";
import { cn } from "@/lib/utils/cn";
import { FiMessageSquare, FiStar, FiClock, FiCheck } from "react-icons/fi";

export default function ReviewsPage() {
  const params = useParams<{ locale: string }>();
  const locale = params.locale;
  if (!isSupportedLocale(locale)) {
    return null;
  }
  return <ReviewsScreen locale={locale} />;
}

function ReviewsScreen({ locale }: { locale: "uz" | "ru" }) {
  const { messages } = useI18n();
  const initData = useBootstrapStore((state) => state.initData);
  const { reviews, pendingOrders: backendPending, status, loadReviews, submitReview } = useReviewsStore();
  const orders = useOrdersStore((state) => state.orders);
  
  const pendingOrders = React.useMemo(() => {
    const backendIds = new Set(backendPending.map(o => o.id));
    const reviewedIds = new Set(reviews.map(r => r.orderId));
    
    const localPending = orders.filter(o => {
      if (!o.status) return false;
      const s = o.status.toLowerCase();
      const isCompleted = s.includes('completed') || s.includes('delivered') || s.includes('success') || s.includes('завершен') || s.includes('yەتkazib') || s.includes('yetkazib');
      if (!isCompleted) return false;
      if (backendIds.has(o.id) || reviewedIds.has(o.id)) return false;
      return true;
    });
    
    return [...backendPending, ...localPending];
  }, [backendPending, reviews, orders]);

  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initData) {
      loadReviews({ initData });
    }
  }, [initData, loadReviews]);

  const handleSubmit = async (orderId: string) => {
    const comment = comments[orderId];
    if (!comment || comment.trim().length < 3) return;

    setSubmittingId(orderId);
    try {
      await submitReview({ initData, orderId, comment });
      setComments((prev) => {
        const next = { ...prev };
        delete next[orderId];
        return next;
      });
    } catch (error) {
      console.error("Failed to submit review:", error);
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-24 pt-2">
      <SectionHeader 
        title={messages.reviews.title} 
        subtitle={messages.reviews.subtitle} 
      />

      {status === "loading" && (
        <div className="flex flex-col gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 w-full animate-pulse rounded-3xl bg-surface-accent" />
          ))}
        </div>
      )}

      {status === "error" && (
        <StateCard
          title={messages.checkout.failed}
          action={
            <Button onClick={() => loadReviews({ initData })}>
              {messages.common.retry}
            </Button>
          }
        />
      )}

      {status === "success" && pendingOrders.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <FiClock className="h-4 w-4 text-brand-strong" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-app-muted">
              {messages.reviews.pendingTitle}
            </h2>
          </div>
          {pendingOrders.map((order) => (
            <div key={order.id} className="rounded-3xl bg-surface p-4 shadow-soft">
              <div className="flex items-center justify-between border-b border-surface-accent pb-3">
                <div>
                  <p className="text-xs font-semibold text-app-muted">#{order.id.slice(-8).toUpperCase()}</p>
                  <p className="text-sm font-bold">{formatCurrency(order.totalAmount, locale)} {messages.common.som}</p>
                </div>
                <div className="text-right">
                   <p className="text-xs text-app-muted">{order.items.length} {messages.common.pieces}</p>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                <textarea
                  className="w-full rounded-2xl border-none bg-surface-soft p-3 text-sm focus:ring-1 focus:ring-brand"
                  placeholder={messages.reviews.commentPlaceholder}
                  rows={2}
                  value={comments[order.id] || ""}
                  onChange={(e) => setComments(prev => ({ ...prev, [order.id]: e.target.value }))}
                />
                <Button 
                  fullWidth 
                  variant="soft"
                  disabled={submittingId === order.id || !comments[order.id]}
                  onClick={() => handleSubmit(order.id)}
                >
                  {submittingId === order.id ? messages.common.loading : messages.reviews.submit}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {status === "success" && reviews.length > 0 && (
        <div className="space-y-4">
           <div className="flex items-center gap-2 px-1">
            <FiMessageSquare className="h-4 w-4 text-brand-strong" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-app-muted">
              {messages.reviews.historyTitle}
            </h2>
          </div>
          {reviews.map((review) => (
            <div key={review.id} className="relative rounded-3xl bg-surface p-4 shadow-soft">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm leading-relaxed">{review.comment}</p>
                  {review.order && (
                    <p className="mt-2 text-xs font-medium text-app-muted">
                      Order: #{review.order.id.slice(-8).toUpperCase()}
                    </p>
                  )}
                </div>
                <div className="ml-3 flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft text-brand-strong">
                  <FiCheck className="h-4 w-4" />
                </div>
              </div>
              {review.submittedAt && (
                <p className="mt-3 text-[10px] uppercase tracking-widest text-app-muted/60">
                   {new Date(review.submittedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {status === "success" && pendingOrders.length === 0 && reviews.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-surface-accent text-app-muted">
            <FiMessageSquare className="h-10 w-10" />
          </div>
          <p className="text-lg font-bold">{messages.reviews.emptyTitle}</p>
        </div>
      )}
    </div>
  );
}
