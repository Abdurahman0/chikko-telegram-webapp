"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/shared/button";
import { FloatingBackButton } from "@/components/shared/floating-back-button";
import { FloatingShareButton } from "@/components/shared/floating-share-button";
import { StateCard } from "@/components/shared/state-card";
import { useI18n } from "@/components/shared/locale-provider";
import { formatCurrency } from "@/lib/formatters/currency";
import { isSupportedLocale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils/cn";
import { useBootstrapStore } from "@/store/bootstrap-store";
import { useCartStore } from "@/store/cart-store";
import { useCatalogStore } from "@/store/catalog-store";
import { useFavoritesStore } from "@/store/favorites-store";
import { useReviewsStore } from "@/store/reviews-store";
import { FiHeart, FiShoppingCart, FiMinus, FiPlus, FiStar, FiMessageSquare } from "react-icons/fi";

export default function ProductPage() {
  const params = useParams<{ locale: string; id: string }>();
  const locale = params.locale;
  const productId = params.id;

  if (!isSupportedLocale(locale) || !productId) {
    return null;
  }

  return <ProductScreen locale={locale} productId={productId} />;
}

function ProductScreen({
  locale,
  productId,
}: {
  locale: "uz" | "ru";
  productId: string;
}) {
  const { messages } = useI18n();
  const [activeImage, setActiveImage] = useState(0);
  const initData = useBootstrapStore((state) => state.initData);
  const products = useCatalogStore((state) => state.products);
  const status = useCatalogStore((state) => state.status);
  const loadCatalog = useCatalogStore((state) => state.loadCatalog);
  const addItem = useCartStore((state) => state.addItem);
  const increment = useCartStore((state) => state.increment);
  const decrement = useCartStore((state) => state.decrement);
  const cartItems = useCartStore((state) => state.items);
  const favoriteProducts = useFavoritesStore((state) => state.products);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const reviews = useReviewsStore((state) => state.reviews);
  const reviewsStatus = useReviewsStore((state) => state.status);
  const loadReviews = useReviewsStore((state) => state.loadReviews);
  
  const isFavorite = useMemo(
    () => favoriteProducts.some((p) => p.id === productId),
    [favoriteProducts, productId],
  );

  const product = useMemo(
    () => products.find((item) => item.id === productId) ?? null,
    [products, productId],
  );
  const productReviews = useMemo(
    () =>
      reviews.filter((review) =>
        review.order?.items?.some((item) => String(item.productId) === String(productId)),
      ),
    [reviews, productId],
  );
  const hasProductReviews = productReviews.length > 0;

  useEffect(() => {
    if (product) {
      return;
    }
    void loadCatalog({ initData });
  }, [product, loadCatalog, initData]);

  useEffect(() => {
    if (!initData || reviewsStatus !== "idle") {
      return;
    }
    void loadReviews({ initData });
  }, [initData, loadReviews, reviewsStatus]);

  if (status === "loading" && !product) {
    return <StateCard title={messages.common.loading} />;
  }

  if (!product) {
    return (
      <StateCard
        title={messages.product.notFound}
        description={messages.product.noEndpointNote}
        action={
          <Link href={`/${locale}/catalog`}>
            <Button>{messages.common.openCatalog}</Button>
          </Link>
        }
      />
    );
  }

  const images =
    product.images.length > 0
      ? product.images
      : [product.image].filter((value): value is string => Boolean(value));
  const currentImage = images[activeImage] ?? null;
  const isOut = typeof product.stock === "number" && product.stock <= 0;
  
  const inCartQuantity = cartItems[product.id]?.quantity || 0;

  return (
    <div className="pb-32">
      {/* Header Actions */}
      <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-4 pt-4 pointer-events-none">
        <div className="pointer-events-auto">
          <FloatingBackButton href={`/${locale}/catalog`} className="static translate-y-0" />
        </div>
        <div className="flex gap-2 pointer-events-auto">
          <button
            onClick={() => toggleFavorite({ initData, product })}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full shadow-soft backdrop-blur-md transition-all active:scale-90",
              isFavorite ? "bg-white text-[#FF4B55]" : "bg-white/80 text-app-muted"
            )}
            aria-label="Toggle favorite"
          >
            <FiHeart className={cn("h-5 w-5", isFavorite && "fill-current")} />
          </button>
          <FloatingShareButton 
            productId={product.id} 
            productName={product.name} 
            className="static translate-y-0 h-10 w-10 bg-white/80 backdrop-blur-md" 
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-b-[2.5rem] bg-surface pb-5 shadow-soft">
        <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden bg-[#F9FAFB]">
          {currentImage ? (
            <Image
              src={currentImage}
              alt={product.name}
              fill
              sizes="100vw"
              unoptimized
              className="object-contain p-6"
            />
          ) : (
            <div className="text-2xl text-app-muted">
              {product.name.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        {images.length > 1 ? (
          <div className="mt-3 flex gap-2 overflow-x-auto px-4">
            {images.map((image, index) => (
              <button
                key={`${image}-${index}`}
                onClick={() => setActiveImage(index)}
                className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border ${
                  index === activeImage ? "border-brand" : "border-surface-accent"
                }`}
              >
                <Image
                  src={image}
                  alt={`${product.name}-${index + 1}`}
                  width={120}
                  height={120}
                  unoptimized
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        ) : null}

        <div className="mt-4 px-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-black text-app-text tracking-tight">{product.name}</h1>
            <div className="flex items-center gap-1.5 rounded-2xl bg-surface-soft px-3 py-1.5 border border-surface-accent/30 shadow-sm animate-in fade-in slide-in-from-right-4 duration-500">
               <FiStar className="h-4 w-4 fill-[#FFC107] text-[#FFC107]" />
               <span className="text-sm font-black text-app-text">{typeof product.rating === "number" ? product.rating.toFixed(1) : "5.0"}</span>
               <span className="text-[10px] font-bold text-app-muted/50 uppercase tracking-tighter ml-0.5">
                  ({typeof product.reviewsCount === "number" ? product.reviewsCount : 0})
               </span>
            </div>
          </div>
          {product.description || product.shortDescription ? (
            <p className="mt-3 text-sm font-medium text-app-muted leading-relaxed">{product.description || product.shortDescription}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-2 space-y-2 px-4">
        <div className="rounded-[2.5rem] bg-surface p-6 shadow-soft">
          <h2 className="text-lg font-bold mb-3">{messages.product.details}</h2>
          <div className="prose prose-sm max-w-none text-app-muted leading-relaxed">
            {product.description || product.shortDescription || messages.product.noDescription}
          </div>
        </div>

        <div className="rounded-[2.5rem] bg-surface p-6 shadow-soft">
          <div className="mb-4 flex items-center gap-2">
            <FiMessageSquare className="h-4 w-4 text-brand-strong" />
            <h2 className="text-lg font-bold">{messages.reviews.productSectionTitle}</h2>
          </div>

          {reviewsStatus === "loading" && (
            <div className="space-y-3">
              <div className="h-16 animate-pulse rounded-2xl bg-surface-accent" />
              <div className="h-16 animate-pulse rounded-2xl bg-surface-accent" />
            </div>
          )}

          {reviewsStatus === "success" && !hasProductReviews && (
            <p className="text-sm font-medium text-app-muted">{messages.reviews.noProductReviews}</p>
          )}

          {hasProductReviews && (
            <div className="space-y-3">
              {productReviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-2xl border border-surface-accent/40 bg-surface-soft p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FiStar
                          key={star}
                          className={cn(
                            "h-4 w-4",
                            (review.rating ?? 0) >= star
                              ? "fill-[#FFC107] text-[#FFC107]"
                              : "text-app-muted/30",
                          )}
                        />
                      ))}
                      {review.rating ? (
                        <span className="ml-1 text-xs font-black text-[#FFC107]">
                          {review.rating.toFixed(1)}
                        </span>
                      ) : null}
                    </div>

                    {review.submittedAt ? (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-app-muted/50">
                        {new Date(review.submittedAt).toLocaleDateString()}
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-2 text-sm font-medium leading-relaxed text-app-text">
                    {review.comment || "..."}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {product.brandName && (
          <div className="rounded-3xl bg-surface px-6 py-4 shadow-soft flex items-center justify-between">
            <span className="text-sm font-semibold text-app-muted">{messages.catalog.brand}</span>
            <span className="text-sm font-bold text-app-text">{product.brandName}</span>
          </div>
        )}
      </div>

      {/* Fixed Sticky Shopping Bar */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-surface/95 px-6 pb-[max(env(safe-area-inset-bottom),1.2rem)] pt-4 backdrop-blur-xl shadow-[0_-8px_30px_rgba(0,0,0,0.08)] safe-bottom border-t border-surface-accent/20">
        <div className="mx-auto flex max-w-md items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-app-muted/60">{messages.common.price}</span>
            <p className="text-lg font-black text-app-text tracking-tight">
              {formatCurrency(product.price, locale)} <span className="text-xs font-bold opacity-60 ml-0.5">{messages.common.som}</span>
            </p>
          </div>

          <div className="flex-1 max-w-[220px]">
            {inCartQuantity === 0 ? (
              <div className="flex items-center gap-2">
                <Button
                  fullWidth
                  className="h-12 rounded-2xl bg-brand text-sm font-black shadow-lg shadow-brand/20 active:scale-95 transition-transform"
                  onClick={() => addItem(product, 1)}
                  disabled={isOut}
                >
                  Savatchaga
                </Button>
                <button 
                  onClick={() => addItem(product, 1)}
                  disabled={isOut}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand-strong active:scale-90 transition-transform"
                >
                  <FiShoppingCart className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-2xl bg-brand-soft p-1 h-12">
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand-strong shadow-sm active:scale-90 transition-transform"
                  onClick={() => decrement(product.id)}
                >
                  <FiMinus className="h-5 w-5" />
                </button>
                <span className="text-lg font-black text-brand-strong tabular-nums">{inCartQuantity}</span>
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand-strong shadow-sm active:scale-90 transition-transform disabled:opacity-50"
                  onClick={() => increment(product.id)}
                  disabled={typeof product.stock === "number" && inCartQuantity >= product.stock}
                >
                  <FiPlus className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
