import { useEffect, useMemo, useState } from 'react';
import { getProducts, type Product } from '../lib/products';
import { recommendForYou } from '../lib/recommend';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import ProductCard from './ProductCard';
import SkeletonCard from './SkeletonCard';

export default function PickedForYou() {
  const { items: saved } = useWishlist();
  const { items: cartItems } = useCart();
  const [products, setProducts] = useState<Product[] | null>(null);

  const hasSignals = saved.length > 0 || cartItems.length > 0;

  useEffect(() => {
    if (!hasSignals) return;
    let active = true;
    getProducts().then((p) => {
      if (active) setProducts(p);
    });
    return () => {
      active = false;
    };
  }, [hasSignals]);

  const picks = useMemo(
    () => (products ? recommendForYou(products, saved, cartItems, 3) : []),
    [products, saved, cartItems],
  );

  if (!hasSignals || (products !== null && picks.length === 0)) return null;

  return (
    <section className="mt-14">
      <h2 className="font-display text-3xl tracking-wide">PICKED FOR YOU</h2>
      <p className="mt-1 text-sm text-muted">Based on what you&apos;ve saved and added to cart.</p>
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 2xl:grid-cols-3">
        {products === null
          ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
          : picks.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
      </div>
    </section>
  );
}
