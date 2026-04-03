import {
  adaptBootstrapResponse,
  adaptCatalogResponse,
  adaptCheckoutResponse,
} from "@/lib/api/telegram-webapp.adapter";
import { telegramApiRequest } from "@/lib/api/telegram-api-client";
import {
  bootstrapResponseSchema,
  catalogResponseSchema,
  checkoutResponseSchema,
} from "@/lib/validators/api-schemas";
import type {
  BootstrapData,
  CatalogData,
  CheckoutData,
  CheckoutPayload,
} from "@/types/telegram-webapp";

export async function getBootstrap(initData: string): Promise<BootstrapData> {
  const raw = await telegramApiRequest({
    path: "/api/integrations/telegram/webapp/bootstrap/",
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
    path: `/api/integrations/telegram/webapp/catalog/${suffix}`,
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
    path: "/api/integrations/telegram/webapp/checkout/",
    method: "POST",
    initData,
    body: payload,
    schema: checkoutResponseSchema,
  });
  return adaptCheckoutResponse(raw);
}
