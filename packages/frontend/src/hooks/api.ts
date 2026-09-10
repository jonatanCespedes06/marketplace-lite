import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';

export interface Product {
  id: string;
  name: string;
  price: number;
  sku: string;
  description: string;
  category: string;
  stock: number;
}

export interface CreateProductInput {
  name: string;
  price: number;
  sku: string;
  stock: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function useProducts(page = 1, limit = 10) {
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginatedResponse<Product>['meta'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get<PaginatedResponse<Product> | Product[]>('/product-catalog', {
        params: { page, limit },
      });
      // Tolerate both the { data, meta } envelope and a bare array (legacy shape).
      const payload = response.data as PaginatedResponse<Product> | Product[] | null | undefined;
      const rawItems = Array.isArray(payload) ? payload : (payload?.data ?? []);
      const items = (Array.isArray(rawItems) ? rawItems : []).map((p) => ({
        id: String((p as Product).id ?? ''),
        name: String((p as Product).name ?? 'Untitled product'),
        price: Number((p as Product).price ?? 0),
        sku: String((p as Product).sku ?? ''),
        description: String((p as Product).description ?? ''),
        category: String((p as Product).category ?? (p as Product).sku ?? 'General'),
        stock: typeof (p as Product).stock === 'number' ? (p as Product).stock as number : 0,
      }));
      const rawMeta = !Array.isArray(payload) ? payload?.meta : undefined;
      setProducts(items);
      setMeta({
        total: Number(rawMeta?.total ?? items.length),
        page: Number(rawMeta?.page ?? page),
        limit: Number(rawMeta?.limit ?? limit),
        totalPages: Number(rawMeta?.totalPages ?? 1),
      });
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, meta, loading, error, refetch: fetchProducts };
}

export function useCreateProduct() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProduct = async (productData: CreateProductInput) => {
    setLoading(true);
    try {
      const response = await api.post<Product>('/product-catalog', productData);
      setError(null);
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to create product';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  return { createProduct, loading, error };
}

export interface CheckoutInput {
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: 'credit_card' | 'debit_card' | 'bank_transfer' | 'paypal';
  paymentDetails: Record<string, unknown>;
}

export function useCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkout = async (input: CheckoutInput) => {
    setLoading(true);
    try {
      const response = await api.post('/checkout', input);
      setError(null);
      return response.data.data;
    } catch (err: any) {
      const message = err.response?.data?.error || 'Checkout failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  return { checkout, loading, error };
}

export function useCart() {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await api.get('/cart');
      setCart(response.data.data);
    } catch (err) {
      console.error('Failed to fetch cart', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string, quantity: number) => {
    try {
      await api.post('/cart/items', { productId, quantity });
      await fetchCart();
    } catch (err) {
      console.error('Failed to add to cart', err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return { cart, loading, addToCart, refetch: fetchCart };
}
