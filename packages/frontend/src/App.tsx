import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ProductList from './pages/ProductList';
import CreateProduct from './pages/CreateProduct';
import Checkout from './pages/Checkout';
import './style.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app-container">
        <nav>
          <ul>
            <li><Link to="/">Products</Link></li>
            <li><Link to="/create-product">Add Product</Link></li>
            <li><Link to="/checkout">Cart / Checkout</Link></li>
          </ul>
        </nav>

        <main>
          <Routes>
            <Route path="/" element={<ProductList />} />
            <Route path="/create-product" element={<CreateProduct />} />
            <Route path="/checkout" element={<Checkout />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
