// Payment domain: methods supported by checkout plus stored payment details.
// Real charging is an infrastructure concern (PaymentGateway adapter).

import { z } from 'zod';

export const PaymentMethodSchema = z.enum(['credit_card', 'debit_card', 'bank_transfer', 'paypal']);

export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

export const PaymentDetailsSchema = z.object({}).passthrough();

export type PaymentDetails = z.infer<typeof PaymentDetailsSchema>;

export interface Payment {
  readonly orderId: string;
  readonly method: PaymentMethod;
  readonly amount: number;
  readonly status: 'pending' | 'confirmed' | 'failed';
}
