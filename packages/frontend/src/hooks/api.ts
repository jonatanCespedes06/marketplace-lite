import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
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
      const response = await api.get<PaginatedResponse<Product>>('/product-catalog', {
        params: { page, limit },
      });
      setProducts(response.data.data);
      setMeta(response.data.meta);
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

  const createProduct = async (productData: Omit<Product, 'id'>) => {
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
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: {
    type: 'CREDIT_CARD';
    token: string;
  };
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
