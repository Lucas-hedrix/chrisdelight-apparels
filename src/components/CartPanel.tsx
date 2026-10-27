import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useUI } from '../context/UIContext';
import { fmt } from '../lib/format';
import PlaceholderImage from './PlaceholderImage';
import type { CartItem } from '../context/CartContext';

function CartThumb({ item }: { item: CartItem }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-card-2">
      {item.image && !failed ? (
        <img
          src={item.image}
          alt={item.name}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <PlaceholderImage />
      )}
    </div>
  );
}

function CartContent({ headerAction }: { headerAction: () => void }) {
  const { items, subtotal, shipping, total, setQty, removeItem, closeCart } = useCart();
  const { user } = useAuth();
  const { push } = useToast();
  const { currency } = useUI();
  const navigate = useNavigate();

  function handleCheckout() {
    if (items.length === 0) return;
    if (!user) {
      push({
        title: 'Sign in to checkout',
        message: 'Create an account or sign in first.',
        tone: 'error',
      });
      navigate('/auth');
      return;
    }
    closeCart();
    navigate('/checkout');
  }

  return (
    <>
      <div className="flex items-center justify-between border-b border-line px-5 py-5">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-2xl tracking-wide">MY CART</h2>
          {items.length > 0 && (
            <span className="rounded-full bg-brand px-2.5 py-0.5 text-xs font-extrabold text-ink">
              {items.reduce((s, i) => s + i.qty, 0)}
            </span>
          )}
        </div>
        <button
          onClick={headerAction}
          className="grid h-10 w-10 place-items-center rounded-full border border-line bg-card text-muted transition-colors hover:border-brand/50 hover:text-cream"
          aria-label="Close cart"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-card-2 text-muted">
            <ShoppingBag className="h-7 w-7" />
          </div>
          <h3 className="font-bold">Your cart is empty</h3>
          <p className="text-sm text-muted">Essentials are waiting — go grab something bold.</p>
          <button
            onClick={() => {
              closeCart();
              navigate('/');
            }}
            className="mt-2 rounded-full bg-brand px-6 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-brand-strong"
          >
            Browse Store
          </button>
        </div>
      ) : (
        <>
          <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.div
                  key={item.key}
                  layout
                  initial={{ opacity: 0, x: 32 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 32 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  className="rounded-2xl border border-line bg-card p-3"
                >
                  <div className="flex gap-3">
                    <CartThumb item={item} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="line-clamp-2 text-sm font-bold leading-snug">{item.name}</h4>
                        <button
                          onClick={() => removeItem(item.key)}
                          className="shrink-0 text-muted transition-colors hover:text-brand"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wider text-muted">
                        Size {item.size}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-display text-lg text-brand">
                          {fmt(item.price * item.qty, currency)}
                        </span>
                        <div className="flex items-center gap-3 rounded-full border border-line px-2.5 py-1">
                          <button
                            onClick={() => setQty(item.key, item.qty - 1)}
                            className="text-muted transition-colors hover:text-cream"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-4 text-center text-sm font-bold">{item.qty}</span>
                          <button
                            onClick={() => setQty(item.key, item.qty + 1)}
                            className="text-muted transition-colors hover:text-cream"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="border-t border-line px-5 py-5">
            <dl className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted">Sub Total</dt>
                <dd className="font-bold">{fmt(subtotal, currency)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted">Shipping</dt>
                <dd className="font-bold">
                  {shipping === 0 ? <span className="text-cream">FREE</span> : fmt(shipping, currency)}
                </dd>
              </div>
              <div className="flex items-center justify-between border-t border-line pt-3">
                <dt className="font-display text-lg tracking-wide">TOTAL</dt>
                <dd className="font-display text-2xl">{fmt(total, currency)}</dd>
              </div>
            </dl>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleCheckout}
              className="mt-4 w-full rounded-2xl bg-brand py-4 text-lg font-bold text-ink shadow-xl shadow-white/15 transition-colors hover:bg-brand-strong"
            >
              Checkout
            </motion.button>
          </div>
        </>
      )}
    </>
  );
}

function CollapsedRail() {
  const { count, setIsCollapsed, openCart } = useCart();

  return (
    <div className="flex h-screen w-19 flex-col items-center gap-4 border-l border-line bg-panel py-6">
      <button
        onClick={() => setIsCollapsed(false)}
        className="grid h-11 w-11 place-items-center rounded-full border border-line bg-card text-muted transition-colors hover:border-brand/50 hover:text-cream"
        aria-label="Expand cart"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => {
          setIsCollapsed(false);
          openCart();
        }}
        className="relative grid h-11 w-11 place-items-center rounded-full bg-brand text-ink shadow-lg shadow-white/15"
        aria-label="Open cart"
      >
        <ShoppingBag className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-cream px-1 text-[10px] font-extrabold text-ink">
            {count}
          </span>
        )}
      </button>
    </div>
  );
}

export default function CartPanel() {
  const { isCollapsed, setIsCollapsed, isOpen, closeCart, openCart, count } = useCart();

  return (
    <>
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 border-line bg-panel xl:block ${
          isCollapsed ? '' : 'w-95 border-l'
        }`}
      >
        {isCollapsed ? (
          <CollapsedRail />
        ) : (
          <div className="flex h-full w-95 flex-col">
            <CartContent headerAction={() => setIsCollapsed(true)} />
          </div>
        )}
      </aside>

      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            whileTap={{ scale: 0.92 }}
            onClick={openCart}
            className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-brand text-ink shadow-xl shadow-white/25 xl:hidden"
            aria-label="Open cart"
          >
            <ShoppingBag className="h-6 w-6" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-6 min-w-6 place-items-center rounded-full bg-cream px-1.5 text-xs font-extrabold text-ink">
                {count}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeCart}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm xl:hidden"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              className="fixed inset-y-0 right-0 z-50 flex w-[92vw] max-w-md flex-col border-l border-line bg-panel xl:hidden"
            >
              <CartContent headerAction={closeCart} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
