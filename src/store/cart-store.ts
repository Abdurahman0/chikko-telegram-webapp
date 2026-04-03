"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { cartItemSchema } from "@/lib/validators/checkout-schema";
import type { Order, Product } from "@/types/telegram-webapp";

export type CartItem = {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  currency: string;
  image?: string | null;
  stock?: number | null;
};

type CartStore = {
  items: Record<string, CartItem>;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  increment: (productId: string) => void;
  decrement: (productId: string) => void;
  clear: () => void;
  hydrateFromOrder: (order: Order) => void;
};

function clampQuantity(quantity: number, stock?: number | null) {
  if (stock === undefined || stock === null) {
    return Math.max(1, quantity);
  }
  return Math.max(1, Math.min(quantity, stock));
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: {},
      addItem: (product, quantity = 1) => {
        set((state) => {
          const existing = state.items[product.id];
          const nextQty = clampQuantity(
            (existing?.quantity ?? 0) + quantity,
            product.stock,
          );
          const candidate: CartItem = {
            productId: product.id,
            name: product.name,
            quantity: nextQty,
            price: product.price,
            currency: product.currency,
            image: product.image,
            stock: product.stock,
          };
          const parsed = cartItemSchema.safeParse(candidate);
          if (!parsed.success) {
            return state;
          }
          return {
            items: {
              ...state.items,
              [product.id]: parsed.data,
            },
          };
        });
      },
      removeItem: (productId) =>
        set((state) => {
          const next = { ...state.items };
          delete next[productId];
          return { items: next };
        }),
      setQuantity: (productId, quantity) =>
        set((state) => {
          const item = state.items[productId];
          if (!item) {
            return state;
          }
          const nextQuantity = clampQuantity(quantity, item.stock);
          if (nextQuantity <= 0) {
            const next = { ...state.items };
            delete next[productId];
            return { items: next };
          }
          return {
            items: {
              ...state.items,
              [productId]: {
                ...item,
                quantity: nextQuantity,
              },
            },
          };
        }),
      increment: (productId) => {
        const item = get().items[productId];
        if (!item) {
          return;
        }
        get().setQuantity(productId, item.quantity + 1);
      },
      decrement: (productId) => {
        const item = get().items[productId];
        if (!item) {
          return;
        }
        if (item.quantity === 1) {
          get().removeItem(productId);
          return;
        }
        get().setQuantity(productId, item.quantity - 1);
      },
      clear: () => set({ items: {} }),
      hydrateFromOrder: (order) => {
        if (!order.items.length) {
          return;
        }
        const next: Record<string, CartItem> = {};
        order.items.forEach((item) => {
          next[item.productId] = {
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            currency: item.currency,
            image: item.image,
          };
        });
        set({ items: next });
      },
    }),
    {
      name: "chikko-cart",
    },
  ),
);

export function getCartItemsList(items: Record<string, CartItem>) {
  return Object.values(items);
}

export function getCartTotals(items: Record<string, CartItem>) {
  const list = getCartItemsList(items);
  const total = list.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const quantity = list.reduce((sum, item) => sum + item.quantity, 0);
  return {
    total,
    quantity,
    currency: list[0]?.currency ?? "UZS",
  };
}
