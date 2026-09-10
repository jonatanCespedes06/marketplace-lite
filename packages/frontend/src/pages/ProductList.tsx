import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts, useCart } from '../hooks/api';

const ProductList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [addedId, setAddedId] = useState<string | null>(null);
  const { products, meta, loading, error } = useProducts(page);
  const { addToCart } = useCart();

  const handleAdd = async (id: string) => {
    await addToCart(id, 1);
    setAddedId(id);
    window.setTimeout(() => {
      setAddedId((current) => (current === id ? null : current));
    }, 1500);
  };

  if (loading) {
    return (
      <div>
        <div className="page-head">
          <div>
            <h1>Products</h1>
            <p>Loading the catalog…</p>
          </div>
        </div>
        <div className="skeleton-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="page-head">
          <h1>Products</h1>
        </div>
        <div className="alert alert-error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Products</h1>
          <p>Explore the demo catalog. Add items to your cart and try the checkout flow.</p>
        </div>
        <Link to="/create-product" className="btn btn-secondary">
          + New product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="state-box">
          <span className="icon">📦</span>
          <h2>No products yet</h2>
          <p className="small">Create the first one to get started.</p>
          <Link to="/create-product" className="btn btn-primary">
            Create product
          </Link>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <article key={product.id} className="product-card">
              <div className="product-top">
                <span className="badge">{product.category}</span>
                <span className={`badge ${product.stock > 0 ? 'badge-success' : ''}`}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>
              <h3>{product.name}</h3>
              <p className="product-desc">{product.description}</p>
              <div className="product-foot">
                <span className="price">${product.price.toFixed(2)}</span>
                <button
                  className="btn btn-primary"
                  onClick={() => handleAdd(product.id)}
                  disabled={product.stock === 0}
                >
                  {addedId === product.id ? '✓ Added' : 'Add to Cart'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="pagination">
        <button
          className="btn btn-secondary"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          ← Previous
        </button>
        <span>
          Page {page} of {meta?.totalPages || 1}
        </span>
        <button
          className="btn btn-secondary"
          disabled={!meta || page === meta.totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default ProductList;
