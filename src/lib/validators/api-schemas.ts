import { z } from "zod";

const rawOrderItemSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    product_id: z.union([z.string(), z.number()]).optional(),
    product: z.union([z.string(), z.number()]).optional(),
    name: z.string().optional(),
    title: z.string().optional(),
    quantity: z.number().int().positive().default(1),
    price: z.number().nonnegative().default(0),
    currency: z.string().default("UZS"),
    image: z.string().url().optional().or(z.literal("")),
    image_url: z.string().url().optional().or(z.literal("")),
  })
  .passthrough();

export const rawOrderSchema = z
  .object({
    id: z.union([z.string(), z.number()]),
    status: z.string().optional(),
    payment_status: z.string().optional(),
    paymentStatus: z.string().optional(),
    total_amount: z.number().optional(),
    total: z.number().optional(),
    amount: z.number().optional(),
    currency: z.string().optional().default("UZS"),
    created_at: z.string().optional(),
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
  })
  .passthrough();

const rawProductImageSchema = z
  .union([
    z.string().url(),
    z
      .object({
        image: z.string().url().optional().or(z.literal("")),
        image_url: z.string().url().optional().or(z.literal("")),
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
    has_stock: z.boolean().optional(),
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
    image: z.string().url().optional().or(z.literal("")),
    image_url: z.string().url().optional().or(z.literal("")),
    images: z.array(rawProductImageSchema).optional().default([]),
  })
  .passthrough();

export const catalogResponseSchema = z
  .object({
    categories: z.array(rawCategorySchema).default([]),
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
        amount: z.number().optional(),
        payment_url: z.string().url().optional(),
        checkout_url: z.string().url().optional(),
      })
      .passthrough(),
  })
  .passthrough();
