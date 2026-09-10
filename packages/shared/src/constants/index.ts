// Shared constants (pure TS, no framework imports).

export const DEFAULT_CURRENCY = 'USD' as const;

export const ORDER_STATUSES = ['pending', 'paid', 'shipped', 'cancelled'] as const;

export const PAGINATION_DEFAULTS = {
  page: 1,
  pageSize: 20,
  maxPageSize: 100,
} as const;

export const API_ROUTES = {
  products: '/products',
  cart: '/cart',
  checkout: '/checkout',
  orders: '/orders',
} as const;
