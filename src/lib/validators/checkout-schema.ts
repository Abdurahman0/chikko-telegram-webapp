import { z } from "zod";

export const checkoutItemSchema = z.object({
  product_id: z.string().min(1),
  quantity: z.number().int().positive(),
});

export const checkoutPayloadSchema = z
  .object({
    full_name: z.string().min(2, "full_name_required"),
    phone: z.string().min(7, "phone_required"),
    payment_method: z.enum(["payme", "click"]),
    address: z.string().optional(),
    location: z
      .object({
        latitude: z.number(),
        longitude: z.number(),
      })
      .optional(),
    items: z.array(checkoutItemSchema).min(1),
  })
  .superRefine((value, ctx) => {
    if (!value.address?.trim() && !value.location) {
      ctx.addIssue({
        code: "custom",
        message: "address_or_location_required",
        path: ["address"],
      });
    }
  });

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  quantity: z.number().int().positive(),
  price: z.number().nonnegative(),
  currency: z.string().min(1),
  image: z.string().nullable().optional(),
  stock: z.number().nullable().optional(),
});
