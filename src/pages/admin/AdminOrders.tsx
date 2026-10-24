import { useCallback, useEffect, useState } from 'react';
import { Bitcoin, CreditCard, ExternalLink, RefreshCw } from 'lucide-react';
import { adminListOrders, adminUpdateOrderStatus } from '../../lib/admin';
import { isAppwriteConfigured } from '../../lib/appwrite';
import { evidenceFileUrl } from '../../lib/payments';
import { fmt } from '../../lib/format';
import { createOrderStatusNotification } from '../../lib/notifications';
import { METHOD_STYLE, STATUS_STYLE } from './AdminOverview';

const STATUSES = [
  'pending',
  'pending_approval',
  'paid',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'rejected',
];

const FALLBACK_STYLE = { bg: 'rgba(255,255,255,0.08)', color: '#9c9ca6' };

const FILTER_TABS = ['all', ...STATUSES];

function itemCount(o: any): number | null {
  try {
    const parsed = typeof o.items === 'string' ? JSON.parse(o.items) : o.items;
    return Array.isArray(parsed) ? parsed.length : null;
  } catch {
    return null;
  }
}

function MethodBadge({ method }: { method?: string }) {
  if (!method) return <span className="text-xs text-muted">—</span>;
  const crypto = method === 'crypto';
  const style = METHOD_STYLE[method] ?? FALLBACK_STYLE;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold capitalize"
      style={{ background: style.bg, color: style.color }}
    >
      {crypto ? <Bitcoin className="h-3 w-3" /> : <CreditCard className="h-3 w-3" />}
      {crypto ? 'Crypto' : 'Paystack'}
    </span>
  );
}

function EvidenceLink({ order }: { order: any }) {
  const url = evidenceFileUrl(order.evidenceFileId);
  if (order.method !== 'crypto' || !url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      title="View payment evidence"
      className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-line text-muted transition-colors hover:border-brand/50 hover:text-brand"
    >
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}

function ApprovalActions({
  order,
  busy,
  onDecide,
}: {
  order: any;
  busy: boolean;
  onDecide: (order: any, status: string) => void;
}) {
  if (busy) return <div className="h-7 w-32 animate-pulse rounded-full bg-card-2" />;
  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => onDecide(order, 'paid')}
        className="rounded-full bg-brand px-2.5 py-1 text-[11px] font-bold text-ink transition-opacity hover:opacity-85"
      >
        Approve
      </button>
      <button
        onClick={() => onDecide(order, 'rejected')}
        className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-bold text-muted transition-colors hover:bg-brand/15 hover:text-brand"
      >
        Reject
      </button>
    </div>
  );
}

