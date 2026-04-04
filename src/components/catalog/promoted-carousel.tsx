"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type TouchEvent } from "react";
import { ProductImage } from "@/components/shared/product-image";
import type { AppLocale } from "@/lib/i18n/config";
import type { Product } from "@/types/telegram-webapp";
import { cn } from "@/lib/utils/cn";
import { useAppSettingsStore } from "@/store/app-settings-store";

export function PromotedCarousel({
  locale,
  products,
}: {
  locale: AppLocale;
  products: Product[];
}) {
  const autoPlayPromotions = useAppSettingsStore((state) => state.autoPlayPromotions);
  const [index, setIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const suppressClickRef = useRef(false);

  useEffect(() => {
    if (!autoPlayPromotions || products.length <= 1 || isDragging) {
      return;
    }
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % products.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [autoPlayPromotions, isDragging, products.length]);

  if (products.length === 0) {
    return null;
  }

  const safeIndex = Math.min(index, products.length - 1);

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    if (products.length <= 1) {
      return;
    }
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
    touchStartYRef.current = event.touches[0]?.clientY ?? null;
    setIsDragging(true);
    setDragOffset(0);
  };

  const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    if (!isDragging || touchStartXRef.current === null || touchStartYRef.current === null) {
      return;
    }
    const currentX = event.touches[0]?.clientX ?? touchStartXRef.current;
    const currentY = event.touches[0]?.clientY ?? touchStartYRef.current;
    const deltaX = currentX - touchStartXRef.current;
    const deltaY = currentY - touchStartYRef.current;

    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      return;
    }

    setDragOffset(deltaX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) {
      return;
    }

    const threshold = 45;

    if (dragOffset < -threshold && safeIndex < products.length - 1) {
      setIndex((prev) => prev + 1);
      suppressClickRef.current = true;
    } else if (dragOffset > threshold && safeIndex > 0) {
      setIndex((prev) => prev - 1);
      suppressClickRef.current = true;
    }

    setIsDragging(false);
    setDragOffset(0);
    touchStartXRef.current = null;
    touchStartYRef.current = null;

    if (suppressClickRef.current) {
      setTimeout(() => {
        suppressClickRef.current = false;
      }, 60);
    }
  };

  return (
    <div
      className="relative overflow-hidden rounded-none bg-surface"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <div
        className={cn(
          "flex ease-out",
          isDragging ? "transition-none" : "transition-transform duration-500",
        )}
        style={{
          transform: `translateX(calc(-${safeIndex * 100}% + ${dragOffset}px))`,
        }}
      >
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/${locale}/product/${product.id}`}
            className="block w-full shrink-0"
            onClick={(event) => {
              if (suppressClickRef.current) {
                event.preventDefault();
              }
            }}
          >
            <ProductImage
              src={product.image}
              alt={product.name}
              className="h-56 w-full bg-surface-soft object-contain"
            />
          </Link>
        ))}
      </div>

      {products.length > 1 ? (
        <div className="absolute inset-x-0 bottom-3 z-10 flex items-center justify-center gap-1.5">
          {products.map((product, dotIndex) => (
            <button
              key={`${product.id}-dot`}
              type="button"
              aria-label={`Go to slide ${dotIndex + 1}`}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setIndex(dotIndex);
              }}
              className={cn(
                "h-1.5 rounded-full transition-all",
                dotIndex === safeIndex
                  ? "w-4 bg-white"
                  : "w-1.5 bg-white/65",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
