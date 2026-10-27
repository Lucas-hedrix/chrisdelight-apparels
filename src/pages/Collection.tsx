import { useEffect, useMemo, useState } from 'react';
import { Search, SearchX } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { getProducts, type Product } from '../lib/products';
import { getStoreCategories, type StoreCategory } from '../lib/categories';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/SkeletonCard';
import CategoryChips from '../components/CategoryChips';

const ALL_OPTIONS = [{ id: 'all', label: 'All' }];

export default function Collection() {
  const [searchParams, setSearchParams] = useSearchParams();
  const paramQ = searchParams.get('q') ?? '';
  const [q, setQ] = useState(paramQ);
  const [category, setCategory] = useState('all');
  const [subCategory, setSubCategory] = useState('all');
  const [products, setProducts] = useState<Product[] | null>(null);
  const [categories, setCategories] = useState<StoreCategory[] | null>(null);

  useEffect(() => {
    setQ(paramQ);
  }, [paramQ]);

  useEffect(() => {
    let active = true;
    getStoreCategories().then((c) => {
      if (active) setCategories(c);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearchParams(q ? { q } : {}, { replace: true });
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  useEffect(() => {
    let active = true;
    setProducts(null);
    getProducts({ search: paramQ }).then((p) => {
      if (active) setProducts(p);
    });
    return () => {
      active = false;
    };
  }, [paramQ]);

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
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl tracking-wide">FULL COLLECTION</h1>
          <p className="mt-1 text-sm text-muted">
            {products
              ? `${filtered.length} piece${filtered.length === 1 ? '' : 's'}`
              : 'Loading pieces...'}
          </p>
        </div>
        <form className="flex w-full max-w-xs items-center gap-2.5 rounded-xl border border-line bg-card px-4 py-2.5 transition-colors focus-within:border-brand/50">
          <Search className="h-4 w-4 shrink-0 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search fabrics, tees, joggers..."
            className="w-full bg-transparent text-sm text-cream outline-none placeholder:text-muted"
          />
        </form>
      </div>

      <div className="mt-6">
        <CategoryChips value={category} onChange={handleCategory} options={categoryOptions} />
      </div>

      {subs.length > 0 && (
        <div className="mt-3">
          <CategoryChips
            value={subCategory}
            onChange={setSubCategory}
            options={[{ id: 'all', label: `All ${category}` }, ...subs.map((s) => ({ id: s, label: s }))]}
            layoutId="sub-chip-page"
          />
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {products === null
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
      </div>

      {products !== null && filtered.length === 0 && (
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-card-2 text-muted">
            <SearchX className="h-7 w-7" />
          </div>
          <h3 className="font-bold">No pieces found</h3>
          <p className="text-sm text-muted">
            {paramQ
              ? `Nothing matches "${paramQ}" yet. Try another search.`
              : 'Check back soon — new drops weekly.'}
          </p>
        </div>
      )}
    </div>
  );
}
