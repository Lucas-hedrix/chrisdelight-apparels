import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bitcoin,
  CreditCard,
  Hourglass,
  Package,
  ShoppingBag,
  TrendingUp,
  Star,
  Store,
  ShieldCheck,
} from 'lucide-react';
import { adminListProducts, adminListOrders } from '../../lib/admin';
import { adminListPayments, adminListVendors } from '../../lib/adminVendors';
import { isAppwriteConfigured } from '../../lib/appwrite';
import { fmt } from '../../lib/format';
import { isNewArrival } from '../../lib/products';

const PAID_STATUSES = new Set(['paid', 'processing', 'shipped', 'delivered']);

export const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  pending: { bg: 'rgba(255,255,255,0.08)', color: '#a1a1aa' },
  pending_approval: { bg: 'rgba(255,255,255,0.16)', color: '#f5f4f0' },
  paid: { bg: 'rgba(255,255,255,0.65)', color: '#0a0a0a' },
  processing: { bg: 'rgba(255,255,255,0.22)', color: '#ffffff' },
  shipped: { bg: 'rgba(255,255,255,0.30)', color: '#ffffff' },
  delivered: { bg: 'rgba(255,255,255,0.92)', color: '#0a0a0a' },
  cancelled: { bg: 'rgba(255,255,255,0.05)', color: '#737378' },
  rejected: { bg: 'rgba(255,255,255,0.05)', color: '#9c9ca6' },
};

export const METHOD_STYLE: Record<string, { bg: string; color: string }> = {
  paystack: { bg: 'rgba(255,255,255,0.12)', color: '#e5e5e5' },
  crypto: { bg: 'rgba(255,255,255,0.24)', color: '#ffffff' },
};

function StatCard({
  icon: Icon,
  label,
  value,
  iconBg,
  iconColor,
  loading,
}: {
  icon: typeof Package;
  label: string;
  value: string | number;
  iconBg: string;
  iconColor: string;
  loading: boolean;
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-line bg-card p-6">
      <div
        className="grid h-12 w-12 shrink-0 place-items-center rounded-xl"
        style={{ background: iconBg }}
      >
        <Icon className="h-5 w-5" style={{ color: iconColor }} />
      </div>
      <div>
        <p className="text-sm text-muted">{label}</p>
        {loading ? (
          <div className="mt-1.5 h-7 w-20 animate-pulse rounded-lg bg-card-2" />
        ) : (
          <p className="mt-0.5 text-3xl font-extrabold tracking-tight">{value}</p>
        )}
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5">
      <div className="h-8 w-8 shrink-0 animate-pulse rounded-lg bg-card-2" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-36 animate-pulse rounded bg-card-2" />
        <div className="h-2.5 w-24 animate-pulse rounded bg-card-2" />
      </div>
      <div className="h-3 w-16 animate-pulse rounded bg-card-2" />
    </div>
  );
}

