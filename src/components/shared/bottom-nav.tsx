"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/components/shared/locale-provider";
import { useCartStore } from "@/store/cart-store";

import { FiGrid, FiShoppingCart, FiPackage, FiUser, FiHeart } from "react-icons/fi";

function NavIcon({
  type,
  className,
}: {
  type: "catalog" | "cart" | "orders" | "profile" | "favorites";
  className?: string;
}) {
  if (type === "catalog") {
    return <FiGrid className={cn("h-5 w-5", className)} aria-hidden="true" />;
  }
  if (type === "cart") {
    return <FiShoppingCart className={cn("h-5 w-5", className)} aria-hidden="true" />;
  }
  if (type === "favorites") {
    return <FiHeart className={cn("h-5 w-5", className)} aria-hidden="true" />;
  }
  if (type === "orders") {
    return <FiPackage className={cn("h-5 w-5", className)} aria-hidden="true" />;
  }
  return <FiUser className={cn("h-5 w-5", className)} aria-hidden="true" />;
}

export function BottomNav({ locale }: { locale: string }) {
  const pathname = usePathname();
  const { messages } = useI18n();
  const cartItems = useCartStore((state) => state.items);
  const cartQuantity = Object.values(cartItems).reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const cartBadgeText = cartQuantity > 99 ? "99+" : String(cartQuantity);
  const items = [
    { href: `/${locale}/catalog`, label: messages.nav.home, icon: "catalog" as const },
    { href: `/${locale}/cart`, label: messages.nav.cart, isCart: true, icon: "cart" as const },
    { href: `/${locale}/favorites`, label: messages.nav.favorites, icon: "favorites" as const },
    { href: `/${locale}/orders`, label: messages.nav.orders, icon: "orders" as const },
    { href: `/${locale}/profile`, label: messages.nav.profile, icon: "profile" as const },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-surface-accent bg-surface/95 pb-[max(env(safe-area-inset-bottom),0.4rem)] pt-2 backdrop-blur-md">
      <div className="grid w-full grid-cols-5 items-center gap-1 px-1 pb-2 pt-1">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              data-cart-target={item.isCart ? "true" : undefined}
              className={cn(
                "relative inline-flex w-full flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[11px] font-semibold transition-transform",
                active ? "bg-brand-soft text-brand-strong" : "text-app-muted",
              )}
            >
              <span className="relative inline-flex items-center justify-center">
                <NavIcon type={item.icon} className={item.isCart ? "h-5 w-5" : "h-5 w-5"} />
                {item.isCart && cartQuantity > 0 ? (
                  <span
                    key={cartQuantity}
                    className={cn(
                      "animate-cart-pop absolute -right-2 -top-2 inline-flex items-center justify-center rounded-full bg-brand text-[10px] font-bold leading-none text-white",
                      cartBadgeText.length === 1 ? "h-4 w-4" : "h-4 min-w-4 px-1",
                    )}
                  >
                    <span className="block leading-none">{cartBadgeText}</span>
                  </span>
                ) : null}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
