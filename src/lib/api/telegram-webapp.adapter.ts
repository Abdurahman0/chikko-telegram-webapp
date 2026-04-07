import type {
  BootstrapData,
  Brand,
  CatalogCategory,
  CatalogData,
  CategoryDetailData,
  CheckoutData,
  FavoritesData,
  Order,
  OrderItem,
  OrdersData,
  Payment,
  PaymentMethod,
  Product,
  ProfileData,
  Review,
  ReviewsData,
} from "@/types/telegram-webapp";
import type { z } from "zod";
import type {
  bootstrapResponseSchema,
  catalogResponseSchema,
  categoryDetailResponseSchema,
  checkoutResponseSchema,
  favoritesResponseSchema,
  ordersResponseSchema,
  profileResponseSchema,
  rawOrderSchema,
  rawProductSchema,
  reviewsResponseSchema,
  submitReviewResponseSchema,
  categoriesResponseSchema,
} from "@/lib/validators/api-schemas";

type RawBootstrap = z.infer<typeof bootstrapResponseSchema>;
type RawCatalog = z.infer<typeof catalogResponseSchema>;
type RawCategoryDetail = z.infer<typeof categoryDetailResponseSchema>;
type RawCheckout = z.infer<typeof checkoutResponseSchema>;
type RawOrder = z.infer<typeof rawOrderSchema>;
type RawOrders = z.infer<typeof ordersResponseSchema>;
type RawProfile = z.infer<typeof profileResponseSchema>;
type RawProduct = z.infer<typeof rawProductSchema>;
type RawFavorites = z.infer<typeof favoritesResponseSchema>;
type RawReviews = z.infer<typeof reviewsResponseSchema>;
type RawReview = z.infer<typeof submitReviewResponseSchema>;
type RawCategories = z.infer<typeof categoriesResponseSchema>;

function toNumber(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
}

function toPaymentMethod(value: unknown): PaymentMethod | null {
  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    if (normalized === "payme" || normalized === "click") {
      return normalized;
    }
  }
  if (
    value &&
    typeof value === "object" &&
    "code" in value &&
    typeof (value as { code: unknown }).code === "string"
  ) {
    return toPaymentMethod((value as { code: string }).code);
  }
  return null;
}

function adaptOrder(raw: RawOrder): Order {
  const items: OrderItem[] = (raw.items ?? []).map((item, index) => ({
    id:
      (item.id !== undefined ? String(item.id) : undefined) ??
      `item-${index + 1}`,
    productId:
      item.product_id !== undefined
        ? String(item.product_id)
        : item.product !== undefined
          ? String(item.product)
          : `product-${index + 1}`,
    name: item.name ?? item.title ?? item.product_name ?? "Product",
    quantity: item.quantity,
    price: toNumber(item.price ?? item.unit_price ?? item.line_total, 0),
    currency: item.currency ?? raw.currency ?? "UZS",
    image: item.image || item.image_url || null,
  }));

  return {
    id: String(raw.id),
    status: raw.status,
    paymentStatus:
      raw.payment_status ??
      raw.paymentStatus ??
      raw.payments?.[0]?.status,
    totalAmount: toNumber(raw.total_amount ?? raw.total ?? raw.amount, 0),
    currency: raw.currency ?? "UZS",
    items,
    createdAt: raw.created_at,
    contactName: raw.contact_name,
    contactPhone: raw.contact_phone,
    shippingAddress: raw.shipping_address,
  };
}

function adaptProduct(
  product: RawProduct,
  categories?: CatalogCategory[],
): Product {
  const imagesFromList = (product.images ?? [])
    .map((image) => {
      if (!image) {
        return null;
      }
      if (typeof image === "string") {
        return image !== "string" ? image : null;
      }
      // Handle the new nested object structure { image_url, image }
      const url = (image as { image_url?: string; image?: string }).image_url || (image as { image_url?: string; image?: string }).image || null;
      return url !== "string" ? url : null;
    })
    .filter((value): value is string => Boolean(value));

  const gallery = [
    ...imagesFromList,
    ...(typeof product.image === "string" && product.image !== "string" ? [product.image] : []),
    ...(typeof product.image_url === "string" && product.image_url !== "string" ? [product.image_url] : []),
  ].filter((value): value is string => Boolean(value));

  const categoryFromObject =
    typeof product.category === "object" && product.category !== null
      ? product.category
      : null;

  const categoryId =
    product.category_id !== undefined && product.category_id !== null
      ? String(product.category_id)
      : categoryFromObject?.id !== undefined && categoryFromObject?.id !== null
        ? String(categoryFromObject.id)
        : typeof product.category === "string" || typeof product.category === "number"
          ? String(product.category)
          : null;

  const brandFromObject =
    typeof product.brand === "object" && product.brand !== null
      ? product.brand
      : null;

  const stock =
    product.stock !== undefined && product.stock !== null
      ? product.stock
      : product.stock_quantity !== undefined && product.stock_quantity !== null
        ? product.stock_quantity
        : product.has_stock === false
          ? 0
          : null;

  return {
    id: String(product.id),
    name: product.name ?? product.title ?? "Product",
    sku: product.sku,
    shortDescription: product.short_description,
    description: product.description,
    price: toNumber(product.price, 0),
    currency: product.currency ?? "UZS",
    stock,
    categoryId,
    categoryName:
      categoryFromObject?.name ??
      categoryFromObject?.title ??
      categories?.find((c) => c.id === categoryId)?.name,
    brandId: brandFromObject?.id ? String(brandFromObject.id) : null,
    brandName: brandFromObject?.name,
    isFavorite: product.is_favorite ?? false,
    image: product.image_url || product.image || gallery[0] || null,
    images: gallery,
    rating: (product.rating !== undefined && product.rating !== null) ? toNumber(product.rating, 0) : undefined,
    reviewsCount: (product.reviews_count !== undefined && product.reviews_count !== null) ? toNumber(product.reviews_count, 0) : undefined,
  };
}

