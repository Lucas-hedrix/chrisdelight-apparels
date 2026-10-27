import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Product } from '../lib/products';

const STORAGE_KEY = 'cybernexus.wishlist.v1';

interface WishlistValue {
  items: Product[];
  count: number;
  has: (id: string) => boolean;
  /** Returns true when the product is now saved (false when removed). */
  toggle: (product: Product) => boolean;
}

const WishlistContext = createContext<WishlistValue | undefined>(undefined);

function load(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage blocked or full — wishlist stays in memory for this session.
    }
  }, [items]);

  const value = useMemo<WishlistValue>(() => {
    const saved = (id: string) => items.some((p) => p.id === id);
    return {
      items,
      count: items.length,
      has: saved,
      toggle: (product) => {
        const wasSaved = saved(product.id);
        setItems((prev) =>
          prev.some((p) => p.id === product.id)
            ? prev.filter((p) => p.id !== product.id)
            : [...prev, product],
        );
        return !wasSaved;
      },
    };
  }, [items]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
