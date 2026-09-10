import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { CheckoutInput } from '../hooks/api';
import { useCart, useCheckout } from '../hooks/api';

const Checkout: React.FC = () => {
  const { cart, loading: cartLoading } = useCart();
  const { checkout, loading: checkoutLoading, error } = useCheckout();
  const [success, setSuccess] = useState(false);

  const [address, setAddress] = useState<CheckoutInput['shippingAddress']>({
    street: '123 Main St',
    city: 'Springfield',
    postalCode: '62704',
    country: 'US',
  });

  const set = (key: keyof typeof address) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress({ ...address, [key]: e.target.value });
  };

  const handleCheckout = async () => {
    try {
      await checkout({
        shippingAddress: { ...address, country: address.country.toUpperCase() },
        paymentMethod: 'credit_card',
        paymentDetails: { token: 'tok_visa' }, // Mock token for demo
      });
      setSuccess(true);
    } catch {
      // Error handled by hook
    }
  };

  if (success) {
    return (
      <div className="card success-card">
        <div className="success-icon">✓</div>
        <h1>Order placed!</h1>
        <p className="muted">Thank you for your purchase. This is a demo, no payment was processed.</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 20 }}>
          Back to products
        </Link>
      </div>
    );
  }

  if (cartLoading) {
    return (
      <div>
        <div className="page-head">
          <h1>Checkout</h1>
        </div>
        <div className="skeleton-grid">
          <div className="skeleton" />
          <div className="skeleton" />
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div>
        <div className="page-head">
          <h1>Checkout</h1>
        </div>
        <div className="state-box">
          <span className="icon">🛒</span>
          <h2>Your cart is empty</h2>
          <p className="small">Add some products before checking out.</p>
          <Link to="/" className="btn btn-primary">
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Checkout</h1>
          <p>Review your order and confirm your shipping details.</p>
        </div>
      </div>

      <div className="checkout-layout">
        <section className="panel">
          <h2>Order summary</h2>
          <ul className="cart-list">
            {cart.items.map((item: any) => (
              <li key={item.productId}>
                <span>
                  <strong>{item.name}</strong>
                  <span className="muted"> × {item.quantity}</span>
                </span>
                <span>
                  <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                </span>
              </li>
            ))}
          </ul>
          <div className="cart-total">
            <span>Total</span>
            <strong>${Number(cart.totalPrice).toFixed(2)}</strong>
          </div>
        </section>

        <section className="panel">
          <h2>Shipping address</h2>
          <div className="form-grid">
            <div className="field full">
              <label htmlFor="street">Street</label>
              <input id="street" value={address.street} onChange={set('street')} placeholder="123 Main St" />
            </div>
            <div className="field">
              <label htmlFor="city">City</label>
              <input id="city" value={address.city} onChange={set('city')} placeholder="Springfield" />
            </div>
            <div className="field">
              <label htmlFor="postal">Postal code</label>
              <input id="postal" value={address.postalCode} onChange={set('postalCode')} placeholder="62704" />
            </div>
            <div className="field">
              <label htmlFor="country">Country (2 letters)</label>
              <input id="country" value={address.country} onChange={set('country')} placeholder="US" maxLength={2} />
            </div>
          </div>

          <div className="alert alert-info" style={{ marginTop: 16 }}>
            Demo payment: credit card <code>tok_visa</code>. No real charge.
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginTop: 12 }}>
              {error}
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={checkoutLoading}
            className="btn btn-primary btn-block"
            style={{ marginTop: 16 }}
          >
            {checkoutLoading ? 'Processing…' : `Place order · $${Number(cart.totalPrice).toFixed(2)}`}
          </button>
        </section>
      </div>
    </div>
  );
};

export default Checkout;