export function adaptBootstrapResponse(raw: RawBootstrap): BootstrapData {
  const methods =
    raw.payment_methods
      .map((method) => toPaymentMethod(method))
      .filter((method): method is PaymentMethod => Boolean(method)) ?? [];

  return {
    user: raw.user
      ? {
          id: raw.user.id,
          firstName: raw.user.first_name,
          lastName: raw.user.last_name,
          username: raw.user.username,
          languageCode: raw.user.language_code,
        }
      : null,
    customer: raw.customer
      ? {
          id: raw.customer.id,
          fullName: raw.customer.full_name,
          phone: raw.customer.phone,
          address: raw.customer.address,
        }
      : null,
    activeOrder: raw.active_order ? adaptOrder(raw.active_order) : null,
    paymentMethods: methods.length > 0 ? methods : ["payme", "click"],
  };
}

export function adaptCatalogResponse(raw: RawCatalog): CatalogData {
  const categories: CatalogCategory[] = raw.categories.map((category) => ({
    id: String(category.id),
    name: category.name ?? category.title ?? `Category ${category.id}`,
    code: category.code,
    description: category.description,
    image: category.image_url || category.image || null,
  }));

  const promotedProducts: Product[] = (raw.promoted_products ?? []).map((p) =>
    adaptProduct(p, categories),
  );
  const products: Product[] = raw.products.map((p) =>
    adaptProduct(p, categories),
  );

  return {
    categories,
    promotedProducts,
    products,
  };
}

export function adaptCategoriesResponse(
  raw: RawCategories,
): CatalogCategory[] {
  return raw.map((category) => ({
    id: String(category.id),
    name: category.name ?? category.title ?? `Category ${category.id}`,
    code: category.code,
    description: category.description,
    image: category.image_url || category.image || null,
  }));
}

export function adaptCategoryDetailResponse(
  raw: RawCategoryDetail,
): CategoryDetailData {
  const category: CatalogCategory = {
    id: String(raw.category.id),
    name: raw.category.name ?? raw.category.title ?? "Category",
    code: raw.category.code,
    description: raw.category.description,
    image: raw.category.image_url || raw.category.image || null,
  };

  const brands: Brand[] = (raw.brands ?? []).map((b) => ({
    id: String(b.id),
    name: b.name ?? "Brand",
    code: b.code,
    description: b.description,
  }));

  const products: Product[] = raw.products.map((p) =>
    adaptProduct(p, [category]),
  );

  return { category, brands, products };
}

export function adaptCheckoutResponse(raw: RawCheckout): CheckoutData {
  const rawPayment = raw.payment ?? {};

  const payment: Payment = {
    method: toPaymentMethod(rawPayment.method ?? rawPayment.payment_method) ?? "payme",
    status: rawPayment.status,
    amount: toNumber(rawPayment.amount, 0),
    paymentUrl: rawPayment.payment_url ?? rawPayment.checkout_url,
  };

  return {
    order: adaptOrder(raw.order),
    payment,
  };
}

export function adaptOrdersResponse(raw: RawOrders): OrdersData {
  return {
    guestMode: raw.guest_mode ?? false,
    orders: (raw.orders ?? []).map(adaptOrder),
  };
}

export function adaptFavoritesResponse(raw: RawFavorites): FavoritesData {
  return {
    products: (raw.products ?? []).map((p) => adaptProduct(p)),
  };
}

function adaptReview(raw: RawReview): Review {
  return {
    id: String(raw.id),
    orderId: raw.order_id ? String(raw.order_id) : "",
    comment: raw.comment ?? "",
    requestedAt: raw.requested_at,
    submittedAt: raw.submitted_at,
    source: raw.source,
    order: raw.order ? adaptOrder(raw.order) : undefined,
    rating: (raw.rating !== undefined && raw.rating !== null) ? toNumber(raw.rating, 0) : undefined,
  };
}

export function adaptReviewsResponse(raw: RawReviews): ReviewsData {
  return {
    reviews: (raw.reviews ?? []).map(adaptReview),
    pendingOrders: (raw.pending_orders ?? []).map(adaptOrder),
  };
}

export function adaptSubmitReviewResponse(raw: RawReview): Review {
  return adaptReview(raw);
}

export function adaptProfileResponse(raw: RawProfile): ProfileData {
  return {
    guestMode: raw.guest_mode ?? false,
    user: raw.user
      ? {
          id: raw.user.telegram_user_id,
          fullName: raw.user.full_name,
          username: raw.user.username,
          languageCode: raw.user.language_code,
        }
      : null,
    customer: raw.customer
      ? {
          fullName: raw.customer.full_name,
          phone: raw.customer.phone,
          address: raw.customer.address,
        }
      : null,
    activeOrder: raw.active_order ? adaptOrder(raw.active_order) : null,
    orderHistory: (raw.order_history ?? []).map(adaptOrder),
    favorites: (raw.favorites ?? []).map((p) => adaptProduct(p)),
    pendingReviews: (raw.pending_reviews ?? []).map(adaptOrder),
  };
}
