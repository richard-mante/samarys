import { z } from "zod";

export const productInputSchema = z.object({
  name: z.string().trim().min(2).max(180),
  slug: z.string().trim().min(2).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  shortDescription: z.string().trim().max(320).optional().or(z.literal("")),
  description: z.string().trim().max(12000).optional().or(z.literal("")),
  priceGhs: z.coerce.number().finite().positive().max(1000000),
  stockQuantity: z.union([z.coerce.number().int().min(0).max(1000000), z.literal("")]).optional(),
  isActive: z.boolean().default(false),
});

export type ProductInput = z.infer<typeof productInputSchema>;
