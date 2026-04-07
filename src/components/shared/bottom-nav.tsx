"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/components/shared/locale-provider";
import { useCartStore } from "@/store/cart-store";
import { useCatalogStore } from "@/store/catalog-store";
import { useFavoritesStore } from "@/store/favorites-store";

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
  const favoriteProducts = useFavoritesStore((state) => state.products);
  const setCategory = useCatalogStore((state) => state.setCategory);
  
  const cartQuantity = Object.values(cartItems).reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  
  const favoritesCount = favoriteProducts.length;

  const cartBadgeText = cartQuantity > 99 ? "99+" : String(cartQuantity);
  const favBadgeText = favoritesCount > 99 ? "99+" : String(favoritesCount);

  const items = [
    { href: `/${locale}/catalog`, label: messages.nav.home, icon: "catalog" as const, isHome: true },
    { href: `/${locale}/cart`, label: messages.nav.cart, isCart: true, icon: "cart" as const },
    { href: `/${locale}/favorites`, label: messages.nav.favorites, isFavorites: true, icon: "favorites" as const },
    { href: `/${locale}/orders`, label: messages.nav.orders, icon: "orders" as const },
    { href: `/${locale}/profile`, label: messages.nav.profile, icon: "profile" as const },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-surface/80 pb-[max(env(safe-area-inset-bottom),0.6rem)] pt-2 backdrop-blur-xl transition-all duration-500">
      <div className="grid w-full grid-cols-5 items-stretch px-2 pb-2 pt-1 gap-1">
        {items.map((item) => {
          const active = pathname === item.href || (item.href !== `/${locale}/catalog` && pathname.startsWith(`${item.href}/`)) || (item.isHome && (pathname === `/${locale}/catalog` || pathname === `/${locale}`));
          const badgeText = item.isCart ? cartBadgeText : favBadgeText;
          const badgeValue = item.isCart ? cartQuantity : favoritesCount;
          const showBadge = (item.isCart || item.isFavorites) && badgeValue > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              data-cart-target={item.isCart ? "true" : undefined}
              onClick={() => {
                if (item.isHome) {
                  setCategory("");
                }
              }}
              className={cn(
                "relative flex flex-col items-center justify-start gap-1 p-1 text-[10px] font-bold transition-all duration-300 active:scale-95",
                active ? "text-brand-strong" : "text-app-muted",
              )}
            >
              <div className={cn(
                "relative flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-300",
                active ? "bg-brand/10 shadow-inner" : "bg-transparent"
              )}>
                <NavIcon type={item.icon} className={cn("transition-transform duration-300", active && "scale-110")} />
                {showBadge ? (
                  <span
                    key={badgeValue}
                    className={cn(
                      "animate-cart-pop absolute -right-1 -top-1 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-black leading-none text-white shadow-lg shadow-brand/40 ring-2 ring-surface",
                      badgeText.length === 1 ? "w-4.5" : "px-1.5",
                    )}
                  >
                    <span className="block translate-y-[0.5px]">{badgeText}</span>
                  </span>
                ) : null}
              </div>
              <span className={cn(
                "w-full text-center leading-[1.1] transition-all duration-300",
                active ? "opacity-100 translate-y-0" : "opacity-70"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
