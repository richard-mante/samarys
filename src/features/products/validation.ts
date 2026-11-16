import { z } from "zod";

export const productInputSchema = z.object({
  name: z.string().trim().min(2, "Enter a product name.").max(180),
  shortDescription: z.string().trim().max(320).optional().or(z.literal("")),
  description: z.string().trim().max(12000).optional().or(z.literal("")),
  priceGhs: z.coerce.number().finite().positive().max(1000000),
  stockQuantity: z.union([z.coerce.number().int().min(0).max(1000000), z.literal("")]).optional(),
  isActive: z.boolean().default(false),
});

export const productImageDataSchema = z.string()
  .max(2_200_000, "Choose a smaller image (maximum 1.5 MB after optimisation).")
  .regex(/^data:image\/(?:webp|jpeg|png);base64,[A-Za-z0-9+/]+={0,2}$/, "Choose a valid JPG, PNG or WebP image.");

export type ProductInput = z.infer<typeof productInputSchema>;
