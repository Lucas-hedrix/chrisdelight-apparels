import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, User } from 'lucide-react';
import type { Currency } from '../App';
import { account, isAdmin } from '../lib/appwrite';
import toast from 'react-hot-toast';
import { ConfirmModal } from './ConfirmModal';
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
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
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

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
      toast.success('Successfully signed out');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to sign out');
    }
  };

  return (
    <header className={`header ${isHome ? 'header-transparent' : 'header-solid'}`}>
      <div className="container header-container">
        <Link to="/" className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>CHRISDELIGHT APPARELS</Link>
        <nav className="nav desktop-nav">
          <a href="/#shop" className="nav-link">Shop</a>
          <Link to="/collections" className="nav-link">Collections</Link>
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
          
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {isAdmin(user.email) && (
                <Link to="/admin" className="nav-link" style={{ fontWeight: 500 }}>Admin</Link>
              )}
              <button className="auth-button" onClick={handleLogoutClick} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                <User size={20} />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <button className="auth-button" onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
              <User size={20} />
              <span>Sign In</span>
            </button>
          )}

          <button className="cart-button" onClick={onCartClick}>
            <ShoppingCart size={20} />
            <span className="cart-text">Cart</span>
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </button>
        </nav>
        
        <div className="mobile-actions">
          <button className="auth-button" onClick={() => user ? handleLogoutClick() : navigate('/login')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
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
          <a href="/#shop" className="mobile-nav-link" onClick={closeMobileMenu}>Shop</a>
          <Link to="/collections" className="mobile-nav-link" onClick={closeMobileMenu}>Collections</Link>
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
            {user ? (
              <>
                {isAdmin(user.email) && (
                  <Link to="/admin" className="mobile-nav-link" onClick={closeMobileMenu} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '1rem 0', textDecoration: 'none', color: 'inherit' }}>
                    Admin Dashboard
                  </Link>
                )}
                <button className="mobile-nav-link" onClick={() => { handleLogoutClick(); closeMobileMenu(); }} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '1rem 0' }}>
                  Sign Out
                </button>
              </>
            ) : (
              <button className="mobile-nav-link" onClick={() => { navigate('/login'); closeMobileMenu(); }} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '1rem 0' }}>
                Sign In
              </button>
            )}
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={confirmLogout}
        title="Sign Out"
        message="Are you sure you want to sign out?"
        confirmText="Sign Out"
      />
    </header>
  );
}
