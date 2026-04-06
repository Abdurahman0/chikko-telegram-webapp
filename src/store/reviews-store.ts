"use client";

import { create } from "zustand";
import { getReviews, submitReview } from "@/lib/api/telegram-webapp.service";
import { TelegramApiError } from "@/lib/api/telegram-api-client";
import type { Review, Order } from "@/types/telegram-webapp";

type ReviewsStatus = "idle" | "loading" | "success" | "error";

type ReviewsStore = {
  reviews: Review[];
  pendingOrders: Order[];
  status: ReviewsStatus;
  errorCode: string | null;
  errorMessage: string | null;
  loadReviews: (params: { initData: string }) => Promise<void>;
  submitReview: (params: { initData: string; orderId: string; comment: string }) => Promise<void>;
};

export const useReviewsStore = create<ReviewsStore>((set) => ({
  reviews: [],
  pendingOrders: [],
  status: "idle",
  errorCode: null,
  errorMessage: null,
  loadReviews: async ({ initData }) => {
    set({ status: "loading", errorCode: null, errorMessage: null });
    try {
      const data = await getReviews(initData);
      set({
        reviews: data.reviews,
        pendingOrders: data.pendingOrders,
        status: "success",
      });
    } catch (error) {
      if (error instanceof TelegramApiError) {
        set({
          status: "error",
          errorCode: error.code,
          errorMessage: error.message,
        });
        return;
      }
      set({
        status: "error",
        errorCode: "unknown",
        errorMessage: "Unknown error",
      });
    }
  },
  submitReview: async ({ initData, orderId, comment }) => {
    try {
      const result = await submitReview(initData, orderId, comment);
      set((state) => ({
        reviews: [result, ...state.reviews],
        pendingOrders: state.pendingOrders.filter((order) => order.id !== orderId),
      }));
    } catch (error) {
      console.error("Failed to submit review:", error);
      throw error;
    }
  },
}));
