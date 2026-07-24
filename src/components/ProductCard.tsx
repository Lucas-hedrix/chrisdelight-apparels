import { useState } from 'react';
import type { Product } from '../data/products';
import type { Currency } from '../App';
import { formatPrice } from '../utils/currency';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, size: string, color: string) => void;
  currency: Currency;
}

export function ProductCard({ product, onAddToCart, currency }: ProductCardProps) {
  const [selectedSize, setSelectedSize] = useState(product.availableSizes[0] || '');
  const [selectedColor] = useState(product.availableColors[0] || '');

  return (
    <div className="product-card">
      <div className="product-image-container">
        <img src={product.image} alt={product.name} className="product-image" />
      </div>
      
      <div className="product-info">
        <div>
          <h3 className="product-name">{product.name}</h3>
          <p className="product-price">{formatPrice(product.price, currency)}</p>
        </div>
      </div>

      <div className="product-actions">
        <div className="selectors">
          <div className="select-group">
            <span className="select-label">Size</span>
            <select 
              className="select-input" 
              value={selectedSize} 
              onChange={(e) => setSelectedSize(e.target.value)}
            >
              {product.availableSizes.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
          {/* Color selector temporarily removed 
          <div className="select-group">
            <span className="select-label">Color</span>
            <select 
              className="select-input" 
              value={selectedColor} 
              onChange={(e) => setSelectedColor(e.target.value)}
            >
              {product.availableColors.map(color => (
                <option key={color} value={color}>{color}</option>
              ))}
            </select>
          </div>
          */}
        </div>
        
        <button 
          className="add-to-cart-btn" 
          onClick={() => onAddToCart(product, selectedSize, selectedColor)}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
