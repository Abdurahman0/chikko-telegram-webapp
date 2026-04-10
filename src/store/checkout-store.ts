"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  CheckoutData,
  Customer,
  FulfillmentMethod,
  LocationPoint,
  PaymentMethod,
} from "@/types/telegram-webapp";

type CheckoutDraft = {
  fullName: string;
  phone: string;
  address: string;
  paymentMethod: PaymentMethod;
  fulfillmentMethod: FulfillmentMethod;
  location: LocationPoint | null;
};

type CheckoutStore = {
  draft: CheckoutDraft;
  checkoutResult: CheckoutData | null;
  setDraftField: <K extends keyof CheckoutDraft>(
    key: K,
    value: CheckoutDraft[K],
  ) => void;
  prefillFromCustomer: (customer: Customer | null) => void;
  setCheckoutResult: (result: CheckoutData) => void;
  clearCheckoutResult: () => void;
};

const defaultDraft: CheckoutDraft = {
  fullName: "",
  phone: "",
  address: "",
  paymentMethod: "payme",
  fulfillmentMethod: "delivery",
  location: null,
};

export const useCheckoutStore = create<CheckoutStore>()(
  persist(
    (set) => ({
      draft: defaultDraft,
      checkoutResult: null,
      setDraftField: (key, value) =>
        set((state) => ({
          draft: {
            ...state.draft,
            [key]: value,
          },
        })),
      prefillFromCustomer: (customer) =>
        set((state) => ({
          draft: {
            ...state.draft,
            fullName:
              state.draft.fullName.trim().length > 0
                ? state.draft.fullName
                : customer?.fullName ?? "",
            phone:
              state.draft.phone.trim().length > 0
                ? state.draft.phone
                : customer?.phone ?? "",
            address:
              state.draft.address.trim().length > 0
                ? state.draft.address
                : customer?.address ?? "",
          },
        })),
      setCheckoutResult: (result) => set({ checkoutResult: result }),
      clearCheckoutResult: () => set({ checkoutResult: null }),
    }),
    {
      name: "chikko-checkout",
      partialize: (state) => ({
        draft: state.draft,
      }),
      merge: (persistedState, currentState) => {
        const typedPersisted = persistedState as Partial<CheckoutStore> | undefined;
        const persistedPaymentMethod = typedPersisted?.draft?.paymentMethod as
          | string
          | undefined;
        const normalizedPaymentMethod =
          persistedPaymentMethod === "naqd"
            ? "manual"
            : persistedPaymentMethod === "payme" ||
                persistedPaymentMethod === "click" ||
                persistedPaymentMethod === "manual"
              ? persistedPaymentMethod
              : undefined;
        return {
          ...currentState,
          ...typedPersisted,
          draft: {
            ...defaultDraft,
            ...(typedPersisted?.draft ?? {}),
            ...(normalizedPaymentMethod ? { paymentMethod: normalizedPaymentMethod } : {}),
          },
        };
      },
    },
  ),
);
