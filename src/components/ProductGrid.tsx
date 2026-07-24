import { useState } from 'react';
import { ProductCard } from './ProductCard';
import { products } from '../data/products';
import type { Product } from '../data/products';
import type { Currency } from '../App';
import './ProductGrid.css';

interface ProductGridProps {
  onAddToCart: (product: Product, size: string, color: string) => void;
  currency: Currency;
}

export function ProductGrid({ onAddToCart, currency }: ProductGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'wrapper', label: 'Wrappers' },
    { id: 't-shirts', label: 'T-Shirts' },
    { id: 'joggers', label: 'Joggers' }
  ];

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  return (
    <section className="product-grid-section container">
      <div className="section-header">
        <h2 className="section-title">Latest Arrivals</h2>
      </div>
      
      <div className="category-tabs">
        {categories.map(cat => (
          <button 
            key={cat.id}
            className={`category-tab ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="product-grid">
        {filteredProducts.map(product => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onAddToCart={onAddToCart} 
            currency={currency}
          />
        ))}
      </div>
    </section>
  );
}
