import {
  adaptBootstrapResponse,
  adaptCatalogResponse,
  adaptCheckoutResponse,
  adaptOrdersResponse,
  adaptProfileResponse,
} from "@/lib/api/telegram-webapp.adapter";
import { telegramApiRequest } from "@/lib/api/telegram-api-client";
import {
  bootstrapResponseSchema,
  catalogResponseSchema,
  checkoutResponseSchema,
  ordersResponseSchema,
  profileResponseSchema,
} from "@/lib/validators/api-schemas";
import type {
  BootstrapData,
  CatalogData,
  CheckoutData,
  CheckoutPayload,
  OrdersData,
  ProfileData,
} from "@/types/telegram-webapp";

export async function getBootstrap(initData: string): Promise<BootstrapData> {
  const raw = await telegramApiRequest({
    path: "/api/telegram-webapp/bootstrap/",
    method: "GET",
    initData,
    schema: bootstrapResponseSchema,
  });
  return adaptBootstrapResponse(raw);
}

export async function getCatalog(
  initData: string,
  params?: { category?: string; search?: string },
): Promise<CatalogData> {
  const query = new URLSearchParams();
  if (params?.category) {
    query.set("category", params.category);
  }
  if (params?.search) {
    query.set("search", params.search);
  }
  const suffix = query.toString().length > 0 ? `?${query}` : "";

  const raw = await telegramApiRequest({
    path: `/api/telegram-webapp/catalog/${suffix}`,
    method: "GET",
    initData,
    schema: catalogResponseSchema,
  });
  return adaptCatalogResponse(raw);
}

export async function checkout(
  initData: string,
  payload: CheckoutPayload,
): Promise<CheckoutData> {
  const raw = await telegramApiRequest({
    path: "/api/telegram-webapp/checkout/",
    method: "POST",
    initData,
    body: payload,
    schema: checkoutResponseSchema,
  });
  return adaptCheckoutResponse(raw);
}

export async function getOrders(initData: string): Promise<OrdersData> {
  const raw = await telegramApiRequest({
    path: "/api/telegram-webapp/orders/",
    method: "GET",
    initData,
    schema: ordersResponseSchema,
  });
  return adaptOrdersResponse(raw);
}

export async function getProfile(initData: string): Promise<ProfileData> {
  const raw = await telegramApiRequest({
    path: "/api/telegram-webapp/profile/",
    method: "GET",
    initData,
    schema: profileResponseSchema,
  });
  return adaptProfileResponse(raw);
}
