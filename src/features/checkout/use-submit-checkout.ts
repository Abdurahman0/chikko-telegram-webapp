"use client";

import { useState } from "react";
import { checkout } from "@/lib/api/telegram-webapp.service";
import { checkoutPayloadSchema } from "@/lib/validators/checkout-schema";
import { useBootstrapStore } from "@/store/bootstrap-store";
import { useCheckoutStore } from "@/store/checkout-store";
import { TelegramApiError } from "@/lib/api/telegram-api-client";
import type { PaymentMethod } from "@/types/telegram-webapp";

type SubmitPayload = {
  fullName: string;
  phone: string;
  address: string;
  paymentMethod: PaymentMethod;
  location: { latitude: number; longitude: number } | null;
  items: Array<{ product_id: string; quantity: number }>;
};

export function useSubmitCheckout() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const initData = useBootstrapStore((state) => state.initData);
  const setCheckoutResult = useCheckoutStore((state) => state.setCheckoutResult);

  const submit = async (payload: SubmitPayload) => {
    setIsSubmitting(true);
    setSubmitError(null);

    const validation = checkoutPayloadSchema.safeParse({
      full_name: payload.fullName,
      phone: payload.phone,
      payment_method: payload.paymentMethod,
      address: payload.address,
      location: payload.location ?? undefined,
      items: payload.items,
    });

    if (!validation.success) {
      setIsSubmitting(false);
      const firstIssue = validation.error.issues[0];
      setSubmitError(firstIssue?.message ?? "validation_error");
      return null;
    }

    try {
      const result = await checkout(initData, validation.data);
      setCheckoutResult(result);
      setIsSubmitting(false);
      return result;
    } catch (error) {
      if (error instanceof TelegramApiError) {
        setSubmitError(error.code);
      } else {
        setSubmitError("unknown");
      }
      setIsSubmitting(false);
      return null;
    }
  };

  return {
    submit,
    isSubmitting,
    submitError,
    setSubmitError,
  };
}
