import { X, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { account } from '../lib/appwrite';
import type { CartItem } from '../data/products';
import type { Currency } from '../App';
import { formatPrice } from '../utils/currency';
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

  const handleCheckout = async () => {
    try {
      await account.get(); // Check if logged in
      
      const phoneNumber = "2348060502710";
      
      let message = "Hi Chrisdelight Apparels! I'd like to place an order for the following items:\n\n";
      cartItems.forEach(item => {
        const itemPriceStr = formatPrice(item.product.price * item.quantity, currency);
        message += `- ${item.quantity}x ${item.product.name} (Size: ${item.size}, Color: ${item.color}) - ${itemPriceStr}\n`;
      });
      const totalStr = formatPrice(totalPriceInNGN, currency);
      message += `\nTotal: ${totalStr}`;
      
      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
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
              Checkout via WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
