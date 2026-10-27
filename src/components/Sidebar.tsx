import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Home, LayoutDashboard, LifeBuoy, LogOut, ShoppingBag, Shirt, Store, Heart } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useUI } from '../context/UIContext';
import { useToast } from '../context/ToastContext';
import { friendlyError } from '../lib/errors';
import { isAdmin } from '../lib/appwrite';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: Home, to: '/' },
  { label: 'Collections', icon: Shirt, to: '/collections' },
  { label: 'Vendors', icon: Store, to: '/vendors' },
  { label: 'My Store', icon: Store, to: '/vendor' },
  { label: 'My Cart', icon: ShoppingBag },
  { label: 'Wishlist', icon: Heart, to: '/wishlist' },
  { label: 'Support', icon: LifeBuoy, to: '/support' },
];

function NavList({ onRequestLogout }: { onRequestLogout: () => void }) {
  const { user } = useAuth();
  const { count, openCart, setIsCollapsed } = useCart();
  const { count: wishCount } = useWishlist();
  const { setSidebarOpen } = useUI();

  const closeMobile = () => setSidebarOpen(false);

  const handleCartClick = () => {
    closeMobile();
    if (window.matchMedia('(min-width: 1280px)').matches) {
      setIsCollapsed(false);
    } else {
      openCart();
    }
  };

  return (
    <nav className="flex h-full flex-col">
      <div className="flex flex-col gap-1.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const badgeCount =
            item.label === 'My Cart' ? count : item.label === 'Wishlist' ? wishCount : 0;
          const inner = (
            <>
              <Icon className="h-5 w-5 shrink-0" />
              {item.label}
              {badgeCount > 0 && (
                <span className="ml-auto rounded-full bg-brand px-2 py-0.5 text-[11px] font-extrabold text-ink">
                  {badgeCount}
                </span>
              )}
            </>
          );
          const base =
            'flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors';

          if (item.to) {
            return (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.to === '/'}
                onClick={closeMobile}
                className={({ isActive }) =>
                  `${base} ${
                    isActive
                      ? 'bg-brand text-ink shadow-lg shadow-white/15'
                      : 'text-muted hover:bg-card hover:text-cream'
                  }`
                }
              >
                {inner}
              </NavLink>
            );
          }

          return (
            <button
              key={item.label}
              onClick={handleCartClick}
              className={`${base} text-muted hover:bg-card hover:text-cream`}
            >
              {inner}
            </button>
          );
        })}
      </div>

      <div className="mt-auto space-y-1">
        {isAdmin(user?.email) && (
          <NavLink
            to="/admin"
            onClick={closeMobile}
            className={({ isActive }) =>
              `flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-brand text-ink shadow-lg shadow-white/15'
                  : 'text-muted hover:bg-card hover:text-cream'
              }`
            }
          >
            <LayoutDashboard className="h-5 w-5" />
            Admin Panel
          </NavLink>
        )}
        {user ? (
          <button
            onClick={onRequestLogout}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-brand transition-colors hover:bg-brand/10"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        ) : null}
      </div>
    </nav>
  );
}

/* ── Sign-out confirmation modal ──────────────────────────────────────────── */

function SignOutModal({
  open,
  onCancel,
  onConfirm,
  busy,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  busy: boolean;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 z-100 bg-black/70 backdrop-blur-sm"
          />
          {/* Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed inset-0 z-101 flex items-center justify-center px-4"
          >
            <div className="w-full max-w-sm rounded-3xl border border-line bg-panel p-8 shadow-2xl shadow-black/60 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand/10 text-brand">
                <LogOut className="h-7 w-7" />
              </div>
              <h2 className="mt-5 font-display text-2xl tracking-wide">SIGN OUT</h2>
              <p className="mt-2 text-sm text-muted leading-relaxed">
                Are you sure you want to sign out? You&apos;ll need to log in again to access your account.
              </p>
              <div className="mt-7 flex gap-3">
                <button
                  onClick={onCancel}
                  disabled={busy}
                  className="flex-1 rounded-2xl border border-line bg-card py-3 text-sm font-bold text-cream transition-colors hover:bg-card-2 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={busy}
                  className="flex-1 rounded-2xl bg-brand py-3 text-sm font-bold text-ink shadow-lg shadow-white/15 transition-colors hover:bg-brand-strong disabled:opacity-50"
                >
                  {busy ? 'Signing out…' : 'Sign Out'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ── Sidebar ──────────────────────────────────────────────────────────────── */

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useUI();
  const { logout } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();

  const [showSignOut, setShowSignOut] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleConfirmLogout = async () => {
    setBusy(true);
    try {
      await logout();
      push({ title: 'Signed out', message: 'See you soon.' });
      setShowSignOut(false);
      setSidebarOpen(false);
      navigate('/');
    } catch (err) {
      push({ title: 'Sign out failed', message: friendlyError(err, 'Please try again.'), tone: 'error' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-panel px-5 py-7 lg:flex">
        <Logo />
        <div className="mt-10 flex-1 overflow-y-auto">
          <NavList onRequestLogout={() => setShowSignOut(true)} />
        </div>
      </aside>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-panel px-5 py-7 lg:hidden"
            >
              <Logo />
              <div className="mt-10 flex-1 overflow-y-auto">
                <NavList onRequestLogout={() => setShowSignOut(true)} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <SignOutModal
        open={showSignOut}
        onCancel={() => setShowSignOut(false)}
        onConfirm={handleConfirmLogout}
        busy={busy}
      />
    </>
  );
}

