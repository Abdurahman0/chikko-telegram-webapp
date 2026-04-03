"use client";

import { useEffect } from "react";
import { useBootstrapStore } from "@/store/bootstrap-store";
import { useOrdersStore } from "@/store/orders-store";

export function useOrdersData() {
  const initData = useBootstrapStore((state) => state.initData);
  const hasBootstrapped = useBootstrapStore((state) => state.hasBootstrapped);
  const loadOrders = useOrdersStore((state) => state.loadOrders);
  const status = useOrdersStore((state) => state.status);
  const orders = useOrdersStore((state) => state.orders);
  const guestMode = useOrdersStore((state) => state.guestMode);
  const errorCode = useOrdersStore((state) => state.errorCode);

  useEffect(() => {
    if (!hasBootstrapped) {
      return;
    }
    void loadOrders({ initData });
  }, [hasBootstrapped, initData, loadOrders]);

  return {
    status,
    orders,
    guestMode,
    errorCode,
    reload: () => loadOrders({ initData, force: true }),
  };
}
