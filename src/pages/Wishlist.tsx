import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useWishlist } from '../context/WishlistContext';

export default function Wishlist() {
  const { items } = useWishlist();

  return (
    <div>
      <h1 className="font-display text-3xl tracking-wide">WISHLIST</h1>
      <p className="mt-1 text-sm text-muted">
        {items.length > 0
          ? `${items.length} ${items.length === 1 ? 'piece' : 'pieces'} saved for later`
          : 'Pieces you save show up here.'}
      </p>

      {items.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-4 rounded-3xl border border-line bg-card px-6 py-16 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-brand/10 text-brand">
            <Heart className="h-7 w-7" />
          </div>
          <h2 className="font-bold">Nothing saved yet</h2>
          <p className="max-w-sm text-sm leading-relaxed text-muted">
            Tap the heart on any piece to keep it here for later.
          </p>
          <Link
            to="/collections"
            className="mt-2 rounded-full bg-brand px-6 py-3 text-sm font-bold text-ink shadow-lg shadow-white/15 transition-colors hover:bg-brand-strong"
          >
            Browse Collections
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 2xl:grid-cols-3">
          {items.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
