import { useState, useEffect } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { account } from '../lib/appwrite';
import type { CartItem } from '../data/products';
import type { Currency } from '../App';
import { formatPrice } from '../utils/currency';
import { usePaystackPayment } from 'react-paystack';
import './Cart.css';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onRemoveItem: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  currency: Currency;
}

export function Cart({ isOpen, onClose, cartItems, onRemoveItem, onUpdateQuantity, currency }: CartProps) {
  const totalPriceInNGN = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    if (isOpen) {
      account.get().then(user => {
        setUserEmail(user.email);
      }).catch(() => {
        // Not logged in
      });
    }
  }, [isOpen]);

  const config = {
    reference: (new Date()).getTime().toString(),
    email: userEmail || "guest@example.com",
    amount: totalPriceInNGN * 100, // Amount is in kobo
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '',
  };

  const initializePayment = usePaystackPayment(config);

  const handleCheckout = async () => {
    try {
      await account.get(); // Check if logged in
      
      initializePayment(
        (reference: any) => {
          alert("Payment successful! Reference: " + reference.reference);
          cartItems.forEach(item => onRemoveItem(item.id));
          onClose();
        },
        () => {
          console.log("Payment closed.");
        }
      );
    } catch (e) {
      // Not logged in
      onClose(); // Close cart
      navigate('/login', { state: { from: '/' } }); // Redirect to login
    }
  };

  return (
    <div className={`cart-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="cart-drawer" onClick={e => e.stopPropagation()}>
        <div className="cart-header">
          <h2>Your Cart</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close cart">
            <X size={24} />
          </button>
        </div>

        <div className="cart-items">
          {cartItems.length === 0 ? (
            <p className="empty-cart">Your cart is currently empty.</p>
          ) : (
            cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <img src={item.product.image} alt={item.product.name} className="cart-item-image" />
                <div className="cart-item-details">
                  <h4 className="cart-item-title">{item.product.name}</h4>
                  <div className="cart-item-info">
                    <span>Size: {item.size} | Color: {item.color}</span>
                    <div className="cart-quantity-controls">
                      <button type="button" onClick={() => onUpdateQuantity(item.id, -1)} disabled={item.quantity <= 1}>
                        <Minus size={14} />
                      </button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => onUpdateQuantity(item.id, 1)}>
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="cart-item-bottom">
                    <span className="cart-item-price">{formatPrice(item.product.price * item.quantity, currency)}</span>
                    <button className="remove-btn" onClick={() => onRemoveItem(item.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Total</span>
              <span>{formatPrice(totalPriceInNGN, currency)}</span>
            </div>
            <button className="checkout-btn" onClick={handleCheckout}>
              Checkout with Paystack
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