function StatusSelect({
  value,
  onChange,
  busy,
}: {
  value?: string;
  onChange: (s: string) => void;
  busy: boolean;
}) {
  const style = STATUS_STYLE[value ?? 'pending'] ?? FALLBACK_STYLE;
  return busy ? (
    <div className="h-7 w-24 animate-pulse rounded-full bg-card-2" />
  ) : (
    <select
      value={value ?? 'pending'}
      onChange={(e) => onChange(e.target.value)}
      className="cursor-pointer appearance-none rounded-full border border-transparent px-3 py-1 text-xs font-bold capitalize outline-none transition-colors hover:border-line"
      style={{ background: style.bg, color: style.color }}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s} style={{ background: '#101010', color: '#f5f4f0' }}>
          {s.charAt(0).toUpperCase() + s.slice(1)}
        </option>
      ))}
    </select>
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isAppwriteConfigured) return;
    setLoading(true);
    setError(null);
    try {
      setOrders(await adminListOrders());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatusChange = async (order: any, status: string) => {
    setBusyId(order.$id);
    try {
      await adminUpdateOrderStatus(order.$id, status);
      setOrders((prev) => prev!.map((o) => (o.$id === order.$id ? { ...o, status } : o)));
      // Send notification to user about status change
      if (order.userId) {
        await createOrderStatusNotification(order.userId, order.$id, status);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  };

  const fmtDate = (iso: string) => {
    if (!iso) return '—';
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(iso));
  };

  const filtered = (orders ?? []).filter(
    (o) => filter === 'all' || (o.status ?? 'pending') === filter
  );

  if (!isAppwriteConfigured) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-card p-14 text-center">
        <p className="text-sm text-muted">Appwrite is not configured.</p>
      </div>
    );
  }

  return (
    <div>
      {/* ── Page header ── */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Orders</h1>
          <p className="mt-1 text-sm text-muted">
            {orders !== null ? `${orders.length} order${orders.length === 1 ? '' : 's'}` : 'Loading…'}
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-line bg-card px-4 py-2.5 text-sm font-semibold text-muted transition-colors hover:text-cream disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-brand">
          {error}
        </div>
      )}

      {/* ── Status filter tabs ── */}
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTER_TABS.map((tab) => {
          const count =
            tab === 'all'
              ? orders?.length
              : orders?.filter((o) => (o.status ?? 'pending') === tab).length;
          const active = filter === tab;
          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-semibold capitalize transition-all ${
                active
                  ? 'border-brand bg-brand/15 text-brand'
                  : 'border-line bg-card text-muted hover:border-brand/30 hover:text-cream'
              }`}
            >
              {tab.replace('_', ' ')}
              {count != null && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    active ? 'bg-brand/20 text-brand' : 'bg-card-2 text-muted'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Table ── */}
      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        {/* Column headers */}
        <div
          className="hidden border-b border-line bg-card-2 px-5 py-3 sm:grid"
          style={{ gridTemplateColumns: '90px 1fr 90px 55px 85px 150px 90px' }}
        >
          {['Order ID', 'Customer', 'Method', 'Items', 'Total', 'Status', 'Date'].map((h) => (
            <span key={h} className="text-[11px] font-bold uppercase tracking-wider text-muted">
              {h}
            </span>
          ))}
        </div>

        {/* Skeleton */}
        {orders === null && (
          <div className="divide-y divide-line">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="h-3 w-20 animate-pulse rounded bg-card-2" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-36 animate-pulse rounded bg-card-2" />
                  <div className="h-2.5 w-24 animate-pulse rounded bg-card-2" />
                </div>
                <div className="h-6 w-20 animate-pulse rounded-full bg-card-2" />
              </div>
            ))}
          </div>
        )}

        {/* Rows */}
        {orders !== null && (
          <div className="divide-y divide-line">
            {filtered.length === 0 ? (
              <div className="px-5 py-16 text-center">
                <p className="text-sm font-semibold">No orders found</p>
                <p className="mt-1 text-xs text-muted">
                  {filter === 'all'
                    ? 'Orders will appear here once customers start buying.'
                    : `No ${filter.replace('_', ' ')} orders.`}
                </p>
              </div>
            ) : (
              filtered.map((o) => (
                <div key={o.$id}>
                  {/* Desktop row */}
                  <div
                    className="hidden items-center gap-3 px-5 py-4 transition-colors hover:bg-card-2/40 sm:grid"
                    style={{ gridTemplateColumns: '90px 1fr 90px 55px 85px 150px 90px' }}
                  >
                    <code className="font-mono text-xs font-semibold text-muted">
                      #{o.$id.slice(-6).toUpperCase()}
                    </code>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {o.userName || o.userEmail || 'Guest'}
                      </p>
                      <p className="truncate text-xs text-muted">{o.userEmail ?? '—'}</p>
                    </div>
                    <MethodBadge method={o.method} />
                    <span className="text-sm text-muted">{itemCount(o) ?? '—'}</span>
                    <span className="text-sm font-semibold">{fmt(o.total ?? 0)}</span>
                    {(o.status ?? 'pending') === 'pending_approval' ? (
                      <ApprovalActions order={o} busy={busyId === o.$id} onDecide={handleStatusChange} />
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <StatusSelect
                          value={o.status}
                          busy={busyId === o.$id}
                          onChange={(s) => handleStatusChange(o, s)}
                        />
                        <EvidenceLink order={o} />
                      </div>
                    )}
                    <span className="text-xs text-muted">{fmtDate(o.$createdAt)}</span>
                  </div>

                  {/* Mobile row */}
                  <div className="flex items-start gap-3 px-5 py-4 transition-colors hover:bg-card-2/40 sm:hidden">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-xs text-muted">
                          #{o.$id.slice(-6).toUpperCase()}
                        </code>
                        <span className="text-xs text-muted">·</span>
                        <span className="text-xs text-muted">{fmtDate(o.$createdAt)}</span>
                      </div>
                      <p className="mt-0.5 text-sm font-medium">
                        {o.userName || o.userEmail || 'Guest'}
                      </p>
                      <p className="text-xs text-muted">{o.userEmail ?? '—'}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <MethodBadge method={o.method} />
                        <span className="text-xs text-muted">
                          {itemCount(o) ?? '—'} item{(itemCount(o) ?? 0) === 1 ? '' : 's'}
                        </span>
                        <span className="text-sm font-semibold">{fmt(o.total ?? 0)}</span>
                      </div>
                      {(o.status ?? 'pending') === 'pending_approval' ? (
                        <div className="mt-2">
                          <ApprovalActions
                            order={o}
                            busy={busyId === o.$id}
                            onDecide={handleStatusChange}
                          />
                        </div>
                      ) : (
                        <div className="mt-2 flex items-center gap-1.5">
                          <StatusSelect
                            value={o.status}
                            busy={busyId === o.$id}
                            onChange={(s) => handleStatusChange(o, s)}
                          />
                          <EvidenceLink order={o} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
