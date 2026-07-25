import { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductGrid } from './components/ProductGrid';
import { Footer } from './components/Footer';
import { Cart } from './components/Cart';
import { ShippingReturns } from './components/ShippingReturns';
import { ContactModal } from './components/ContactModal';
import { Routes, Route, useLocation } from 'react-router-dom';
import type { Product, CartItem } from './data/products';
import Auth from './pages/Auth';
import Admin from './pages/Admin';
import AdminProductForm from './pages/AdminProductForm';
import { Toaster } from 'react-hot-toast';
import { WhatsAppBlob } from './components/WhatsAppBlob';

export type Currency = 'USD' | 'NGN' | 'GBP' | 'CAD';
export const EXCHANGE_RATE_NGN = 1500;
export const EXCHANGE_RATE_GBP = 0.79;
export const EXCHANGE_RATE_CAD = 1.35;

function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const location = useLocation();
  const [currency, setCurrency] = useState<Currency>('NGN');

  const handleAddToCart = (product: Product, size: string, color: string) => {
    const id = `${product.id}-${size}-${color}`;
    setCartItems(prev => {
      const existing = prev.find(item => item.id === id);
      if (existing) {
        return prev.map(item => 
          item.id === id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { id, product, size, color, quantity: 1 }];
    });
    setIsCartOpen(true); // Auto-open cart on add
  };

  const handleRemoveFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };


  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <Toaster position="top-right" />
      <Header 
        cartCount={totalCartItems} 
        onCartClick={() => setIsCartOpen(true)} 
        currency={currency}
        onCurrencyChange={setCurrency}
      />
      <main>
        <Routes>
          <Route path="/login" element={<Auth />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/products/new" element={<AdminProductForm />} />
          
          <Route path="/" element={
            <>
              <Hero onContactClick={() => setIsContactModalOpen(true)} />
              <ProductGrid onAddToCart={handleAddToCart} currency={currency} />
            </>
          } />
          <Route path="/shipping-returns" element={<ShippingReturns />} />
        </Routes>
      </main>
      <Footer onContactClick={() => setIsContactModalOpen(true)} />
      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cartItems={cartItems} 
        onRemoveItem={handleRemoveFromCart}
        onUpdateQuantity={handleUpdateQuantity}
        currency={currency}
      />
      <ContactModal 
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
      {!location.pathname.startsWith('/admin') && <WhatsAppBlob />}
    </>
  );
}

export default App;
