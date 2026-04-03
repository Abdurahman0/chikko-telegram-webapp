"use client";

import { useMemo } from "react";
import { useBootstrapStore } from "@/store/bootstrap-store";
import { useCheckoutStore } from "@/store/checkout-store";

export function useOrdersData() {
  const activeOrder = useBootstrapStore((state) => state.activeOrder);
  const checkoutResult = useCheckoutStore((state) => state.checkoutResult);

  return useMemo(() => {
    const lastCheckoutOrder = checkoutResult?.order ?? null;
    if (activeOrder) {
      return {
        primaryOrder: activeOrder,
        secondaryOrder:
          lastCheckoutOrder && lastCheckoutOrder.id !== activeOrder.id
            ? lastCheckoutOrder
            : null,
      };
    }
    return {
      primaryOrder: lastCheckoutOrder,
      secondaryOrder: null,
    };
  }, [activeOrder, checkoutResult]);
}
