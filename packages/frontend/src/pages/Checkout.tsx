import React, { useState } from 'react';
import type { CheckoutInput } from '../hooks/api';
import { useCart, useCheckout } from '../hooks/api';

const Checkout: React.FC = () => {
  const { cart, loading: cartLoading } = useCart();
  const { checkout, loading: checkoutLoading, error } = useCheckout();
  const [success, setSuccess] = useState(false);

  const [address, setAddress] = useState<CheckoutInput['shippingAddress']>({
    street: '123 Main St',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62704',
    country: 'USA',
  });

  const handleCheckout = async () => {
    try {
      await checkout({
        shippingAddress: address,
        paymentMethod: {
          type: 'CREDIT_CARD',
          token: 'tok_visa', // Mock token
        },
      });
      setSuccess(true);
    } catch {
      // Error handled by hook
    }
  };

  if (success) {
    return (
      <div className="checkout-success">
        <h1>Order Placed!</h1>
        <p>Thank you for your purchase.</p>
        <a href="/">Go back to products</a>
      </div>
    );
  }

  if (cartLoading) return <div>Loading cart...</div>;
  if (!cart || cart.items.length === 0) return <div>Your cart is empty.</div>;

  return (
    <div className="checkout">
      <h1>Checkout</h1>
      <div className="cart-summary">
        <h2>Order Summary</h2>
        <ul>
          {cart.items.map((item: any) => (
            <li key={item.productId}>
              {item.name} x {item.quantity} - ${item.price * item.quantity}
            </li>
          ))}
        </ul>
        <p><strong>Total: ${cart.totalPrice}</strong></p>
      </div>

      <div className="shipping-info">
        <h2>Shipping Address</h2>
        <input 
          placeholder="Street" 
          value={address.street} 
          onChange={e => setAddress({...address, street: e.target.value})} 
        />
        <input 
          placeholder="City" 
          value={address.city} 
          onChange={e => setAddress({...address, city: e.target.value})} 
        />
        {/* Simplified for demo */}
      </div>

      {error && <div className="error">{error}</div>}
      <button 
        onClick={handleCheckout} 
        disabled={checkoutLoading}
      >
        {checkoutLoading ? 'Processing...' : 'Place Order'}
      </button>
    </div>
  );
};

export default Checkout;
