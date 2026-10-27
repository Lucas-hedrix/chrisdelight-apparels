import { useCallback, useEffect, useState } from 'react';
import {
  BadgeCheck,
  Check,
  CircleDollarSign,
  ExternalLink,
  Loader2,
  Megaphone,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from 'lucide-react';
import {
  adminFeature,
  adminListCommissions,
  adminListPayments,
  adminListPromotions,
  adminListVendors,
  adminRecordCommission,
  adminSetCommissionStatus,
  adminSetVendorPlan,
  adminSetVendorStatus,
  adminUnfeature,
  adminVerifyPayment,
  type AdminCommission,
  type AdminPayment,
  type AdminPromotion,
  type AdminVendor,
} from '../../lib/adminVendors';
import { getMarketVendorProducts, type MarketVendorProduct } from '../../lib/vendors';
import { fmt } from '../../lib/format';
import { friendlyError, logError } from '../../lib/errors';
import { useToast } from '../../context/ToastContext';

const inputCls =
  'w-full rounded-xl border border-line bg-ink px-4 py-2.5 text-sm text-cream ' +
  'placeholder:text-muted outline-none transition-colors focus:border-brand/50';

type Tab = 'stores' | 'payments' | 'commissions' | 'featuring';

const CHIP: Record<string, string> = {
  active: 'bg-white/70 text-ink',
  verified: 'bg-white/70 text-ink',
  settled: 'bg-white/40 text-ink',
  paid: 'bg-white/40 text-ink',
  pending: 'bg-white/10 text-zinc-400',
  pending_verification: 'bg-white/10 text-zinc-400',
  rejected: 'bg-white/5 text-zinc-500',
  disputed: 'bg-white/20 text-white',
  suspended: 'bg-white/5 text-zinc-500',
  expired: 'bg-white/20 text-white',
  none: 'bg-white/10 text-zinc-400',
  not_applicable: 'bg-white/10 text-zinc-400',
  overdue: 'bg-white/20 text-white',
};

function Chip({ status }: { status: string }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${CHIP[status] ?? CHIP.pending}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

export default function AdminVendors() {
  const [tab, setTab] = useState<Tab>('stores');
  const [vendors, setVendors] = useState<AdminVendor[] | null>(null);
  const [payments, setPayments] = useState<AdminPayment[] | null>(null);
  const [commissions, setCommissions] = useState<AdminCommission[] | null>(null);
  const [promotions, setPromotions] = useState<AdminPromotion[] | null>(null);
  const [manage, setManage] = useState<AdminVendor | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { push } = useToast();

  const load = useCallback(async () => {
    setError(null);
    try {
      const [v, p, c, f] = await Promise.all([
        adminListVendors(),
        adminListPayments().catch(() => []),
        adminListCommissions().catch(() => []),
        adminListPromotions().catch(() => []),
      ]);
      setVendors(v);
      setPayments(p);
      setCommissions(c);
      setPromotions(f);
    } catch (e: any) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const guard = (fn: () => Promise<unknown>, okMessage: string) =>
    async () => {
      try {
        await fn();
        push({ title: okMessage });
        await load();
      } catch (e: any) {
        logError(e);
        push({ title: 'Action failed', message: friendlyError(e), tone: 'error' });
      }
    };

  const pendingPayments = payments?.filter((p) => p.status === 'pending') ?? [];
  const pendingCommissions = commissions?.filter((c) => c.status === 'pending') ?? [];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Vendors</h1>
          <p className="mt-1 text-sm text-muted">
            Stores, subscriptions, commissions and featuring
          </p>
        </div>
        <button
          onClick={load}
          className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-card text-muted transition-colors hover:text-cream"
          title="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-brand">
          {error}
        </div>
      )}

      <div className="mb-5 flex gap-2 overflow-x-auto">
        {(
          [
            ['stores', `Stores${vendors ? ` (${vendors.length})` : ''}`],
            ['payments', `Payments${pendingPayments.length ? ` (${pendingPayments.length})` : ''}`],
            ['commissions', `Commissions${pendingCommissions.length ? ` (${pendingCommissions.length})` : ''}`],
            ['featuring', 'Featuring'],
          ] as [Tab, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              tab === id ? 'bg-brand/15 text-brand' : 'text-muted hover:bg-card hover:text-cream'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'stores' && (
        <StoresTab
          vendors={vendors}
          onManage={setManage}
          onStatus={(v, status) =>
            guard(() => adminSetVendorStatus(v.vendorId, status), `${v.businessName} is now ${status}`)
          }
          onFeatureToggle={(v) => {
            const existing = (promotions ?? []).find(
              (p) => p.vendorId === v.vendorId && p.kind === 'vendor'
            );
            return guard(
              () => (existing ? adminUnfeature(existing.$id) : adminFeature(v.vendorId)),
              existing ? `${v.businessName} removed from featuring` : `${v.businessName} is now featured`
            );
          }}
        />
      )}

      {tab === 'payments' && (
        <PaymentsTab
          payments={payments}
          onVerify={(p, decision) =>
            guard(() => adminVerifyPayment(p.$id, decision), decision === 'verified' ? 'Payment verified — plan activated' : 'Payment rejected')
          }
        />
      )}

      {tab === 'commissions' && (
        <CommissionsTab
          commissions={commissions}
          vendors={vendors}
          onStatus={(c, status) => guard(() => adminSetCommissionStatus(c.$id, status), `Record marked ${status}`)}
          reload={load}
        />
      )}

      {tab === 'featuring' && (
        <FeaturingTab
          promotions={promotions}
          vendors={vendors ?? []}
          onRemove={(p) => guard(() => adminUnfeature(p.$id), 'Promotion removed')}
          reload={load}
        />
      )}

      {manage && (
        <ManageVendorModal
          vendor={manage}
          onClose={() => setManage(null)}
          onSaved={async (msg) => {
            setManage(null);
            push({ title: msg });
            await load();
          }}
        />
      )}
    </div>
  );
}

// ── Stores ───────────────────────────────────────────────────────────────────
function StoresTab({
  vendors,
  onManage,
  onStatus,
  onFeatureToggle,
}: {
  vendors: AdminVendor[] | null;
  onManage: (v: AdminVendor) => void;
  onStatus: (v: AdminVendor, status: 'pending' | 'active' | 'suspended') => void;
  onFeatureToggle: (v: AdminVendor) => void;
}) {
  if (vendors === null) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl border border-line bg-card" />
        ))}
      </div>
    );
  }
  if (vendors.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-card px-5 py-14 text-center text-sm text-muted">
        No vendor registrations yet.
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-card">
      <div className="divide-y divide-line">
        {vendors.map((v) => (
          <div key={v.vendorId} className="flex flex-wrap items-center gap-4 px-5 py-4">
            {v.logoUrl ? (
              <img src={v.logoUrl} alt="" className="h-11 w-11 shrink-0 rounded-xl border border-line object-cover" />
            ) : (
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-card-2 text-sm font-extrabold text-muted">
                {v.businessName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 truncate text-sm font-semibold">
                {v.businessName}
                {v.featured && <BadgeCheck className="h-4 w-4 shrink-0 text-brand" aria-label="Featured" />}
              </p>
              <p className="truncate text-xs text-muted">
                /vendors/{v.slug} · {v.whatsapp}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg border border-line px-2.5 py-1 text-xs font-semibold capitalize text-muted">
                {v.plan}
              </span>
              <Chip status={v.liveStatus} />
              <Chip status={v.paymentStatus} />
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              {v.liveStatus === 'pending' && (
                <button
                  onClick={() => onStatus(v, 'active')}
                  title="Approve"
                  className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-brand/40 hover:text-brand"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
              )}
              {v.status === 'active' && (
                <button
                  onClick={() => onStatus(v, 'suspended')}
                  title="Suspend"
                  className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-brand/40 hover:text-brand"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              {v.status === 'suspended' && (
                <button
                  onClick={() => onStatus(v, 'active')}
                  title="Reactivate"
                  className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-brand/40 hover:text-brand"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={() => onFeatureToggle(v)}
                title={v.featured ? 'Unfeature vendor' : 'Feature vendor'}
                className={`grid h-8 w-8 place-items-center rounded-lg border transition-colors ${
                  v.featured
                    ? 'border-brand/60 bg-brand/15 text-brand'
                    : 'border-line text-muted hover:border-brand/40 hover:text-cream'
                }`}
              >
                <BadgeCheck className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onManage(v)}
                title="Manage plan & terms"
                className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-brand/40 hover:text-cream"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <a
                href={`/vendors/${v.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                title="View storefront"
                className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-brand/40 hover:text-cream"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Payments ─────────────────────────────────────────────────────────────────
function PaymentsTab({
  payments,
  onVerify,
}: {
  payments: AdminPayment[] | null;
  onVerify: (p: AdminPayment, decision: 'verified' | 'rejected') => void;
}) {
  if (payments === null) {
    return <div className="h-40 animate-pulse rounded-2xl border border-line bg-card" />;
  }
  if (payments.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-card px-5 py-14 text-center text-sm text-muted">
        No subscription payments yet.
      </div>
    );
  }
  const sorted = [...payments].sort((a, b) => {
    if ((a.status === 'pending') !== (b.status === 'pending')) return a.status === 'pending' ? -1 : 1;
    return String(b.$createdAt).localeCompare(String(a.$createdAt));
  });
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-card">
      <div className="divide-y divide-line">
        {sorted.map((p) => (
          <div key={p.$id} className="flex flex-wrap items-center gap-4 px-5 py-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">
                {p.businessName} · <span className="capitalize">{p.plan} plan</span> · {fmt(p.amount)}
              </p>
              <p className="truncate text-xs text-muted">
                Ref {p.reference} · {new Date(p.$createdAt).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <Chip status={p.status} />
            {p.status === 'pending' ? (
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  onClick={() => onVerify(p, 'verified')}
                  className="rounded-lg bg-brand px-3.5 py-2 text-xs font-bold text-ink transition-opacity hover:opacity-90"
                >
                  Verify & activate
                </button>
                <button
                  onClick={() => onVerify(p, 'rejected')}
                  className="rounded-lg border border-line px-3.5 py-2 text-xs font-bold text-muted transition-colors hover:text-cream"
                >
                  Reject
                </button>
              </div>
            ) : (
              <span className="w-24 shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Commissions ──────────────────────────────────────────────────────────────
function CommissionsTab({
  commissions,
  vendors,
  onStatus,
  reload,
}: {
  commissions: AdminCommission[] | null;
  vendors: AdminVendor[] | null;
  onStatus: (c: AdminCommission, status: 'pending' | 'settled' | 'disputed') => void;
  reload: () => Promise<void>;
}) {
  const { push } = useToast();
  const [vendorId, setVendorId] = useState('');
  const [reference, setReference] = useState('');
  const [saleAmount, setSaleAmount] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const commissionVendors = (vendors ?? []).filter((v) => v.plan === 'commission' && v.commissionRate != null);

  async function record(e: React.FormEvent) {
    e.preventDefault();
    if (!vendorId || !reference.trim() || !saleAmount) return;
    setSaving(true);
    try {
      await adminRecordCommission(vendorId, reference.trim(), Number(saleAmount), note.trim() || undefined);
      push({ title: 'Commission recorded' });
      setReference('');
      setSaleAmount('');
      setNote('');
      await reload();
    } catch (err: any) {
      logError(err);
      push({ title: "Couldn't record commission", message: friendlyError(err), tone: 'error' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={record} className="rounded-2xl border border-line bg-card p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold">
          <CircleDollarSign className="h-4 w-4 text-brand" />
          Record a qualifying sale
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <select value={vendorId} onChange={(e) => setVendorId(e.target.value)} className={inputCls} style={{ background: '#0a0a0a' }}>
            <option value="">Select commission partner…</option>
            {commissionVendors.map((v) => (
              <option key={v.vendorId} value={v.vendorId}>
                {v.businessName} ({v.commissionRate}%)
              </option>
            ))}
          </select>
          <input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Sale reference" className={inputCls} />
          <input value={saleAmount} onChange={(e) => setSaleAmount(e.target.value)} type="number" min="0" step="0.01" placeholder="Sale amount (₦)" className={inputCls} />
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)" className={inputCls} />
        </div>
        <button
          type="submit"
          disabled={saving || !vendorId || !reference.trim() || !saleAmount}
          className="mt-4 flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-ink transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Record sale
        </button>
        {commissionVendors.length === 0 && vendors !== null && (
          <p className="mt-3 text-xs text-muted">
            No commission partners with an agreed rate yet — set a commission rate in a vendor's plan
            settings first.
          </p>
        )}
      </form>

      {commissions === null ? (
        <div className="h-40 animate-pulse rounded-2xl border border-line bg-card" />
      ) : commissions.length === 0 ? (
        <div className="rounded-2xl border border-line bg-card px-5 py-14 text-center text-sm text-muted">
          No commission records yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-card">
          <div className="divide-y divide-line">
            {commissions.map((c) => (
              <div key={c.$id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">
                    {c.businessName} · {fmt(c.commissionAmount)}{' '}
                    <span className="font-normal text-muted">on a {fmt(c.saleAmount)} sale ({c.rate}%)</span>
                  </p>
                  <p className="truncate text-xs text-muted">
                    Ref {c.reference} · {new Date(c.$createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {c.note ? ` · ${c.note}` : ''}
                  </p>
                </div>
                <Chip status={c.status} />
                {c.status === 'pending' && (
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      onClick={() => onStatus(c, 'settled')}
                      className="rounded-lg bg-brand px-3.5 py-2 text-xs font-bold text-ink transition-opacity hover:opacity-90"
                    >
                      Mark settled
                    </button>
                    <button
                      onClick={() => onStatus(c, 'disputed')}
                      className="rounded-lg border border-line px-3.5 py-2 text-xs font-bold text-muted transition-colors hover:text-cream"
                    >
                      Dispute
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Featuring ────────────────────────────────────────────────────────────────
function FeaturingTab({
  promotions,
  vendors,
  onRemove,
  reload,
}: {
  promotions: AdminPromotion[] | null;
  vendors: AdminVendor[];
  onRemove: (p: AdminPromotion) => void;
  reload: () => Promise<void>;
}) {
  const { push } = useToast();
  const [vendorId, setVendorId] = useState('');
  const [productId, setProductId] = useState('');
  const [note, setNote] = useState('');
  const [products, setProducts] = useState<MarketVendorProduct[] | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!vendorId) {
      setProducts(null);
      setProductId('');
      return;
    }
    const vendor = vendors.find((v) => v.vendorId === vendorId);
    setProducts(null);
    setProductId('');
    if (vendor) {
      getMarketVendorProducts(vendor.slug)
        .then((r) => setProducts(r.products))
        .catch(() => setProducts([]));
    }
  }, [vendorId, vendors]);

  async function feature(e: React.FormEvent) {
    e.preventDefault();
    if (!vendorId) return;
    setSaving(true);
    try {
      await adminFeature(vendorId, productId || undefined, note.trim() || undefined);
      push({ title: 'Now featuring', message: 'It appears across the marketplace free of charge.' });
      setNote('');
      await reload();
    } catch (err: any) {
      logError(err);
      push({ title: "Couldn't feature", message: friendlyError(err), tone: 'error' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={feature} className="rounded-2xl border border-line bg-card p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold">
          <Megaphone className="h-4 w-4 text-brand" />
          Feature a vendor or product
        </h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <select value={vendorId} onChange={(e) => setVendorId(e.target.value)} className={inputCls} style={{ background: '#0a0a0a' }}>
            <option value="">Select vendor…</option>
            {vendors.map((v) => (
              <option key={v.vendorId} value={v.vendorId}>
                {v.businessName}
              </option>
            ))}
          </select>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className={inputCls}
            style={{ background: '#0a0a0a' }}
            disabled={!products || products.length === 0}
          >
            <option value="">Whole store{products?.length ? ' (or pick a product…)' : ''}</option>
            {(products ?? []).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)" className={inputCls} />
        </div>
        <button
          type="submit"
          disabled={saving || !vendorId}
          className="mt-4 flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-ink transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeCheck className="h-4 w-4" />}
          Feature
        </button>
      </form>

      {promotions === null ? (
        <div className="h-40 animate-pulse rounded-2xl border border-line bg-card" />
      ) : promotions.length === 0 ? (
        <div className="rounded-2xl border border-line bg-card px-5 py-14 text-center text-sm text-muted">
          Nothing is being featured right now.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-card">
          <div className="divide-y divide-line">
            {promotions.map((p) => (
              <div key={p.$id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">
                    {p.businessName} · <span className="capitalize text-muted">{p.kind === 'product' ? 'One product' : 'Whole store'}</span>
                  </p>
                  <p className="truncate text-xs text-muted">
                    {p.note ? `${p.note} · ` : ''}
                    since {new Date(p.$createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <button
                  onClick={() => onRemove(p)}
                  title="Remove"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-brand/40 hover:text-brand"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Manage vendor modal ──────────────────────────────────────────────────────
function ManageVendorModal({
  vendor,
  onClose,
  onSaved,
}: {
  vendor: AdminVendor;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const [plan, setPlan] = useState(vendor.plan);
  const [extendMonths, setExtendMonths] = useState(1);
  const [paymentStatus, setPaymentStatus] = useState(vendor.paymentStatus);
  const [commissionRate, setCommissionRate] = useState(
    vendor.commissionRate != null ? String(vendor.commissionRate) : ''
  );
  const [commissionTerms, setCommissionTerms] = useState(vendor.commissionTerms ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const body: Record<string, unknown> = { paymentStatus };
      if (plan !== vendor.plan) {
        body.plan = plan;
        body.extendMonths = plan === 'commission' ? 0 : extendMonths;
      } else if (plan !== 'commission') {
        body.extendMonths = extendMonths;
      }
      if (plan === 'commission' || vendor.plan === 'commission') {
        if (commissionRate !== '') body.commissionRate = Number(commissionRate);
        body.commissionTerms = commissionTerms;
      }
      await adminSetVendorPlan(vendor.vendorId, body);
      onSaved(`${vendor.businessName}'s plan updated`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-line bg-panel shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="text-lg font-bold">Manage {vendor.businessName}</h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:bg-card hover:text-cream">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
          <form onSubmit={save} className="space-y-5 p-6">
            {error && (
              <div className="rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-brand">{error}</div>
            )}

            <div className="rounded-xl border border-line bg-card p-4 text-xs leading-relaxed text-muted">
              <p>Status: <span className="font-bold capitalize text-cream">{vendor.liveStatus}</span></p>
              <p className="mt-1">
                Plan: <span className="font-bold capitalize text-cream">{vendor.plan}</span>
                {vendor.planExpiresAt && (
                  <>
                    {' '}· expires{' '}
                    <span className="font-bold text-cream">
                      {new Date(vendor.planExpiresAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </>
                )}
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-muted">Plan</label>
              <select value={plan} onChange={(e) => setPlan(e.target.value)} className={inputCls} style={{ background: '#0a0a0a' }}>
                <option value="starter">Starter</option>
                <option value="business">Business</option>
                <option value="commission">Commission partner</option>
              </select>
              {plan !== 'commission' && (
                <div className="mt-2">
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-muted">
                    {plan === vendor.plan ? 'Extend by' : 'Set expiry'}
                  </label>
                  <select value={extendMonths} onChange={(e) => setExtendMonths(Number(e.target.value))} className={inputCls} style={{ background: '#0a0a0a' }}>
                    <option value={1}>1 month</option>
                    <option value={2}>2 months</option>
                    <option value={3}>3 months</option>
                    <option value={6}>6 months</option>
                    <option value={12}>12 months</option>
                  </select>
                </div>
              )}
            </div>

            {(plan === 'commission' || vendor.plan === 'commission') && (
              <>
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-muted">Commission rate (0–90%)</label>
                  <input
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    type="number"
                    min="0"
                    max="90"
                    step="0.5"
                    placeholder="e.g. 10"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-muted">Commission terms</label>
                  <textarea
                    value={commissionTerms}
                    onChange={(e) => setCommissionTerms(e.target.value)}
                    rows={2}
                    maxLength={1000}
                    placeholder="What counts as a qualifying sale, settlement schedule…"
                    className={inputCls}
                  />
                </div>
              </>
            )}

            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-muted">Payment status</label>
              <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className={inputCls} style={{ background: '#0a0a0a' }}>
                <option value="none">none</option>
                <option value="pending_verification">pending verification</option>
                <option value="paid">paid</option>
                <option value="overdue">overdue</option>
                <option value="not_applicable">not applicable</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-line py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-card hover:text-cream">
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand py-2.5 text-sm font-semibold text-ink shadow-lg shadow-white/15 transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
