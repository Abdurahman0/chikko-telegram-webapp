import {
  adaptBootstrapResponse,
  adaptCatalogResponse,
  adaptCategoriesResponse,
  adaptCategoryDetailResponse,
  adaptCheckoutResponse,
  adaptFavoritesResponse,
  adaptOrdersResponse,
  adaptProfileResponse,
  adaptReviewsResponse,
  adaptSubmitReviewResponse,
} from "@/lib/api/telegram-webapp.adapter";
import { telegramApiRequest } from "@/lib/api/telegram-api-client";
import {
  bootstrapResponseSchema,
  catalogResponseSchema,
  categoriesResponseSchema,
  categoryDetailResponseSchema,
  checkoutResponseSchema,
  favoritesResponseSchema,
  ordersResponseSchema,
  profileResponseSchema,
  reviewsResponseSchema,
  submitReviewResponseSchema,
} from "@/lib/validators/api-schemas";
import type {
  BootstrapData,
  CatalogCategory,
  CatalogData,
  CatalogSortOption,
  CategoryDetailData,
  CheckoutData,
  CheckoutPayload,
  FavoritesData,
  OrdersData,
  ProfileData,
  Review,
  ReviewsData,
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
  params?: {
    category?: string;
    brand?: string;
    priceFrom?: number;
    priceTo?: number;
    search?: string;
    sort?: CatalogSortOption;
  },
): Promise<CatalogData> {
  const query = new URLSearchParams();
  if (params?.category && params.category !== "all") {
    query.set("category", params.category);
  }
  if (params?.brand) {
    query.set("brand", params.brand);
  }
  if (params?.priceFrom !== undefined) {
    query.set("price_from", String(params.priceFrom));
  }
  if (params?.priceTo !== undefined) {
    query.set("price_to", String(params.priceTo));
  }
  if (params?.search) {
    query.set("search", params.search);
  }
  if (params?.sort) {
    const sortValue = params.sort === "high_rating" ? "popular" : params.sort;
    query.set("sort", sortValue);
  }
  const suffix = query.toString().length > 0 ? `?${query}` : "";

  const raw = await telegramApiRequest({
    path: `/api/telegram-webapp/catalog${suffix}`,
    method: "GET",
    initData,
    schema: catalogResponseSchema,
  });
  return adaptCatalogResponse(raw);
}

export async function getCategories(
  initData: string,
): Promise<CatalogCategory[]> {
  const raw = await telegramApiRequest({
    path: "/api/telegram-webapp/categories/",
    method: "GET",
    initData,
    schema: categoriesResponseSchema,
  });
  return adaptCategoriesResponse(raw);
}

export async function getCategoryProducts(
  initData: string,
  categoryId: string,
  params?: {
    brand?: string;
    priceFrom?: number;
    priceTo?: number;
    search?: string;
    sort?: CatalogSortOption;
  },
): Promise<CategoryDetailData> {
  const query = new URLSearchParams();
  if (params?.brand) {
    query.set("brand", params.brand);
  }
  if (params?.priceFrom !== undefined) {
    query.set("price_from", String(params.priceFrom));
  }
  if (params?.priceTo !== undefined) {
    query.set("price_to", String(params.priceTo));
  }
  if (params?.search) {
    query.set("search", params.search);
  }
  if (params?.sort) {
    const sortValue = params.sort === "high_rating" ? "popular" : params.sort;
    query.set("sort", sortValue);
  }
  const suffix = query.toString().length > 0 ? `?${query}` : "";

  const raw = await telegramApiRequest({
    path: `/api/integrations/telegram/webapp/categories/${categoryId}/${suffix}`,
    method: "GET",
    initData,
    schema: categoryDetailResponseSchema,
  });
  return adaptCategoryDetailResponse(raw);
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

export async function getFavorites(initData: string): Promise<FavoritesData> {
  const raw = await telegramApiRequest({
    path: "/api/telegram-webapp/favorites/",
    method: "GET",
    initData,
    schema: favoritesResponseSchema,
  });
  return adaptFavoritesResponse(raw);
}

export async function toggleFavorite(
  initData: string,
  productId: string,
): Promise<FavoritesData> {
  const raw = await telegramApiRequest({
    path: "/api/telegram-webapp/favorites/",
    method: "POST",
    initData,
    body: { product_id: productId },
    schema: favoritesResponseSchema,
  });
  return adaptFavoritesResponse(raw);
}

export async function getReviews(initData: string): Promise<ReviewsData> {
  const raw = await telegramApiRequest({
    path: "/api/telegram-webapp/reviews/",
    method: "GET",
    initData,
    schema: reviewsResponseSchema,
  });
  return adaptReviewsResponse(raw);
}

export async function submitReview(
  initData: string,
  orderId: string,
  comment: string,
  rating: number,
): Promise<Review> {
  const raw = await telegramApiRequest({
    path: "/api/telegram-webapp/reviews/",
    method: "POST",
    initData,
    body: { order_id: orderId, comment, rating },
    schema: submitReviewResponseSchema,
  });
  return adaptSubmitReviewResponse(raw);
}