export default function AdminOverview() {
  const [products, setProducts] = useState<any[] | null>(null);
  const [orders, setOrders] = useState<any[] | null>(null);
  const [vendors, setVendors] = useState<any[] | null>(null);
  const [vendorPayments, setVendorPayments] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAppwriteConfigured) return;
    Promise.all([
      adminListProducts().catch(() => []),
      adminListOrders().catch(() => []),
      adminListVendors().catch(() => null),
      adminListPayments().catch(() => null),
    ])
      .then(([p, o, v, vp]) => {
        setProducts(p);
        setOrders(o);
        setVendors(v);
        setVendorPayments(vp);
      })
      .catch((e) => setError(e.message));
  }, []);

  if (!isAppwriteConfigured) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-card p-14 text-center">
        <p className="text-sm text-muted">
          Appwrite is not configured. Add your keys to{' '}
          <code className="rounded bg-card-2 px-1.5 py-0.5 text-brand">.env</code> and restart the
          dev server.
        </p>
      </div>
    );
  }

  const loading = products === null && orders === null && !error;
  const newArrivals = products?.filter((p) => isNewArrival({
    id: p.$id,
    name: p.name,
    category: p.category,
    price: Number(p.price ?? 0),
    image: p.image ?? null,
    availableSizes: [],
    availableColors: [],
    newArrivalExpiresAt: p.newArrivalExpiresAt ?? null,
  })).length ?? 0;
  const revenue =
    orders?.reduce(
      (s, o) => s + (PAID_STATUSES.has(o.status ?? 'pending') ? Number(o.total) || 0 : 0),
      0
    ) ?? 0;
  const awaiting =
    orders?.filter((o) => (o.status ?? 'pending') === 'pending_approval').length ?? 0;
  const pendingVendorPayments =
    vendorPayments?.filter((p) => p.status === 'pending').length ?? 0;

  return (
    <div>
      {/* Page title */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-muted">Your store at a glance</p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-brand">
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          icon={Package}
          label="Total Products"
          value={products?.length ?? '—'}
          iconBg="rgba(255,255,255,0.12)"
          iconColor="#ffffff"
          loading={loading}
        />
        <StatCard
          icon={Star}
          label="New Arrivals"
          value={newArrivals || '—'}
          iconBg="rgba(255,255,255,0.20)"
          iconColor="#ffffff"
          loading={loading}
        />
        <StatCard
          icon={ShoppingBag}
          label="Total Orders"
          value={orders?.length ?? '—'}
          iconBg="rgba(255,255,255,0.07)"
          iconColor="#d4d4d8"
          loading={loading}
        />
        <StatCard
          icon={TrendingUp}
          label="Paid Revenue"
          value={revenue ? fmt(revenue) : '—'}
          iconBg="rgba(255,255,255,0.16)"
          iconColor="#ffffff"
          loading={loading}
        />
        <StatCard
          icon={Hourglass}
          label="Awaiting Approval"
          value={awaiting || '—'}
          iconBg="rgba(255,255,255,0.10)"
          iconColor="#e5e5e5"
          loading={loading}
        />
        <StatCard
          icon={Store}
          label="Vendor Stores"
          value={vendors ? vendors.length : '—'}
          iconBg="rgba(255,255,255,0.12)"
          iconColor="#ffffff"
          loading={loading}
        />
        <StatCard
          icon={ShieldCheck}
          label="Vendor Payments to Verify"
          value={vendorPayments ? pendingVendorPayments : '—'}
          iconBg="rgba(255,255,255,0.16)"
          iconColor="#ffffff"
          loading={loading}
        />
      </div>

      {/* Recent panels */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Recent Products */}
        <div className="overflow-hidden rounded-2xl border border-line bg-card">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-semibold">Recent Products</h2>
            <Link to="/admin/products" className="text-xs text-brand hover:underline">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-line">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
              : products?.length
                ? products.slice(0, 6).map((p) => (
                    <div
                      key={p.$id}
                      className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-card-2/40"
                    >
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-card-2 text-[10px] font-extrabold uppercase text-muted">
                        {(p.subCategory || p.category || '?').slice(0, 3)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-muted">{p.subCategory || p.category || '—'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{fmt(p.price)}</p>
                        {p.salePrice != null && p.salePrice !== '' && (
                          <p className="text-xs text-brand">{fmt(Number(p.salePrice))}</p>
                        )}
                      </div>
                    </div>
                  ))
                : <p className="px-5 py-8 text-center text-sm text-muted">No products yet.</p>}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="overflow-hidden rounded-2xl border border-line bg-card">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-semibold">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs text-brand hover:underline">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-line">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
              : orders?.length
                ? orders.slice(0, 6).map((o) => {
                    const style =
                      STATUS_STYLE[o.status] ?? { bg: 'rgba(255,255,255,0.08)', color: '#9c9ca6' };
                    const methodStyle =
                      METHOD_STYLE[o.method] ?? { bg: 'rgba(255,255,255,0.08)', color: '#9c9ca6' };
                    return (
                      <div
                        key={o.$id}
                        className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-card-2/40"
                      >
                        <div>
                          <p className="font-mono text-sm font-semibold">
                            #{o.$id.slice(-6).toUpperCase()}
                          </p>
                          <p className="text-xs text-muted">{o.userName || o.userEmail || 'Guest'}</p>
                        </div>
                        <div className="ml-auto flex items-center gap-2.5">
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold capitalize"
                            style={{ background: methodStyle.bg, color: methodStyle.color }}
                          >
                            {o.method === 'crypto' ? (
                              <Bitcoin className="h-3 w-3" />
                            ) : (
                              <CreditCard className="h-3 w-3" />
                            )}
                            {o.method ?? 'paystack'}
                          </span>
                          <p className="text-sm font-semibold">{fmt(o.total ?? 0)}</p>
                          <span
                            className="rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize"
                            style={{ background: style.bg, color: style.color }}
                          >
                            {(o.status ?? 'pending').replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    );
                  })
                : <p className="px-5 py-8 text-center text-sm text-muted">No orders yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
