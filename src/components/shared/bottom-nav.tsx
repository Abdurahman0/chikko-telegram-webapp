"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/components/shared/locale-provider";
import { useCartStore } from "@/store/cart-store";

export function BottomNav({ locale }: { locale: string }) {
  const pathname = usePathname();
  const { messages } = useI18n();
  const cartItems = useCartStore((state) => state.items);
  const cartQuantity = Object.values(cartItems).reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const items = [
    { href: `/${locale}/catalog`, label: messages.nav.catalog },
    { href: `/${locale}/cart`, label: messages.nav.cart, isCart: true },
    { href: `/${locale}/orders`, label: messages.nav.orders },
    { href: `/${locale}/profile`, label: messages.nav.profile },
  ];

  return (
    <nav className="z-30 border-t border-surface-accent bg-surface/95 pb-[max(env(safe-area-inset-bottom),0.4rem)] pt-2 backdrop-blur-md">
      <div className="flex items-center justify-between px-1 pb-2 pt-1">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative rounded-xl px-3 py-2 text-xs font-semibold",
                active ? "bg-brand-soft text-brand-strong" : "text-app-muted",
              )}
            >
              {item.label}
              {item.isCart && cartQuantity > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold leading-none text-white">
                  {cartQuantity > 99 ? "99+" : cartQuantity}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
