import type {
  BootstrapData,
  CatalogCategory,
  CatalogData,
  CheckoutData,
  Order,
  OrderItem,
  OrdersData,
  Payment,
  PaymentMethod,
  ProfileData,
  Product,
} from "@/types/telegram-webapp";
import type { z } from "zod";
import type {
  bootstrapResponseSchema,
  catalogResponseSchema,
  checkoutResponseSchema,
  ordersResponseSchema,
  profileResponseSchema,
  rawOrderSchema,
} from "@/lib/validators/api-schemas";

type RawBootstrap = z.infer<typeof bootstrapResponseSchema>;
type RawCatalog = z.infer<typeof catalogResponseSchema>;
type RawCheckout = z.infer<typeof checkoutResponseSchema>;
type RawOrder = z.infer<typeof rawOrderSchema>;
type RawOrders = z.infer<typeof ordersResponseSchema>;
type RawProfile = z.infer<typeof profileResponseSchema>;

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
  }));

  const products: Product[] = raw.products.map((product) => {
    const imagesFromList = (product.images ?? [])
      .map((image) => {
        if (!image) {
          return null;
        }
        if (typeof image === "string") {
          return image;
        }
        return image.image_url || image.image || null;
      })
      .filter((value): value is string => Boolean(value));

    const gallery = [
      ...imagesFromList,
      ...(product.image ? [product.image] : []),
      ...(product.image_url ? [product.image_url] : []),
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
      shortDescription: product.short_description,
      description: product.description,
      price: toNumber(product.price, 0),
      currency: product.currency ?? "UZS",
      stock,
      categoryId,
      categoryName:
        categoryFromObject?.name ??
        categoryFromObject?.title ??
        categories.find((category) => category.id === categoryId)?.name,
      image: product.image || product.image_url || gallery[0] || null,
      images: gallery,
    };
  });

  return {
    categories,
    products,
  };
}

export function adaptCheckoutResponse(raw: RawCheckout): CheckoutData {
  const payment: Payment = {
    method: toPaymentMethod(raw.payment.method ?? raw.payment.payment_method) ?? "payme",
    status: raw.payment.status,
    amount: raw.payment.amount,
    paymentUrl: raw.payment.payment_url ?? raw.payment.checkout_url,
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
  };
}
