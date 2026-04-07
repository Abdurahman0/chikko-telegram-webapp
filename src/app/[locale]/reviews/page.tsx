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

function StarRating({ 
  value, 
  onChange, 
  readonly = false, 
  size = "md" 
}: { 
  value: number; 
  onChange?: (value: number) => void; 
  readonly?: boolean; 
  size?: "sm" | "md" | "lg" 
}) {
  const [hover, setHover] = useState(0);
  
  const sizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  };

  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={cn(
            "relative transition-all duration-300 active:scale-90 disabled:active:scale-100",
            !readonly && "cursor-pointer"
          )}
        >
          <FiStar 
            className={cn(
              sizes[size],
              "transition-colors duration-300",
              (hover || value) >= star 
                ? "fill-[#FFC107] text-[#FFC107]" 
                : "text-app-muted/30"
            )}
          />
          {!readonly && hover === star && (
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-lg bg-app-text px-2 py-1 text-[10px] font-bold text-white animate-in fade-in zoom-in duration-200">
              {star}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

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
  const { reviews, pendingOrders: backendPending, status, errorCode, errorMessage, loadReviews, submitReview } = useReviewsStore();
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
  const [ratings, setRatings] = useState<Record<string, number>>({});

  useEffect(() => {
    if (initData) {
      loadReviews({ initData });
    }
  }, [initData, loadReviews]);

  const handleSubmit = async (orderId: string) => {
    const comment = comments[orderId] || "";
    const rating = ratings[orderId];
    
    if (!rating) return;

    setSubmittingId(orderId);
    try {
      await submitReview({ initData, orderId, comment, rating });
      setComments((prev) => {
        const next = { ...prev };
        delete next[orderId];
        return next;
      });
      setRatings((prev) => {
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
          title={messages.reviews.loadFailed}
          description={errorMessage || errorCode || undefined}
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
            <div key={order.id} className="rounded-3xl bg-surface p-5 shadow-soft border border-surface-accent/30">
              <div className="flex items-center justify-between border-b border-surface-accent pb-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-app-muted/60">#{order.id.slice(-8).toUpperCase()}</p>
                  <p className="text-lg font-black text-app-text leading-tight">
                    {formatCurrency(order.totalAmount, locale)} <span className="text-xs font-bold opacity-60 ml-0.5">{messages.common.som}</span>
                  </p>
                </div>
                <div className="text-right">
                   <p className="text-xs font-bold text-app-muted bg-surface-soft px-3 py-1 rounded-full border border-surface-accent/50">
                    {order.items.length} {messages.common.pieces}
                  </p>
                </div>
              </div>
              
              <div className="mt-5 space-y-5">
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-app-muted">{messages.reviews.ratingTitle}</p>
                  <StarRating 
                    value={ratings[order.id] || 0} 
                    onChange={(val) => setRatings(prev => ({ ...prev, [order.id]: val }))} 
                    size="lg"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-app-muted">{messages.reviews.commentTitle}</p>
                  <textarea
                    className="w-full rounded-2xl border-none bg-surface-soft p-4 text-sm font-medium focus:ring-2 focus:ring-brand shadow-inner"
                    placeholder={messages.reviews.commentPlaceholder}
                    rows={3}
                    value={comments[order.id] || ""}
                    onChange={(e) => setComments(prev => ({ ...prev, [order.id]: e.target.value }))}
                  />
                </div>

                <Button 
                  fullWidth 
                  className="h-12 rounded-2xl bg-brand text-sm font-black shadow-lg shadow-brand/20 active:scale-95 transition-transform"
                  disabled={submittingId === order.id || !ratings[order.id]}
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
            <div key={review.id} className="relative rounded-3xl bg-surface p-5 shadow-soft border border-surface-accent/20 transition-all hover:bg-surface-soft/50">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <StarRating value={review.rating || 5} readonly size="sm" />
                    {review.rating && (
                      <span className="text-xs font-black text-[#FFC107]">{review.rating.toFixed(1)}</span>
                    )}
                  </div>
                  
                  {review.comment && (
                    <p className="text-sm font-medium leading-relaxed text-app-text">{review.comment}</p>
                  )}
                  
                  <div className="flex items-center gap-2">
                     {review.order && (
                      <span className="rounded-full bg-surface-soft px-2.5 py-0.5 text-[10px] font-bold text-app-muted border border-surface-accent/50">
                        #{review.order.id.slice(-8).toUpperCase()}
                      </span>
                    )}
                    {review.submittedAt && (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-app-muted/40">
                         {new Date(review.submittedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="ml-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-soft text-brand-strong shadow-sm">
                  <FiCheck className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {status === "success" && pendingOrders.length === 0 && reviews.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-surface-accent text-app-muted/50 border-4 border-surface shadow-inner">
            <FiMessageSquare className="h-10 w-10" />
          </div>
          <p className="text-xl font-black text-app-text">{messages.reviews.emptyTitle}</p>
          <p className="mt-2 text-sm font-medium text-app-muted max-w-[200px]">{messages.favorites.emptyDescription}</p>
        </div>
      )}
    </div>
  );
}
