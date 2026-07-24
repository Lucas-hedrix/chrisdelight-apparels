import { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductGrid } from './components/ProductGrid';
import { Footer } from './components/Footer';
import { Cart } from './components/Cart';
import { ShippingReturns } from './components/ShippingReturns';
import { ContactModal } from './components/ContactModal';
import { Routes, Route } from 'react-router-dom';
import type { Product, CartItem } from './data/products';

export type Currency = 'USD' | 'NGN';
export const EXCHANGE_RATE_NGN = 1500;

function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [currency, setCurrency] = useState<Currency>('USD');

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

  const toggleCurrency = () => {
    setCurrency(prev => prev === 'USD' ? 'NGN' : 'USD');
  };

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <Header 
        cartCount={totalCartItems} 
        onCartClick={() => setIsCartOpen(true)} 
        onContactClick={() => setIsContactModalOpen(true)}
        currency={currency}
        onToggleCurrency={toggleCurrency}
      />
      <main>
        <Routes>
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
        currency={currency}
      />
      <ContactModal 
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </>
  );
}

export default App;
