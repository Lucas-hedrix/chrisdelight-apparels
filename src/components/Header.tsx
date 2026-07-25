import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, User } from 'lucide-react';
import type { Currency } from '../App';
import { account } from '../lib/appwrite';
import './Header.css';

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
  currency: Currency;
  onCurrencyChange: (c: Currency) => void;
}

export function Header({ cartCount, onCartClick, currency, onCurrencyChange }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await account.get();
        setUser(currentUser);
      } catch (e) {
        setUser(null);
      }
    };
    checkUser();
  }, [location]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleAuthAction = async () => {
    if (user) {
      if (user.email === 'admin@example.com') {
        navigate('/admin');
      } else {
        // Logout user
        await account.deleteSession('current');
        setUser(null);
      }
    } else {
      navigate('/login');
    }
  };

  return (
    <header className={`header ${isHome ? 'header-transparent' : 'header-solid'}`}>
      <div className="container header-container">
        <Link to="/" className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>CHRISDELIGHT APPARELS</Link>
        <nav className="nav desktop-nav">
          <Link to="/" className="nav-link">Shop</Link>
          <a href="#" className="nav-link">Collections</a>
          <a href="#" className="nav-link">About</a>
          <select 
            className="currency-select" 
            value={currency} 
            onChange={(e) => onCurrencyChange(e.target.value as Currency)}
            style={{ 
              background: 'transparent', 
              color: 'inherit', 
              border: '1px solid currentColor', 
              padding: '0.25rem 0.5rem', 
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 500,
              outline: 'none'
            }}
          >
            <option value="USD" style={{ color: 'black' }}>USD ($)</option>
            <option value="NGN" style={{ color: 'black' }}>NGN (₦)</option>
            <option value="GBP" style={{ color: 'black' }}>GBP (£)</option>
            <option value="CAD" style={{ color: 'black' }}>CAD ($)</option>
          </select>
          
          <button className="auth-button" onClick={handleAuthAction} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
            <User size={20} />
            <span>{user ? (user.email === 'admin@example.com' ? 'Admin' : 'Sign Out') : 'Sign In'}</span>
          </button>

          <button className="cart-button" onClick={onCartClick}>
            <ShoppingCart size={20} />
            <span className="cart-text">Cart</span>
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </button>
        </nav>
        
        <div className="mobile-actions">
          <button className="auth-button" onClick={handleAuthAction} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <User size={20} />
          </button>
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
            <select 
              className="currency-select-mobile" 
              value={currency} 
              onChange={(e) => onCurrencyChange(e.target.value as Currency)}
              style={{ 
                background: 'transparent', 
                color: 'inherit', 
                border: '1px solid currentColor', 
                padding: '0.5rem', 
                borderRadius: '4px',
                width: '100%',
                cursor: 'pointer',
                marginBottom: '1rem',
                outline: 'none'
              }}
            >
              <option value="USD" style={{ color: 'black' }}>USD ($)</option>
              <option value="NGN" style={{ color: 'black' }}>NGN (₦)</option>
              <option value="GBP" style={{ color: 'black' }}>GBP (£)</option>
              <option value="CAD" style={{ color: 'black' }}>CAD ($)</option>
            </select>
            <button className="mobile-nav-link" onClick={() => { handleAuthAction(); closeMobileMenu(); }} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '1rem 0' }}>
              {user ? (user.email === 'admin@example.com' ? 'Admin Dashboard' : 'Sign Out') : 'Sign In'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
