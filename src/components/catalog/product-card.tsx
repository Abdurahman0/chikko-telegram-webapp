"use client";

import { useCartStore } from "@/store/cart-store";
import { useCatalogStore } from "@/store/catalog-store";
import { useFavoritesStore } from "@/store/favorites-store";
import { useBootstrapStore } from "@/store/bootstrap-store";

import { FiHeart } from "react-icons/fi";
import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/shared/button";
import { formatCurrency } from "@/lib/formatters/currency";
import type { AppLocale } from "@/lib/i18n/config";
import type { Product } from "@/types/telegram-webapp";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/components/shared/locale-provider";

export function ProductCard({
  locale,
  product,
  addToCartLabel,
  outOfStockLabel,
  inStockLabel,
  detailsLabel,
  currencyLabel,
  quantity,
  compact,
  showStockLabel,
  onIncrement,
  onDecrement,
}: {
  locale: AppLocale;
  product: Product;
  addToCartLabel: string;
  outOfStockLabel: string;
  inStockLabel: string;
  detailsLabel: string;
  currencyLabel: string;
  quantity: number;
  compact: boolean;
  showStockLabel: boolean;
  onIncrement: (product: Product, sourceElement: HTMLElement | null) => void;
  onDecrement: (productId: string) => void;
}) {
  const { messages } = useI18n();
  const isOut = typeof product.stock === "number" && product.stock <= 0;
  const initData = useBootstrapStore((state) => state.initData);
  const favoriteProducts = useFavoritesStore((state) => state.products);
  const toggleFavoriteStore = useFavoritesStore((state) => state.toggleFavorite);

  const isFavorite = useMemo(
    () => favoriteProducts.some((p) => String(p.id) === String(product.id)),
    [favoriteProducts, product.id],
  );

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Impact haptic if possible
    if (typeof window !== "undefined" && (window as any).Telegram?.WebApp?.HapticFeedback) {
      (window as any).Telegram.WebApp.HapticFeedback.impactOccurred("medium");
    }

    void toggleFavoriteStore({ initData, product });
  };

  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-[24px] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all duration-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-black/[0.01]",
        compact ? "min-h-[16rem] p-2" : "min-h-[18.5rem] p-3",
      )}
    >
      <Link
        href={`/${locale}/product/${product.id}`}
        className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-[20px] bg-surface-accent/10 group"
      >
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            unoptimized
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="text-sm font-black text-app-muted/20 uppercase tracking-widest">
            {product.name.slice(0, 2).toUpperCase()}
          </div>
        )}
        
        {/* Favorite Icon */}
        <button
          onClick={toggleFavorite}
          className={cn(
            "absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 z-10",
            isFavorite 
              ? "bg-white text-[#FF4B55] shadow-[0_4px_12px_rgba(255,75,85,0.25)] scale-110" 
              : "bg-white/80 text-app-muted shadow-sm backdrop-blur-md active:scale-90"
          )}
        >
          <FiHeart 
            className={cn(
              "h-4 w-4 transition-all duration-300 transform", 
              isFavorite ? "fill-current scale-110" : "scale-100"
            )} 
          />
        </button>
      </Link>
      
      <div className={cn("flex flex-1 flex-col", compact ? "mt-1.5" : "mt-2.5")}>
        <Link
          href={`/${locale}/product/${product.id}`}
          className={cn("block group", compact ? "min-h-[2.8rem]" : "min-h-[3rem]")}
        >
          <p className="truncate text-[13px] font-black leading-tight text-app-text transition-colors group-hover:text-brand">{product.name}</p>
          <p className="truncate-2 mt-0.5 h-6 text-[10px] font-bold leading-tight text-app-muted/50">
            {product.shortDescription || product.description || detailsLabel}
          </p>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-0.5 mt-1">
          <div className="flex items-center text-[#FFC107]">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2l-2.81 6.63L2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          </div>
          <span className="text-[10px] font-black text-app-text/70">
            {typeof product.rating === "number" ? product.rating.toFixed(1) : "5.0"}
          </span>
          <span className="text-[9px] font-bold text-app-muted/30 ml-0.5">
            ({typeof product.reviewsCount === "number" ? product.reviewsCount : 0})
          </span>
        </div>

        <div className="mt-auto pt-2.5">
          <div className="flex items-baseline gap-1">
            <p className="text-[15px] font-black leading-none text-app-text tracking-tight">
              {formatCurrency(product.price, locale)}
            </p>
            <span className="text-[10px] font-black text-app-muted/40 uppercase tracking-tighter">{currencyLabel}</span>
          </div>
          
          <div className="relative mt-2 h-10 w-full">
            {quantity > 0 ? (
              <div className="absolute inset-0 flex items-center justify-between rounded-xl bg-brand p-1 shadow-[0_4px_12px_rgba(255,126,139,0.2)]">
                <button
                  type="button"
                  className="flex h-full aspect-square items-center justify-center rounded-lg bg-white/20 text-white active:scale-90"
                  onClick={() => onDecrement(product.id)}
                >
                  <span className="text-lg font-black">-</span>
                </button>
                <span className="text-[14px] font-black text-white">{quantity}</span>
                <button
                  type="button"
                  className="flex h-full aspect-square items-center justify-center rounded-lg bg-white/20 text-white active:scale-90"
                  onClick={(event) =>
                    onIncrement(product, event.currentTarget as HTMLElement)
                  }
                >
                  <span className="text-lg font-black">+</span>
                </button>
              </div>
            ) : (
              <button
                className={cn(
                   "w-full h-full rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95",
                   isOut 
                      ? "bg-surface-accent/10 text-app-muted/40 cursor-not-allowed" 
                      : "bg-brand text-white shadow-[0_4px_12px_rgba(255,126,139,0.2)] hover:bg-brand/90"
                )}
                onClick={(event) =>
                  onIncrement(product, event.currentTarget as HTMLElement)
                }
                disabled={isOut}
              >
                {addToCartLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
