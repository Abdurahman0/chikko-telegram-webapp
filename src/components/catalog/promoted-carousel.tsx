"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type TouchEvent } from "react";
import type { AppLocale } from "@/lib/i18n/config";
import type { Product } from "@/types/telegram-webapp";
import { cn } from "@/lib/utils/cn";
import { useAppSettingsStore } from "@/store/app-settings-store";

const SWIPE_THRESHOLD = 45;

function getRealIndex(trackIndex: number, count: number) {
  if (count <= 1) {
    return 0;
  }
  if (trackIndex === 0) {
    return count - 1;
  }
  if (trackIndex === count + 1) {
    return 0;
  }
  return trackIndex - 1;
}

export function PromotedCarousel({
  locale,
  products,
}: {
  locale: AppLocale;
  products: Product[];
}) {
  const autoPlayPromotions = useAppSettingsStore((state) => state.autoPlayPromotions);
  const count = products.length;

  const [trackIndex, setTrackIndex] = useState(count > 1 ? 1 : 0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const suppressClickRef = useRef(false);

  const slides = useMemo(() => {
    if (count <= 1) {
      return products;
    }
    return [products[count - 1], ...products, products[0]];
  }, [count, products]);

  const activeIndex = useMemo(
    () => getRealIndex(trackIndex, count),
    [count, trackIndex],
  );

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setTrackIndex(count > 1 ? 1 : 0);
      setDragOffset(0);
      setIsDragging(false);
      setIsAnimating(true);
      setIsTransitioning(false);
    });
    return () => cancelAnimationFrame(frame);
  }, [count]);

  useEffect(() => {
    if (!autoPlayPromotions || count <= 1 || isDragging) {
      return;
    }
    const timer = setInterval(() => {
      if (isTransitioning) {
        return;
      }
      setIsTransitioning(true);
      setIsAnimating(true);
      setTrackIndex((prev) => prev + 1);
    }, 3500);
    return () => clearInterval(timer);
  }, [autoPlayPromotions, count, isDragging, isTransitioning]);

  useEffect(() => {
    if (isAnimating) {
      return;
    }
    const frame = requestAnimationFrame(() => setIsAnimating(true));
    return () => cancelAnimationFrame(frame);
  }, [isAnimating]);

  if (count === 0) {
    return null;
  }

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    if (count <= 1 || isTransitioning) {
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

    if (Math.abs(dragOffset) > 8) {
      suppressClickRef.current = true;
      setTimeout(() => {
        suppressClickRef.current = false;
      }, 80);
    }

    if (dragOffset <= -SWIPE_THRESHOLD) {
      setIsTransitioning(true);
      setIsAnimating(true);
      setTrackIndex((prev) => prev + 1);
    } else if (dragOffset >= SWIPE_THRESHOLD) {
      setIsTransitioning(true);
      setIsAnimating(true);
      setTrackIndex((prev) => prev - 1);
    }

    setIsDragging(false);
    setDragOffset(0);
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  const handleTransitionEnd = () => {
    if (count <= 1) {
      setIsTransitioning(false);
      return;
    }
    if (trackIndex === 0) {
      setIsAnimating(false);
      setTrackIndex(count);
      setIsTransitioning(false);
      return;
    }
    if (trackIndex === count + 1) {
      setIsAnimating(false);
      setTrackIndex(1);
      setIsTransitioning(false);
      return;
    }
    setIsTransitioning(false);
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
          isDragging || !isAnimating ? "transition-none" : "transition-transform duration-500",
        )}
        style={{
          transform: `translateX(calc(-${trackIndex * 100}% + ${dragOffset}px))`,
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        {slides.map((product, idx) => (
          <Link
            key={`${product.id}-${idx}`}
            href={`/${locale}/product/${product.id}`}
            className="relative block aspect-square w-full shrink-0 bg-[#F9FAFB]"
            onClick={(event) => {
              if (suppressClickRef.current) {
                event.preventDefault();
              }
            }}
          >
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="100vw"
                unoptimized
                className="object-contain p-4"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl text-app-muted">
                {product.name.slice(0, 2).toUpperCase()}
              </div>
            )}
          </Link>
        ))}
      </div>

      {count > 1 ? (
        <div className="absolute inset-x-0 bottom-3 z-10 flex items-center justify-center gap-1.5">
          {products.map((product, dotIndex) => (
            <button
              key={`${product.id}-dot`}
              type="button"
              aria-label={`Go to slide ${dotIndex + 1}`}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                if (isTransitioning) {
                  return;
                }
                setIsTransitioning(true);
                setIsAnimating(true);
                setTrackIndex(dotIndex + 1);
              }}
              className={cn(
                "h-1.5 rounded-full transition-all",
                dotIndex === activeIndex ? "w-4 bg-white" : "w-1.5 bg-white/65",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
