import { z } from 'zod';
import { ORDER_STATUSES, PAGINATION_DEFAULTS } from '../constants/index.js';

export const idSchema = z.string().min(1, 'id must not be empty');

export const moneySchema = z.object({
  amount: z.number().nonnegative(),
  currency: z.enum(['USD', 'ARS', 'EUR']),
});

export const productSchema = z.object({
  id: idSchema,
  name: z.string().min(1),
  price: moneySchema,
  stock: z.number().int().nonnegative(),
});

export const paginationSchema = z.object({
  page: z.number().int().positive().default(PAGINATION_DEFAULTS.page),
  pageSize: z
    .number()
    .int()
    .positive()
    .max(PAGINATION_DEFAULTS.maxPageSize)
    .default(PAGINATION_DEFAULTS.pageSize),
});

export const orderStatusSchema = z.enum(ORDER_STATUSES);

export type ProductInput = z.infer<typeof productSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
