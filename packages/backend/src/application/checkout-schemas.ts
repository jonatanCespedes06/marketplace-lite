// Zod contracts for the checkout HTTP layer (specs/checkout/technical.md).
// Every controller validates against these schemas before calling a use case.

import { z } from 'zod';
import { ShippingAddressSchema } from '../domain/shipping-address.js';
import { PaymentDetailsSchema, PaymentMethodSchema } from '../domain/payment.js';
import { OrderStatusSchema } from '../domain/order-status.js';

export const AddCartItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive().max(99),
});

export type AddCartItemInput = z.infer<typeof AddCartItemSchema>;

export const UpdateCartItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive().max(99),
});

export type UpdateCartItemInput = z.infer<typeof UpdateCartItemSchema>;

export const CartProductIdSchema = z.object({
  productId: z.string().uuid(),
});

export const CheckoutSchema = z.object({
  shippingAddress: ShippingAddressSchema,
  paymentMethod: PaymentMethodSchema,
  paymentDetails: PaymentDetailsSchema,
});

export type CheckoutInput = z.infer<typeof CheckoutSchema>;

export const ListOrdersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  status: OrderStatusSchema.optional(),
});

export type ListOrdersInput = z.infer<typeof ListOrdersSchema>;

export const OrderIdSchema = z.object({
  id: z.string().uuid(),
});

export const UpdateOrderStatusSchema = z.object({
  orderId: z.string().uuid(),
  newStatus: OrderStatusSchema,
  note: z.string().max(500).optional(),
});

export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;
