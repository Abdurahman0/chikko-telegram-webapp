"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/components/shared/locale-provider";
import { useCartStore } from "@/store/cart-store";

function NavIcon({ type }: { type: "catalog" | "cart" | "orders" | "profile" }) {
  if (type === "catalog") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
        <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === "cart") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
        <path
          d="M4 6h2l1.2 8.4a1.2 1.2 0 0 0 1.2 1h7.6a1.2 1.2 0 0 0 1.2-1L19 8H7.2"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (type === "orders") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
        <path
          d="M7 4h10a2 2 0 0 1 2 2v12l-3-2-3 2-3-2-3 2V6a2 2 0 0 1 2-2Z"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BottomNav({ locale }: { locale: string }) {
  const pathname = usePathname();
  const { messages } = useI18n();
  const cartItems = useCartStore((state) => state.items);
  const cartQuantity = Object.values(cartItems).reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const items = [
    { href: `/${locale}/catalog`, label: messages.nav.catalog, icon: "catalog" as const },
    { href: `/${locale}/cart`, label: messages.nav.cart, isCart: true, icon: "cart" as const },
    { href: `/${locale}/orders`, label: messages.nav.orders, icon: "orders" as const },
    { href: `/${locale}/profile`, label: messages.nav.profile, icon: "profile" as const },
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
              data-cart-target={item.isCart ? "true" : undefined}
              className={cn(
                "relative inline-flex min-w-[4rem] flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-semibold transition-transform",
                active ? "bg-brand-soft text-brand-strong" : "text-app-muted",
              )}
            >
              <NavIcon type={item.icon} />
              <span>{item.label}</span>
              {item.isCart && cartQuantity > 0 ? (
                <span
                  key={cartQuantity}
                  className="animate-cart-pop absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold leading-none text-white"
                >
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
