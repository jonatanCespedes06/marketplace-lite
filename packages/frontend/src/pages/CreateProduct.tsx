import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateProduct } from '../hooks/api';

const productSchema = z.object({
  name: z.string().min(3, 'Name is too short'),
  description: z.string().min(10, 'Description is too short'),
  price: z.number().positive('Price must be positive'),
  category: z.string().min(1, 'Category is required'),
  stock: z.number().int().nonnegative('Stock cannot be negative'),
});

type ProductFormData = z.infer<typeof productSchema>;

const CreateProduct: React.FC = () => {
  const { createProduct, loading, error: apiError } = useCreateProduct();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  const onSubmit = async (data: ProductFormData) => {
    try {
      await createProduct(data);
      alert('Product created successfully!');
      reset();
    } catch {
      // Error is handled by the hook
    }
  };

  return (
    <div className="create-product">
      <h1>Create New Product</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label>Name</label>
          <input {...register('name')} />
          {errors.name && <span className="error">{errors.name.message}</span>}
        </div>
        <div>
          <label>Description</label>
          <textarea {...register('description')} />
          {errors.description && <span className="error">{errors.description.message}</span>}
        </div>
        <div>
          <label>Price</label>
          <input type="number" step="0.01" {...register('price', { valueAsNumber: true })} />
          {errors.price && <span className="error">{errors.price.message}</span>}
        </div>
        <div>
          <label>Category</label>
          <input {...register('category')} />
          {errors.category && <span className="error">{errors.category.message}</span>}
        </div>
        <div>
          <label>Stock</label>
          <input type="number" {...register('stock', { valueAsNumber: true })} />
          {errors.stock && <span className="error">{errors.stock.message}</span>}
        </div>
        {apiError && <div className="error">{apiError}</div>}
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Product'}
        </button>
      </form>
    </div>
  );
};

export default CreateProduct;
