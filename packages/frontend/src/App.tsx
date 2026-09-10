import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Link } from 'react-router-dom';
import ProductList from './pages/ProductList';
import CreateProduct from './pages/CreateProduct';
import Checkout from './pages/Checkout';
import './style.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app-shell">
        <header className="navbar">
          <div className="navbar-inner">
            <Link to="/" className="brand">
              <span className="brand-mark">M</span>
              <span>
                Marketplace Lite
                <small>Demo</small>
              </span>
            </Link>
            <nav>
              <ul className="nav-links">
                <li>
                  <NavLink to="/products" className={({ isActive }) => (isActive ? 'active' : '')}>
                    Products
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/create-product" className={({ isActive }) => (isActive ? 'active' : '')}>
                    Add Product
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/checkout" className={({ isActive }) => (isActive ? 'active' : '')}>
                    Cart / Checkout
                  </NavLink>
                </li>
              </ul>
            </nav>
          </div>
        </header>

        <main className="main">
          <Routes>
            <Route path="/" element={<ProductList />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/create-product" element={<CreateProduct />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route
              path="*"
              element={
                <div className="state-box">
                  <span className="icon">🔍</span>
                  <h2>Page not found</h2>
                  <p className="small">The page you are looking for does not exist.</p>
                  <Link to="/products" className="btn btn-primary">
                    Back to products
                  </Link>
                </div>
              }
            />
          </Routes>
        </main>

        <footer className="footer">
          <div className="footer-inner">
            <span>Marketplace Lite — demo técnica</span>
            <span>Clean Architecture + DDD + SDD</span>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
