import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ShoppingCart, Menu, X } from 'lucide-react';
import type { Currency } from '../App';
import './Header.css';

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
  onContactClick: () => void;
  currency: Currency;
  onToggleCurrency: () => void;
}

export function Header({ cartCount, onCartClick, onContactClick, currency, onToggleCurrency }: HeaderProps) {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className={`header ${isHome ? 'header-transparent' : 'header-solid'}`}>
      <div className="container header-container">
        <Link to="/" className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>CHRISDELIGHT APPARELS</Link>
        <nav className="nav desktop-nav">
          <Link to="/" className="nav-link">Shop</Link>
          <a href="#" className="nav-link">Collections</a>
          <a href="#" className="nav-link">About</a>
          <button className="currency-toggle" onClick={onToggleCurrency}>
            {currency === 'USD' ? 'USD ($)' : 'NGN (₦)'}
          </button>
          <button className="cart-button" onClick={onCartClick}>
            <ShoppingCart size={20} />
            <span className="cart-text">Cart</span>
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </button>
        </nav>
        
        <div className="mobile-actions">
          <button className="cart-button" onClick={onCartClick}>
            <ShoppingCart size={20} />
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </button>
          <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <Link to="/" className="mobile-nav-link" onClick={closeMobileMenu}>Shop</Link>
          <a href="#" className="mobile-nav-link" onClick={closeMobileMenu}>Collections</a>
          <a href="#" className="mobile-nav-link" onClick={closeMobileMenu}>About</a>
          <div className="mobile-nav-actions">
            <button className="currency-toggle" onClick={onToggleCurrency}>
              {currency === 'USD' ? 'Switch to NGN (₦)' : 'Switch to USD ($)'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
