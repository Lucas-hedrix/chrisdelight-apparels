import { useState } from 'react';
import { Link, NavLink, Navigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, Package, Tags, ShoppingBag, Store, Menu, X, ShieldX } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isAdmin } from '../../lib/appwrite';

const NAV = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: Tags },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/vendors', label: 'Vendors', icon: Store },
];

export default function AdminLayout() {
  const { user, ready } = useAuth();
  const [open, setOpen] = useState(false);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  if (!isAdmin(user.email)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ink px-6 text-center text-cream">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand/10">
          <ShieldX className="h-8 w-8 text-brand" />
        </div>
        <h1 className="text-2xl font-extrabold">Access Denied</h1>
        <p className="max-w-sm text-sm text-muted">
          Your account doesn&apos;t have admin privileges. If you believe this is a mistake, contact
          the store owner.
        </p>
        <Link
          to="/"
          className="mt-2 rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-ink shadow-lg shadow-white/15 transition-opacity hover:opacity-90"
        >
          Back to Store
        </Link>
      </div>
    );
  }

  const initial = (user.name || user.email || 'A').charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen bg-ink text-cream">
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed top-0 left-0 z-50 flex h-full w-64 shrink-0 flex-col border-r border-line bg-panel transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand text-ink shadow-lg shadow-white/15">
              <LayoutDashboard className="h-5 w-5" strokeWidth={2.5} />
            </span>
            <div>
              <p className="text-xs font-black uppercase leading-none tracking-[0.18em] text-cream">
                Cybernexus
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-brand">
                Admin
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="grid h-7 w-7 place-items-center rounded-lg text-muted transition-colors hover:text-cream lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 p-3 pt-4">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                  isActive ? 'bg-brand/15 text-brand' : 'text-muted hover:bg-card hover:text-cream'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-line p-3">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-card hover:text-cream"
          >
            <Store className="h-4 w-4 shrink-0" />
            Back to Storefront
          </Link>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile topbar */}
        <header className="flex items-center gap-3 border-b border-line bg-panel px-5 py-3.5 lg:hidden">
          <button
            onClick={() => setOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-xl border border-line bg-card"
            aria-label="Open admin menu"
          >
            <Menu className="h-4 w-4" />
          </button>
          <span className="text-sm font-bold tracking-wide">Admin Panel</span>
          <div className="ml-auto grid h-8 w-8 place-items-center rounded-full bg-brand text-xs font-extrabold text-ink">
            {initial}
          </div>
        </header>

        {/* Desktop topbar */}
        <header className="hidden items-center justify-end gap-3 border-b border-line bg-panel px-8 py-3.5 lg:flex">
          <div className="text-right">
            <p className="text-sm font-semibold leading-none">{user.name || 'Admin'}</p>
            <p className="mt-0.5 text-xs text-muted">{user.email}</p>
          </div>
          <div className="grid h-9 w-9 place-items-center rounded-full bg-brand text-sm font-extrabold text-ink shadow-md shadow-white/15">
            {initial}
          </div>
        </header>

        <main className="flex-1 overflow-auto p-5 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
