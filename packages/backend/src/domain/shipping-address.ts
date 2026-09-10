import { z } from 'zod';

export const ShippingAddressSchema = z.object({
  street: z.string().min(5),
  city: z.string().min(2),
  postalCode: z.string().regex(/^\d{5}(-\d{4})?$/),
  country: z.string().length(2).toUpperCase(),
});

export type ShippingAddress = z.infer<typeof ShippingAddressSchema>;
