import { useEffect, useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getProducts, type Product } from '../lib/products';
import { getStoreCategories, type StoreCategory } from '../lib/categories';
import ProductCard from './ProductCard';
import SkeletonCard from './SkeletonCard';
import CategoryChips from './CategoryChips';

const ALL_OPTIONS = [{ id: 'all', label: 'All' }];

export default function PopularCollection() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [categories, setCategories] = useState<StoreCategory[] | null>(null);
  const [category, setCategory] = useState('all');
  const [subCategory, setSubCategory] = useState('all');

  useEffect(() => {
    let active = true;
    getProducts().then((p) => {
      if (active) setProducts(p);
    });
    getStoreCategories().then((c) => {
      if (active) setCategories(c);
    });
    return () => {
      active = false;
    };
  }, []);

  const categoryOptions = useMemo(
    () => [...ALL_OPTIONS, ...(categories ?? []).map((c) => ({ id: c.name, label: c.name }))],
    [categories]
  );
  const subs = category === 'all' ? [] : categories?.find((c) => c.name === category)?.subCategories ?? [];

  const filtered = useMemo(() => {
    if (!products) return [];
    let out = category === 'all' ? products : products.filter((p) => p.category === category);
    if (subCategory !== 'all') out = out.filter((p) => p.subCategory === subCategory);
    return out;
  }, [products, category, subCategory]);

  const handleCategory = (id: string) => {
    setCategory(id);
    setSubCategory('all');
  };

  return (
    <section id="popular" className="mt-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-3xl tracking-wide">POPULAR COLLECTION</h2>
        <div className="flex flex-wrap items-center gap-4">
          <CategoryChips value={category} onChange={handleCategory} options={categoryOptions} />
          <Link
            to="/collections"
            className="group flex items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-cream"
          >
            See All
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {subs.length > 0 && (
        <div className="mt-3">
          <CategoryChips
            value={subCategory}
            onChange={setSubCategory}
            options={[{ id: 'all', label: `All ${category}` }, ...subs.map((s) => ({ id: s, label: s }))]}
            layoutId="sub-chip"
          />
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 2xl:grid-cols-3">
        {products === null
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
      </div>

      {products !== null && filtered.length === 0 && (
        <p className="mt-10 text-center text-sm text-muted">No pieces in this category yet.</p>
      )}
    </section>
  );
}
