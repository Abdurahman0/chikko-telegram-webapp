"use client";

import { useMemo } from "react";
import { getCartItemsList, getCartTotals, useCartStore } from "@/store/cart-store";

export function useCart() {
  const items = useCartStore((state) => state.items);
  return useMemo(() => {
    const list = getCartItemsList(items);
    const totals = getCartTotals(items);
    return {
      list,
      totals,
      isEmpty: list.length === 0,
    };
  }, [items]);
}
