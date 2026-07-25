import { useState, useEffect } from 'react';
import { Query } from 'appwrite';
import { ProductCard } from './ProductCard';
import type { Product } from '../data/products';
import type { Currency } from '../App';
import { databases, APPWRITE_CONFIG } from '../lib/appwrite';
import './ProductGrid.css';

interface ProductGridProps {
  onAddToCart: (product: Product, size: string, color: string) => void;
  currency: Currency;
}

export function ProductGrid({ onAddToCart, currency }: ProductGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'all', label: 'All', subCategories: [] },
    { id: 'Fabric', label: 'Fabric', subCategories: ['Wrappers'] },
    { id: 'Casual wears', label: 'Casual wears', subCategories: ['T-Shirts', 'Joggers', 'Jeans'] },
    { id: 'Corporate wear', label: 'Corporate wear', subCategories: ['French suits', 'Ties', 'Suits', 'Coats'] },
    { id: 'Sewn wears', label: 'Sewn wears', subCategories: [] },
    { id: 'Shoes', label: 'Shoes', subCategories: [] }
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collectionId,
          [Query.limit(100)]
        );
        
        const mappedProducts: Product[] = response.documents
          // Filter out the old test item if it exists
          .filter(doc => doc.name !== 'Test Wrapper')
          .map((doc: any) => {
            // Normalize categories to match the new tabs
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
        console.error('Failed to fetch products', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleCategoryClick = (catId: string) => {
    setSelectedCategory(catId);
    setSelectedSubCategory('all');
  };

  const currentCategoryObj = categories.find(c => c.id === selectedCategory);
  
  const filteredProducts = products.filter(p => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (selectedSubCategory !== 'all' && p.subCategory !== selectedSubCategory) return false;
    return true;
  });

  const isProductNewArrival = (p: Product) => {
    if (!p.newArrivalExpiresAt) return false;
    return new Date(p.newArrivalExpiresAt) > new Date();
  };

  const newArrivals = products.filter(isProductNewArrival);

  return (
    <section className="product-grid-section container">
      {newArrivals.length > 0 && (
        <div style={{ marginBottom: '4rem' }}>
          <div className="section-header">
            <h2 className="section-title">Latest Arrivals</h2>
          </div>
          <div className="product-grid">
            {newArrivals.map(product => (
              <ProductCard 
                key={`new-${product.id}`} 
                product={product} 
                onAddToCart={onAddToCart} 
                currency={currency}
                isNewArrival={true}
              />
            ))}
          </div>
        </div>
      )}

      <div id="shop" className="section-header">
        <h2 className="section-title">Shop</h2>
      </div>
      
      <div className="category-tabs">
        {categories.map(cat => (
          <button 
            key={cat.id}
            className={`category-tab ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => handleCategoryClick(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {currentCategoryObj && currentCategoryObj.subCategories.length > 0 && (
        <div className="subcategory-tabs" style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', justifyContent: 'center' }}>
          <button 
            className={`subcategory-tab ${selectedSubCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedSubCategory('all')}
            style={{ padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid #e2e8f0', background: selectedSubCategory === 'all' ? '#0f172a' : 'transparent', color: selectedSubCategory === 'all' ? 'white' : '#64748b', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            All {currentCategoryObj.label}
          </button>
          {currentCategoryObj.subCategories.map(subCat => (
            <button 
              key={subCat}
              className={`subcategory-tab ${selectedSubCategory === subCat ? 'active' : ''}`}
              onClick={() => setSelectedSubCategory(subCat)}
              style={{ padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid #e2e8f0', background: selectedSubCategory === subCat ? '#0f172a' : 'transparent', color: selectedSubCategory === subCat ? 'white' : '#64748b', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              {subCat}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="loading-state" style={{textAlign: 'center', padding: '3rem', color: '#64748b'}}>
          Loading products...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="empty-state" style={{textAlign: 'center', padding: '3rem', color: '#64748b'}}>
          Coming soon...
        </div>
      ) : (
        <div className="product-grid">
          {filteredProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onAddToCart={onAddToCart} 
              currency={currency}
              isNewArrival={isProductNewArrival(product)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
