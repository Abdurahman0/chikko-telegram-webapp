import type {
  BootstrapData,
  CatalogCategory,
  CatalogData,
  CheckoutData,
  Order,
  OrderItem,
  Payment,
  PaymentMethod,
  Product,
} from "@/types/telegram-webapp";
import type { z } from "zod";
import type {
  bootstrapResponseSchema,
  catalogResponseSchema,
  checkoutResponseSchema,
  rawOrderSchema,
} from "@/lib/validators/api-schemas";

type RawBootstrap = z.infer<typeof bootstrapResponseSchema>;
type RawCatalog = z.infer<typeof catalogResponseSchema>;
type RawCheckout = z.infer<typeof checkoutResponseSchema>;
type RawOrder = z.infer<typeof rawOrderSchema>;

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
    name: item.name ?? item.title ?? "Product",
    quantity: item.quantity,
    price: item.price,
    currency: item.currency ?? raw.currency ?? "UZS",
    image: item.image || item.image_url || null,
  }));

  return {
    id: String(raw.id),
    status: raw.status,
    paymentStatus: raw.payment_status ?? raw.paymentStatus,
    totalAmount: raw.total_amount ?? raw.total ?? raw.amount ?? 0,
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
    const gallery = [
      ...(product.images ?? []),
      ...(product.image ? [product.image] : []),
      ...(product.image_url ? [product.image_url] : []),
    ].filter(Boolean);

    return {
      id: String(product.id),
      name: product.name ?? product.title ?? "Product",
      shortDescription: product.short_description,
      description: product.description,
      price: product.price,
      currency: product.currency ?? "UZS",
      stock: product.stock,
      categoryId:
        product.category_id !== undefined && product.category_id !== null
          ? String(product.category_id)
          : product.category !== undefined && product.category !== null
            ? String(product.category)
            : null,
      image: product.image || product.image_url || null,
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
