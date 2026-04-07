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
    () => favoriteProducts.some((p) => p.id === product.id),
    [favoriteProducts, product.id],
  );

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    void toggleFavoriteStore({ initData, productId: product.id });
  };

  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-[28px] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-black/[0.02]",
        compact ? "min-h-[16.5rem] p-2.5" : "min-h-[19rem] p-3.5",
      )}
    >
      <Link
        href={`/${locale}/product/${product.id}`}
        className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-[24px] bg-surface-accent/15 group"
      >
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            unoptimized
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="text-sm font-black text-app-muted/30 uppercase tracking-widest">
            {product.name.slice(0, 2).toUpperCase()}
          </div>
        )}
        
        {/* Favorite Icon */}
        <button
          onClick={toggleFavorite}
          className={cn(
            "absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300",
            isFavorite 
              ? "bg-brand text-white shadow-[0_4px_12px_rgba(255,126,139,0.4)]" 
              : "bg-white/80 text-app-muted/60 backdrop-blur-md shadow-sm border border-black/5 active:scale-90"
          )}
        >
          <FiHeart className={cn("h-4.5 w-4.5 transition-transform", isFavorite ? "fill-current scale-110" : "scale-100")} />
        </button>
      </Link>
      
      <div className={cn("flex flex-1 flex-col", compact ? "mt-2" : "mt-3")}>
        <Link
          href={`/${locale}/product/${product.id}`}
          className={cn("block group", compact ? "min-h-[3rem]" : "min-h-[3.35rem]")}
        >
          <p className="truncate text-[14px] font-black leading-5 text-app-text transition-colors group-hover:text-brand">{product.name}</p>
          <p className="truncate-2 mt-1 h-7 text-[11px] font-medium leading-relaxed text-app-muted/70">
            {product.shortDescription || product.description || detailsLabel}
          </p>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-1.5 animate-in fade-in slide-in-from-bottom-2 duration-700">
          <div className="flex items-center text-[#FFC107]">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 transition-transform group-hover:scale-110">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2l-2.81 6.63L2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          </div>
          <span className="text-[11px] font-black text-app-text/80">
            {typeof product.rating === "number" ? product.rating.toFixed(1) : "5.0"}
          </span>
          <span className="text-[10px] font-bold text-app-muted/40 uppercase tracking-tighter ml-1">
            ({typeof product.reviewsCount === "number" ? product.reviewsCount : 0})
          </span>
        </div>

        <div className={cn("flex items-end justify-between gap-2", compact ? "mt-1.5" : "mt-2.5")}>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-app-muted/50 mb-0.5 leading-none">
                {messages.common.price || "Narxi"}
            </span>
            <p className="text-[16px] font-black leading-none text-app-text tracking-tight">
              {formatCurrency(product.price, locale)} <span className="text-[11px] ml-0.5">{currencyLabel}</span>
            </p>
          </div>
          {showStockLabel && isOut && (
            <p className="whitespace-nowrap text-[10px] font-black uppercase tracking-widest text-[#FF4B55] mb-1">
              {outOfStockLabel}
            </p>
          )}
        </div>
        
        <div className={cn("relative", compact ? "mt-2.5 h-10" : "mt-3.5 h-11")}>
          {quantity > 0 ? (
            <div className="absolute inset-0 flex items-center justify-between rounded-2xl bg-brand p-1 shadow-[0_4px_12px_rgba(255,126,139,0.3)] animate-in fade-in zoom-in-95 duration-500">
              <button
                type="button"
                aria-label="Decrease quantity"
                className="flex h-full aspect-square items-center justify-center rounded-xl bg-white/20 text-white transition-all active:scale-90 active:bg-white/30"
                onClick={() => onDecrement(product.id)}
              >
                <span className="text-xl font-black leading-none transform -translate-y-[1px]">-</span>
              </button>
              <span className="text-[15px] font-black text-white px-2 mb-0.5">{quantity}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                className="flex h-full aspect-square items-center justify-center rounded-xl bg-white/20 text-white transition-all active:scale-90 active:bg-white/30"
                onClick={(event) =>
                  onIncrement(product, event.currentTarget as HTMLElement)
                }
              >
                <span className="text-xl font-black leading-none transform -translate-y-[1px]">+</span>
              </button>
            </div>
          ) : (
            <button
              className={cn(
                "w-full h-full rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all duration-300 active:scale-95 shadow-sm border border-transparent",
                isOut 
                   ? "bg-surface-accent/20 text-app-muted cursor-not-allowed opacity-50" 
                   : "bg-brand text-white shadow-[0_4px_12px_rgba(255,126,139,0.25)] hover:bg-brand/90"
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
  );
}
