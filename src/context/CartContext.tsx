import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Product } from '../lib/products';

export interface CartItem {
  key: string;
  productId: string;
  name: string;
  category: string;
  image: string | null;
  size: string;
  color: string;
  price: number;
  qty: number;
}

interface CartValue {
  items: CartItem[];
  addItem: (product: Product, size: string) => void;
  removeItem: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
  subtotal: number;
  shipping: number;
  total: number;
  count: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
}

const CartContext = createContext<CartValue | null>(null);
export const useCart = () => useContext(CartContext)!;

const STORAGE_KEY = 'cybernexus.cart.v1';
const FREE_SHIPPING_THRESHOLD = 200000;
const SHIPPING_FLAT = 2500;

function load(): CartItem[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(load);
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable */
    }
  }, [items]);

  const addItem = useCallback((product: Product, size: string) => {
    const key = `${product.id}:${size}`;
    const price = product.salePrice ?? product.price;
    setItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) => (i.key === key ? { ...i, qty: i.qty + 1 } : i));
      }
      return [
        ...prev,
        {
          key,
          productId: product.id,
          name: product.name,
          category: product.category,
          image: product.image,
          size,
          color: product.availableColors[0] ?? '',
          price,
          qty: 1,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.key !== key)
        : prev.map((i) => (i.key === key ? { ...i, qty } : i))
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const { subtotal, shipping, total, count } = useMemo(() => {
    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
    return {
      subtotal,
      shipping,
      total: subtotal + shipping,
      count: items.reduce((sum, i) => sum + i.qty, 0),
    };
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        setQty,
        clear,
        subtotal,
        shipping,
        total,
        count,
        isOpen,
        openCart,
        closeCart,
        isCollapsed,
        setIsCollapsed,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
