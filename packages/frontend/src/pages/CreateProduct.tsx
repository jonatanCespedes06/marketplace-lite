import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useCreateProduct } from '../hooks/api';

// Mirrors the backend contract (specs/product-catalog/technical.md):
// POST /product-catalog { name, price, sku }
const productSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  price: z.number().positive('Price must be positive'),
  sku: z
    .string()
    .regex(/^[A-Z]{3}-\d{4}$/, 'SKU must match format ABC-1234 (3 uppercase letters, dash, 4 digits)'),
  stock: z.number().int().nonnegative('Stock cannot be negative'),
});

type ProductFormData = z.infer<typeof productSchema>;

const CreateProduct: React.FC = () => {
  const navigate = useNavigate();
  const { createProduct, loading, error: apiError } = useCreateProduct();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  const onSubmit = async (data: ProductFormData) => {
    try {
      await createProduct(data);
      navigate('/products');
    } catch {
      // Error is handled by the hook
    }
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Create New Product</h1>
          <p>Fill in the details below. All fields are validated before saving.</p>
        </div>
      </div>

      <form className="form-card" onSubmit={handleSubmit(onSubmit)}>
        <div className="form-grid">
          <div className="field full">
            <label htmlFor="name">Name</label>
            <input id="name" placeholder="e.g. Wireless Headphones" {...register('name')} />
            {errors.name && <span className="field-error">{errors.name.message}</span>}
          </div>

          <div className="field">
            <label htmlFor="price">Price (USD)</label>
            <input
              id="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="49.99"
              {...register('price', { valueAsNumber: true })}
            />
            {errors.price && <span className="field-error">{errors.price.message}</span>}
          </div>

          <div className="field">
            <label htmlFor="sku">SKU</label>
            <input id="sku" placeholder="e.g. AUD-1001" {...register('sku')} />
            {errors.sku && <span className="field-error">{errors.sku.message}</span>}
          </div>

          <div className="field">
            <label htmlFor="stock">Stock</label>
            <input
              id="stock"
              type="number"
              min="0"
              step="1"
              placeholder="10"
              {...register('stock', { valueAsNumber: true })}
            />
            {errors.stock && <span className="field-error">{errors.stock.message}</span>}
          </div>
        </div>

        <p className="small muted" style={{ marginTop: 12 }}>
          SKU format: 3 uppercase letters, a dash, then 4 digits (e.g. AUD-1001).
        </p>

        {apiError && (
          <div className="alert alert-error" style={{ marginTop: 16 }}>
            {apiError}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn btn-primary btn-block" style={{ marginTop: 20 }}>
          {loading ? 'Creating…' : 'Create Product'}
        </button>
      </form>
    </div>
  );
};

export default CreateProduct;
