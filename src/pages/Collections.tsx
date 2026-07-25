import { useState, useEffect } from 'react';
import { Query } from 'appwrite';
import { databases, APPWRITE_CONFIG } from '../lib/appwrite';
import { ProductCard } from '../components/ProductCard';
import type { Product } from '../data/products';
import type { Currency } from '../App';
import './Collections.css';

interface CollectionsProps {
  onAddToCart: (product: Product, size: string, color: string) => void;
  currency: Currency;
}

export default function Collections({ onAddToCart, currency }: CollectionsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collectionId,
          [Query.limit(500)]
        );
        
        const mappedProducts: Product[] = response.documents
          .filter(doc => doc.name !== 'Test Wrapper')
          .map((doc: any) => {
            let cat = doc.category;
            if (cat === 'Fabrics') cat = 'Fabric';
            
            return {
              id: doc.$id,
              name: doc.name,
              price: doc.price,
              category: cat,
              subCategory: doc.subCategory || '',
              image: doc.image,
              availableSizes: doc.availableSizes,
              availableColors: doc.availableColors,
              newArrivalExpiresAt: doc.newArrivalExpiresAt
            };
          });
        
        setProducts(mappedProducts);
      } catch (error) {
        console.error('Error fetching collections:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Group products by category
  const groupedProducts = products.reduce((acc, product) => {
    const category = product.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  // Sort categories alphabetically
  const categories = Object.keys(groupedProducts).sort();

  const scrollToCategory = (category: string) => {
    setActiveSection(category);
    const element = document.getElementById(`category-${category}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return <div className="collections-page"><div className="admin-loading">Loading Collections...</div></div>;
  }

  return (
    <div className="collections-page">
      <header className="collections-hero">
        <h1>Our Collections</h1>
        <p>Explore our carefully curated range of premium apparel, from stunning fabrics to sharp corporate wears.</p>
      </header>

      {categories.length > 0 && (
        <nav className="collections-nav">
          {categories.map(category => (
            <button 
              key={category} 
              className={activeSection === category ? 'active' : ''}
              onClick={() => scrollToCategory(category)}
            >
              {category}
            </button>
          ))}
        </nav>
      )}

      <div className="collections-content">
        {categories.length === 0 ? (
          <div className="text-center" style={{ padding: '4rem' }}>
            <p>No items available in our collections yet. Check back soon!</p>
          </div>
        ) : (
          categories.map(category => (
            <section 
              key={category} 
              id={`category-${category}`} 
              className="category-section"
            >
              <div className="category-header">
                <h2>{category}</h2>
              </div>
              
              <div className="products-grid">
                {groupedProducts[category].map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={onAddToCart}
                    currency={currency}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
