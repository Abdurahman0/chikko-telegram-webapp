import { z } from "zod";

const rawOrderItemSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    product_id: z.union([z.string(), z.number()]).optional(),
    product: z.union([z.string(), z.number()]).optional(),
    product_name: z.string().optional(),
    name: z.string().optional(),
    title: z.string().optional(),
    quantity: z.number().int().positive().default(1),
    price: z.union([z.number(), z.string()]).optional(),
    unit_price: z.union([z.number(), z.string()]).optional(),
    line_total: z.union([z.number(), z.string()]).optional(),
    currency: z.string().optional().default("UZS"),
    image: z.string().optional().nullable().or(z.literal("")),
    image_url: z.string().optional().nullable().or(z.literal("")),
  })
  .passthrough();

export const rawOrderSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    status: z.string().optional(),
    payment_status: z.string().optional(),
    paymentStatus: z.string().optional(),
    total_amount: z.union([z.number(), z.string()]).optional(),
    total: z.union([z.number(), z.string()]).optional(),
    amount: z.union([z.number(), z.string()]).optional(),
    currency: z.string().optional().default("UZS"),
    contact_name: z.string().optional(),
    contact_phone: z.string().optional(),
    shipping_address: z.string().optional(),
    created_at: z.string().optional(),
    payments: z
      .array(
        z
          .object({
            id: z.union([z.string(), z.number()]).optional(),
            amount: z.union([z.number(), z.string()]).optional(),
            status: z.string().optional(),
            method: z.string().optional(),
          })
          .passthrough(),
      )
      .optional()
      .default([]),
    items: z.array(rawOrderItemSchema).optional().default([]),
  })
  .passthrough();

export const bootstrapResponseSchema = z
  .object({
    user: z
      .object({
        id: z.union([z.string(), z.number()]).optional(),
        first_name: z.string().optional(),
        last_name: z.string().optional(),
        username: z.string().optional(),
        language_code: z.string().optional(),
      })
      .passthrough()
      .optional()
      .nullable(),
    customer: z
      .object({
        id: z.union([z.string(), z.number()]).optional(),
        full_name: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
      })
      .passthrough()
      .optional()
      .nullable(),
    active_order: rawOrderSchema.optional().nullable(),
    payment_methods: z
      .array(z.union([z.string(), z.record(z.string(), z.any())]))
      .default([]),
  })
  .passthrough();

const rawCategorySchema = z
  .object({
    id: z.union([z.string(), z.number()]),
    name: z.string().optional(),
    title: z.string().optional(),
    code: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional().nullable(),
    image_url: z.string().optional().nullable(),
    is_active: z.boolean().optional(),
  })
  .passthrough();

const rawBrandSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    name: z.string().optional(),
    code: z.string().optional(),
    description: z.string().optional(),
    is_active: z.boolean().optional(),
  })
  .passthrough();

const rawProductImageSchema = z
  .union([
    z.string(),
    z
      .object({
        image: z.string().optional().or(z.literal("")),
        image_url: z.string().optional().or(z.literal("")),
      })
      .passthrough(),
  ])
  .optional();

export const rawProductSchema = z
  .object({
    id: z.union([z.string(), z.number()]),
    name: z.string().optional(),
    title: z.string().optional(),
    sku: z.string().optional(),
    short_description: z.string().optional(),
    description: z.string().optional(),
    price: z.union([z.number(), z.string()]),
    currency: z.string().optional().default("UZS"),
    stock: z.number().optional().nullable(),
    stock_quantity: z.number().optional().nullable(),
    has_stock: z.union([z.boolean(), z.string()]).optional(),
    is_favorite: z.boolean().optional(),
    category_id: z.union([z.string(), z.number()]).optional().nullable(),
    category: z
      .union([
        z.string(),
        z.number(),
        z
          .object({
            id: z.union([z.string(), z.number()]).optional(),
            code: z.string().optional(),
            name: z.string().optional(),
            title: z.string().optional(),
          })
          .passthrough(),
      ])
      .optional()
      .nullable(),
    brand: z
      .union([
        z.string(),
        z.number(),
        z
          .object({
            id: z.union([z.string(), z.number()]).optional(),
            name: z.string().optional(),
            code: z.string().optional(),
          })
          .passthrough(),
      ])
      .optional()
      .nullable(),
    image: z.string().optional().nullable().or(z.literal("")),
    image_url: z.string().optional().nullable().or(z.literal("")),
    images: z.array(rawProductImageSchema).optional().nullable().default([]),
    rating: z.union([z.number(), z.string(), z.null()]).optional(),
    reviews_count: z.union([z.number(), z.string(), z.null()]).optional(),
  })
  .passthrough();

export const catalogResponseSchema = z
  .object({
    categories: z.array(rawCategorySchema).default([]),
    promoted_products: z.array(rawProductSchema).optional().default([]),
    products: z.array(rawProductSchema).default([]),
  })
  .passthrough();

export const categoriesResponseSchema = z.array(rawCategorySchema);

export const categoryDetailResponseSchema = z
  .object({
    category: rawCategorySchema,
    brands: z.array(rawBrandSchema).optional().default([]),
    products: z.array(rawProductSchema).default([]),
  })
  .passthrough();

export const checkoutResponseSchema = z
  .object({
    order: rawOrderSchema,
    payment: z
      .object({
        method: z.string().optional(),
        payment_method: z.string().optional(),
        status: z.string().optional(),
        amount: z.union([z.number(), z.string()]).optional(),
        payment_url: z.string().optional(),
        checkout_url: z.string().optional(),
      })
      .passthrough()
      .optional()
      .nullable(),
  })
  .passthrough();

export const ordersResponseSchema = z
  .object({
    guest_mode: z.boolean().optional().default(false),
    orders: z.array(rawOrderSchema).optional().default([]),
  })
  .passthrough();

export const favoritesResponseSchema = z
  .object({
    products: z.array(rawProductSchema).default([]),
  })
  .passthrough();

const rawReviewSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    order_id: z.union([z.string(), z.number()]).optional(),
    comment: z.string().optional().default(""),
    requested_at: z.string().optional(),
    submitted_at: z.string().optional(),
    source: z.string().optional(),
    order: rawOrderSchema.optional().nullable(),
    rating: z.number().optional(),
  })
  .passthrough();

export const reviewsResponseSchema = z
  .object({
    reviews: z.array(rawReviewSchema).nullable().optional().default([]),
    pending_orders: z.array(rawOrderSchema).nullable().optional().default([]),
  })
  .passthrough();

export const submitReviewResponseSchema = rawReviewSchema;

export const profileResponseSchema = z
  .object({
    guest_mode: z.boolean().optional().default(false),
    user: z
      .object({
        telegram_user_id: z.union([z.string(), z.number()]).optional(),
        username: z.string().optional(),
        full_name: z.string().optional(),
        language_code: z.string().optional(),
      })
      .passthrough()
      .optional()
      .nullable(),
    customer: z
      .object({
        full_name: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
      })
      .passthrough()
      .optional()
      .nullable(),
    active_order: rawOrderSchema.optional().nullable(),
    order_history: z.array(rawOrderSchema).optional().default([]),
    favorites: z.array(rawProductSchema).optional().default([]),
    pending_reviews: z.array(rawOrderSchema).optional().default([]),
  })
  .passthrough();
