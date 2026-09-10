import React, { useState } from 'react';
import { useProducts, useCart } from '../hooks/api';

const ProductList: React.FC = () => {
  const [page, setPage] = useState(1);
  const { products, meta, loading, error } = useProducts(page);
  const { addToCart } = useCart();

  if (loading) return <div>Loading products...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="product-list">
      <h1>Products</h1>
      <div className="grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p>Price: ${product.price}</p>
            <button onClick={() => addToCart(product.id, 1)}>Add to Cart</button>
          </div>
        ))}
      </div>
      <div className="pagination">
        <button 
          disabled={page === 1} 
          onClick={() => setPage(p => p - 1)}
        >
          Previous
        </button>
        <span>Page {page} of {meta?.totalPages || 1}</span>
        <button 
          disabled={!meta || page === meta.totalPages} 
          onClick={() => setPage(p => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ProductList;
