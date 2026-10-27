import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  BadgeCheck,
  CircleDollarSign,
  ExternalLink,
  Loader2,
  Lock,
  PackageCheck,
  PackageX,
  Pencil,
  Plus,
  RefreshCw,
  Store,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { account } from '../lib/appwrite';
import {
  createCategory,
  deleteCategory,
  getStoreCategories,
  getVendorCategories,
  updateCategory,
  type StoreCategory,
} from '../lib/categories';
import { apiFetch, createVendorProduct, deleteVendorProduct, getMyVendor, listMyProducts, setVendorProductSoldOut, updateVendorProduct, uploadLogo, type VendorMe, type VendorProductInput } from '../lib/vendorClient';
import { PLAN_PRICES, type VendorProduct } from '../lib/vendors';
import { isPaystackConfigured, loadPaystack, paystackPublicKey } from '../lib/payments';
import { fmt } from '../lib/format';
import { friendlyError, logError } from '../lib/errors';
import VendorProductModal from '../components/vendor/VendorProductModal';

const inputCls =
  'w-full rounded-xl border border-line bg-ink px-4 py-2.5 text-sm text-cream ' +
  'placeholder:text-muted outline-none transition-colors focus:border-brand/50';

type Tab = 'products' | 'categories' | 'profile' | 'billing';

const STATUS_STYLES: Record<string, string> = {
  active: 'border-brand/50 bg-brand/15 text-brand',
  pending: 'border-line bg-card-2 text-muted',
  suspended: 'border-brand/50 bg-brand/10 text-brand',
  expired: 'border-line bg-card-2 text-muted',
};

export default function VendorDashboard() {
  const { user, ready } = useAuth();
  // undefined = loading | null = no vendor account | VendorMe = loaded
  const [me, setMe] = useState<VendorMe | null | undefined>(undefined);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('products');

  const refresh = useCallback(async () => {
    try {
      setMe(await getMyVendor());
      setLoadError(null);
    } catch (err: any) {
      if (err?.status === 404) {
        setMe(null);
      } else {
        setMe(undefined);
        setLoadError(err?.message ?? "Couldn't load your store right now.");
      }
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      setMe(null);
      return;
    }
    refresh();
  }, [ready, user, refresh]);

  if (!ready || me === undefined) {
    if (loadError) {
      return (
        <Centered
          icon={<AlertTriangle className="h-8 w-8" />}
          title="Couldn't load your store"
          body={loadError}
          cta={{ to: '', label: 'Try again', onClick: () => { setLoadError(null); refresh(); } }}
        />
      );
    }
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <Loader2 className="h-7 w-7 animate-spin text-muted" />
      </div>
    );
  }

  if (!user) {
    return (
      <Centered
        icon={<UserRound className="h-8 w-8" />}
        title="Sign in to manage your store"
        body="Your vendor dashboard holds your products, plan and profile."
        cta={{ to: '/auth?next=/vendor', label: 'Sign in or create an account' }}
      />
    );
  }

  if (me === null) {
    return (
      <Centered
        icon={<Store className="h-8 w-8" />}
        title="You don't have a store yet"
        body="Rent a storefront space on Cybernexus and put your products in front of every visitor."
        cta={{ to: '/sell', label: 'Become a Vendor' }}
      />
    );
  }

  return (
    <DashboardBody me={me} refresh={refresh} tab={tab} setTab={setTab} />
  );
}

function Centered({
  icon,
  title,
  body,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  cta?: { to?: string; label: string; onClick?: () => void };
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-card-2 text-muted">{icon}</div>
      <h1 className="font-display text-3xl tracking-wide">{title}</h1>
      <p className="max-w-md text-sm leading-relaxed text-muted">{body}</p>
      {cta &&
        (cta.to ? (
          <Link to={cta.to} className="mt-2 rounded-full bg-brand px-6 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-brand-strong">
            {cta.label}
          </Link>
        ) : (
          <button onClick={cta.onClick} className="mt-2 rounded-full bg-brand px-6 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-brand-strong">
            {cta.label}
          </button>
        ))}
    </div>
  );
}

function DashboardBody({
  me,
  refresh,
  tab,
  setTab,
}: {
  me: VendorMe;
  refresh: () => Promise<void>;
  tab: Tab;
  setTab: (t: Tab) => void;
}) {
  const { push } = useToast();
  const [paying, setPaying] = useState(false);
  const { user } = useAuth();

  const payStatus = me.paymentStatus;
  const planExpired =
    me.plan !== 'commission' && me.planExpiresAt && new Date(me.planExpiresAt) <= new Date();
  const planExpiringSoon =
    !planExpired &&
    me.plan !== 'commission' &&
    me.planExpiresAt &&
    new Date(me.planExpiresAt).getTime() - Date.now() < 7 * 86400000;
  const canPay = payStatus !== 'pending_verification' && me.plan !== 'commission';

  async function payForPlan(plan: 'starter' | 'business') {
    if (!user) return;
    if (!isPaystackConfigured) {
      push({
        title: 'Payments not available',
        message: 'Online payment is not set up yet — contact support to complete your subscription.',
        tone: 'error',
      });
      return;
    }
    setPaying(true);
    try {
      const PaystackPop = await loadPaystack();
      const reference = await new Promise<string>((resolve, reject) => {
        const handler = PaystackPop.setup({
          key: paystackPublicKey,
          email: user.email,
          amount: PLAN_PRICES[plan] * 100,
          currency: 'NGN',
          ref: `CVN-${Date.now()}`,
          metadata: { purpose: 'vendor-plan', plan, userId: user.$id },
          callback: (t: { reference: string }) => resolve(t.reference),
          onClose: () => reject(new Error('Payment window closed before completion')),
        });
        handler.openIframe();
      });
      await apiFetch('/vendor/payments', {
        method: 'POST',
        body: JSON.stringify({ plan, reference, amount: PLAN_PRICES[plan] }),
      });
      push({
        title: 'Payment submitted',
        message: 'We verify payments by hand — your plan activates once verified.',
      });
      await refresh();
    } catch (err) {
      logError(err);
      push({
        title: "Payment didn't go through",
        message: friendlyError(err, 'Try again, or contact support with your reference.'),
        tone: 'error',
      });
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* ── Store header ── */}
      <header className="rounded-3xl border border-line bg-card p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          {me.vendor.logoUrl ? (
            <img src={me.vendor.logoUrl} alt={me.vendor.businessName} className="h-20 w-20 shrink-0 rounded-3xl border border-line object-cover" />
          ) : (
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-card-2 font-display text-3xl text-brand">
              {me.vendor.businessName.trim().charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-3xl tracking-wide">{me.vendor.businessName}</h1>
              <span className={`rounded-full border px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest ${STATUS_STYLES[me.liveStatus] ?? STATUS_STYLES.pending}`}>
                {me.liveStatus}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted">
              cybernexus.store/vendors/{me.vendor.slug}
              {me.vendor.featured && (
                <span className="ml-2 inline-flex items-center gap-1 font-semibold text-brand">
                  <BadgeCheck className="h-3.5 w-3.5" /> Featured
                </span>
              )}
            </p>
          </div>
          <Link
            to={`/vendors/${me.vendor.slug}`}
            className="flex shrink-0 items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-bold text-cream transition-colors hover:border-brand/40"
          >
            View storefront
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>

        {/* ── Plan strip ── */}
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line pt-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted">Plan</p>
            <p className="mt-0.5 font-bold capitalize">{me.plan}</p>
          </div>
          {me.plan !== 'commission' && me.planExpiresAt && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted">Renews / expires</p>
              <p className="mt-0.5 font-bold">{new Date(me.planExpiresAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
          )}
          {me.plan === 'commission' && me.commissionRate != null && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted">Agreed commission</p>
              <p className="mt-0.5 font-bold">{me.commissionRate}% of qualifying sales</p>
            </div>
          )}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted">Payment</p>
            <p className="mt-0.5 font-bold capitalize">{payStatus.replace(/_/g, ' ')}</p>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-3">
            {payStatus === 'pending_verification' && (
              <span className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-xs font-bold text-muted">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Awaiting payment verification
              </span>
            )}
            {canPay && me.plan === 'starter' && (
              <button
                onClick={() => payForPlan('business')}
                disabled={paying}
                className="flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-brand-strong disabled:opacity-60"
              >
                {paying ? <Loader2 className="h-4 w-4 animate-spin" /> : <CircleDollarSign className="h-4 w-4" />}
                Upgrade to Business — {fmt(PLAN_PRICES.business)}/mo
              </button>
            )}
            {canPay && (planExpired || planExpiringSoon) && (
              <button
                onClick={() => payForPlan(me.plan as 'starter' | 'business')}
                disabled={paying}
                className="flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-brand-strong disabled:opacity-60"
              >
                {paying ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                {planExpired ? 'Renew plan' : 'Renew early'} — {fmt(PLAN_PRICES[me.plan as 'starter' | 'business'])}/mo
              </button>
            )}
          </div>
        </div>

        {me.liveStatus === 'pending' && (
          <p className="mt-4 flex items-start gap-2 rounded-2xl border border-line bg-card-2 p-4 text-xs leading-relaxed text-muted">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
            Your store is awaiting review. You can prepare products now — buyers will see them once
            your store is activated.
          </p>
        )}
        {me.liveStatus === 'suspended' && (
          <p className="mt-4 flex items-start gap-2 rounded-2xl border border-brand/30 bg-brand/10 p-4 text-xs leading-relaxed text-brand">
            <Lock className="mt-0.5 h-4 w-4 shrink-0" />
            Your store is suspended and hidden from buyers. Contact support to resolve this.
          </p>
        )}
        {me.liveStatus === 'expired' && (
          <p className="mt-4 flex items-start gap-2 rounded-2xl border border-brand/30 bg-brand/10 p-4 text-xs leading-relaxed text-brand">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            Your plan has expired — buyer contact is locked and your listings will come down after a
            7-day grace period. Renew to restore everything instantly.
          </p>
        )}
      </header>

      {/* ── Tabs ── */}
      <div className="mt-8 flex gap-2 overflow-x-auto">
        {(
          [
            ['products', 'Products'],
            ['categories', 'Categories'],
            ['profile', 'Profile'],
            ['billing', 'Payments & Commissions'],
          ] as [Tab, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-bold transition-colors ${
              tab === id ? 'bg-brand text-ink' : 'border border-line text-muted hover:text-cream'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'products' && <ProductsTab me={me} />}
        {tab === 'categories' && <CategoriesTab me={me} />}
        {tab === 'profile' && <ProfileTab me={me} refresh={refresh} />}
        {tab === 'billing' && <BillingTab me={me} />}
      </div>
    </div>
  );
}

// ── Products ─────────────────────────────────────────────────────────────────
function ProductsTab({ me }: { me: VendorMe }) {
  const [products, setProducts] = useState<VendorProduct[] | null>(null);
  // undefined = closed | null = adding | object = editing
  const [modalProduct, setModalProduct] = useState<VendorProduct | null | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<VendorProduct | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { push } = useToast();

  const load = useCallback(async () => {
    setProducts(await listMyProducts(me.vendor.vendorId));
  }, [me.vendor.vendorId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave(input: VendorProductInput) {
    if (modalProduct) {
      await updateVendorProduct(modalProduct.id, input);
      push({ title: 'Product updated', message: input.name });
    } else {
      const created = await createVendorProduct(me.vendor.vendorId, input);
      push({ title: 'Product added', message: created.name });
    }
    await load();
  }

  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function toggleSoldOut(p: VendorProduct) {
    setTogglingId(p.id);
    try {
      await setVendorProductSoldOut(p.id, !p.soldOut);
      setProducts((prev) =>
        prev ? prev.map((x) => (x.id === p.id ? { ...x, soldOut: !p.soldOut } : x)) : prev
      );
      push({
        title: p.soldOut ? 'Back in stock' : 'Marked as sold out',
        message: p.name,
      });
    } catch (err) {
      logError(err);
      push({
        title: "Couldn't update product",
        message: friendlyError(err),
        tone: 'error',
      });
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteVendorProduct(deleteTarget.id);
      setDeleteTarget(null);
      push({ title: 'Product removed', message: deleteTarget.name });
      await load();
    } catch (err) {
      logError(err);
      push({
        title: "Couldn't remove product",
        message: friendlyError(err),
        tone: 'error',
      });
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {products ? `${products.length} listed` : 'Loading…'}
        </p>
        <button
          onClick={() => setModalProduct(null)}
          className="flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-brand-strong"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {products === null ? (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl border border-line bg-card" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-2 rounded-3xl border border-line bg-card p-10 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-card-2 text-muted">
            <Store className="h-6 w-6" />
          </div>
          <h3 className="font-bold">No products yet</h3>
          <p className="max-w-sm text-sm leading-relaxed text-muted">
            Add your first product with a photo, price and description — it appears on your
            storefront and in the main marketplace.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-card">
          <div className="divide-y divide-line">
            {products.map((p) => (
              <div key={p.id} className="flex items-center gap-4 px-5 py-4">
                {p.image ? (
                  <img src={p.image} alt="" className="h-12 w-12 shrink-0 rounded-xl border border-line object-cover" />
                ) : (
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-card-2 text-[10px] font-extrabold uppercase text-muted">
                    {(p.subCategory ?? p.category).slice(0, 3)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{p.name}</p>
                  <p className="truncate text-xs text-muted">
                    {p.category}
                    {p.subCategory ? ` · ${p.subCategory}` : ''} · {p.availableSizes.join(', ')}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-bold">{fmt(p.price)}</span>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    onClick={() => toggleSoldOut(p)}
                    disabled={togglingId === p.id}
                    title={p.soldOut ? 'Mark back in stock' : 'Mark as sold out'}
                    className={`grid h-8 w-8 place-items-center rounded-lg border transition-colors disabled:opacity-50 ${
                      p.soldOut
                        ? 'border-brand/50 bg-brand/15 text-brand'
                        : 'border-line text-muted hover:border-brand/40 hover:text-cream'
                    }`}
                  >
                    {p.soldOut ? (
                      <PackageCheck className="h-3.5 w-3.5" />
                    ) : (
                      <PackageX className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => setModalProduct(p)}
                    title="Edit"
                    className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-brand/40 hover:text-cream"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(p)}
                    title="Delete"
                    className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-brand/40 hover:text-brand"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {modalProduct !== undefined && (
        <VendorProductModal
          product={modalProduct}
          vendorId={me.vendor.vendorId}
          onClose={() => setModalProduct(undefined)}
          onSave={handleSave}
        />
      )}

      {deleteTarget && (
        <ConfirmDelete
          name={deleteTarget.name}
          busy={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

// ── Categories ───────────────────────────────────────────────────────────────
function CategoriesTab({ me }: { me: VendorMe }) {
  const { push } = useToast();
  const [storeCats, setStoreCats] = useState<StoreCategory[] | null>(null);
  const [myCats, setMyCats] = useState<StoreCategory[] | null>(null);
  const [name, setName] = useState('');
  const [subs, setSubs] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<StoreCategory | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      const [store, mine] = await Promise.all([
        getStoreCategories(),
        getVendorCategories(me.vendor.vendorId),
      ]);
      setStoreCats(store);
      setMyCats(mine);
    } catch (err) {
      logError(err);
      push({ title: "Couldn't load categories", message: friendlyError(err), tone: 'error' });
      setStoreCats([]);
      setMyCats([]);
    }
  }, [me.vendor.vendorId, push]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim().slice(0, 100);
    if (!trimmed) return;
    if (storeCats?.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      push({
        title: 'Category already exists',
        message: `"${trimmed}" is already a store category — you can use it right away.`,
        tone: 'error',
      });
      return;
    }
    setCreating(true);
    try {
      const acct = await account.get();
      await createCategory({
        name: trimmed,
        subCategories: subs
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 50),
        vendorId: me.vendor.vendorId,
        ownerUserId: acct.$id,
      });
      setName('');
      setSubs('');
      push({ title: 'Category added', message: `"${trimmed}" is now on your storefront.` });
      await load();
    } catch (err) {
      logError(err);
      push({ title: "Couldn't add category", message: friendlyError(err), tone: 'error' });
    } finally {
      setCreating(false);
    }
  };

  const handleRemoveSub = async (cat: StoreCategory, sub: string) => {
    try {
      await updateCategory(cat.id, { subCategories: cat.subCategories.filter((s) => s !== sub) });
      await load();
    } catch (err) {
      push({ title: "Couldn't update category", message: friendlyError(err), tone: 'error' });
    }
  };

  const handleAddSub = async (cat: StoreCategory, sub: string) => {
    try {
      await updateCategory(cat.id, { subCategories: [...cat.subCategories, sub] });
      await load();
    } catch (err) {
      push({ title: "Couldn't update category", message: friendlyError(err), tone: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCategory(deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } catch (err) {
      push({ title: "Couldn't remove category", message: friendlyError(err), tone: 'error' });
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="rounded-3xl border border-line bg-card p-6">
        <h3 className="font-bold">Store categories</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          These apply to every store. Use them for your products as-is — or add your own categories
          below.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {storeCats === null
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-8 w-24 animate-pulse rounded-lg bg-card-2" />
              ))
            : storeCats.map((c) => (
                <span
                  key={c.id}
                  className="rounded-lg border border-line bg-card-2 px-3 py-1.5 text-xs font-semibold text-cream"
                >
                  {c.name}
                </span>
              ))}
        </div>
      </div>

      <form onSubmit={handleCreate} className="mt-4 rounded-3xl border border-line bg-card p-6">
        <h3 className="font-bold">Add your own category</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          Custom categories and collections appear on your storefront only.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-muted">
              Category name<span className="ml-1 text-brand">*</span>
            </label>
            <input
              className={inputCls}
              maxLength={100}
              placeholder="e.g. Phone Accessories"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-muted">
              Collections (comma-separated)
            </label>
            <input
              className={inputCls}
              placeholder="e.g. Chargers, Cases, Screen guards"
              value={subs}
              onChange={(e) => setSubs(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            disabled={creating || !name.trim()}
            className="flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-ink shadow-lg shadow-white/15 transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {creating ? 'Adding…' : 'Add Category'}
          </button>
        </div>
      </form>

      <div className="mt-4 space-y-4">
        <h3 className="text-sm font-bold">
          Your categories {myCats !== null && myCats.length > 0 && `(${myCats.length})`}
        </h3>
        {myCats === null ? (
          <div className="h-24 animate-pulse rounded-2xl border border-line bg-card" />
        ) : myCats.length === 0 ? (
          <p className="rounded-2xl border border-line bg-card p-6 text-sm text-muted">
            You haven't added any custom categories yet.
          </p>
        ) : (
          myCats.map((c) => (
            <div key={c.id} className="rounded-2xl border border-line bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <h4 className="font-bold">{c.name}</h4>
                <button
                  onClick={() => setDeleteTarget(c)}
                  title="Delete category"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-brand/40 hover:text-brand"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {c.subCategories.map((s) => (
                  <span
                    key={s}
                    className="flex items-center gap-1.5 rounded-lg border border-line bg-card-2 px-2.5 py-1 text-xs font-semibold text-cream"
                  >
                    {s}
                    <button
                      onClick={() => handleRemoveSub(c, s)}
                      aria-label={`Remove ${s}`}
                      className="text-muted transition-colors hover:text-brand"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {c.subCategories.length === 0 && (
                  <span className="text-xs text-muted">No collections yet</span>
                )}
              </div>
              <AddSubInline onAdd={(sub) => handleAddSub(c, sub)} existing={c.subCategories} />
            </div>
          ))
        )}
      </div>

      {deleteTarget && (
        <ConfirmDelete
          name={deleteTarget.name}
          busy={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

function AddSubInline({
  onAdd,
  existing,
}: {
  onAdd: (sub: string) => void;
  existing: string[];
}) {
  const [value, setValue] = useState('');
  const add = () => {
    const s = value.trim().slice(0, 100);
    if (!s || existing.includes(s)) return;
    onAdd(s);
    setValue('');
  };
  return (
    <div className="mt-4 flex gap-2">
      <input
        className={`${inputCls} flex-1`}
        maxLength={100}
        placeholder="Add a collection (e.g. Cases)"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            add();
          }
        }}
      />
      <button
        onClick={add}
        className="grid w-10 shrink-0 place-items-center rounded-xl border border-line text-muted transition-colors hover:border-brand/40 hover:text-cream"
        aria-label="Add collection"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

function ConfirmDelete({
  name,
  busy,
  onConfirm,
  onCancel,
}: {
  name: string;
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-line bg-panel p-6 shadow-2xl">
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-brand/10">
          <AlertTriangle className="h-5 w-5 text-brand" />
        </div>
        <h3 className="text-lg font-bold">Remove product?</h3>
        <p className="mt-2 text-sm text-muted">
          <span className="font-semibold text-cream">"{name}"</span> will be removed from your store
          and the marketplace. This cannot be undone.
        </p>
        <div className="mt-6 flex gap-3">
          <button onClick={onCancel} disabled={busy} className="flex-1 rounded-xl border border-line py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-card hover:text-cream disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={busy} className="flex-1 rounded-xl bg-brand py-2.5 text-sm font-semibold text-ink shadow-lg shadow-white/15 transition-opacity hover:opacity-90 disabled:opacity-60">
            {busy ? 'Removing…' : 'Remove'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Profile ──────────────────────────────────────────────────────────────────
function ProfileTab({ me, refresh }: { me: VendorMe; refresh: () => Promise<void> }) {
  const { push } = useToast();
  const [form, setForm] = useState({
    businessName: me.vendor.businessName,
    slug: me.vendor.slug,
    category: me.vendor.category ?? '',
    bio: me.vendor.bio ?? '',
    whatsapp: me.whatsapp,
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(me.vendor.logoUrl);
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function pickLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0] ?? null;
    e.target.value = '';
    setLogoFile(picked);
    setLogoPreview(picked ? URL.createObjectURL(picked) : logoPreview);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      let logoFileId: string | undefined;
      if (logoFile) logoFileId = await uploadLogo(logoFile);
      await apiFetch('/vendor/me', {
        method: 'PATCH',
        body: JSON.stringify({ ...form, logoFileId }),
      });
      push({ title: 'Profile saved', message: 'Your storefront has been updated.' });
      setLogoFile(null);
      await refresh();
    } catch (err) {
      logError(err);
      push({ title: "Couldn't save profile", message: friendlyError(err), tone: 'error' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-line bg-card p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-muted">Business name</span>
          <input required minLength={2} maxLength={100} className={inputCls} value={form.businessName} onChange={set('businessName')} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-muted">Store address</span>
          <input maxLength={30} className={inputCls} value={form.slug} onChange={set('slug')} />
          <span className="mt-1.5 block text-[11px] text-muted">cybernexus.store/vendors/{form.slug}</span>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-muted">What you sell</span>
          <input maxLength={100} className={inputCls} value={form.category} onChange={set('category')} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-muted">WhatsApp number</span>
          <input required inputMode="tel" className={inputCls} value={form.whatsapp} onChange={set('whatsapp')} />
          <span className="mt-1.5 block text-[11px] text-muted">
            {me.plan === 'business' && me.liveStatus === 'active'
              ? 'Buyers on your storefront can reach you on this number.'
              : 'Digits only with country code. Buyers see this only on the Business plan.'}
          </span>
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-muted">About your business</span>
          <textarea rows={3} maxLength={1000} className={inputCls} value={form.bio} onChange={set('bio')} />
        </label>
        <div className="sm:col-span-2">
          <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-muted">Logo</span>
          <div className="flex items-center gap-4">
            {logoPreview ? (
              <img src={logoPreview} alt="Logo" className="h-16 w-16 rounded-2xl border border-line object-cover" />
            ) : (
              <div className="grid h-16 w-16 place-items-center rounded-2xl border border-dashed border-line text-muted">
                <Store className="h-6 w-6" />
              </div>
            )}
            <label className="cursor-pointer rounded-full border border-line px-4 py-2 text-xs font-bold text-cream transition-colors hover:border-brand/40">
              {logoPreview ? 'Change logo' : 'Upload logo'}
              <input type="file" accept="image/*" onChange={pickLogo} className="hidden" />
            </label>
          </div>
        </div>
      </div>
      <button
        type="submit"
        disabled={saving}
        className="mt-8 flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold text-ink transition-colors hover:bg-brand-strong disabled:opacity-60"
      >
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        {saving ? 'Saving…' : 'Save profile'}
      </button>
    </form>
  );
}

// ── Payments & Commissions ───────────────────────────────────────────────────
function BillingTab({ me }: { me: VendorMe }) {
  return (
    <div className="space-y-8">
      {me.plan === 'commission' && (
        <div className="rounded-3xl border border-line bg-card p-6">
          <div className="flex items-center gap-3">
            <CircleDollarSign className="h-5 w-5 text-brand" />
            <h3 className="font-bold">Commission partnership</h3>
          </div>
          {me.commissionRate != null ? (
            <>
              <p className="mt-2 text-sm text-muted">
                Agreed rate: <span className="font-bold text-cream">{me.commissionRate}%</span> of
                each qualifying sale. {me.commissionTerms ?? ''}
              </p>
              <p className="mt-1 text-xs text-muted">
                Every qualifying sale we record appears below with the exact amount and commission.
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-muted">
              Your commission rate is being finalised. We will reach out to agree the rate and
              terms before your store goes live.
            </p>
          )}
        </div>
      )}

      <section>
        <h3 className="font-bold">Subscription payments</h3>
        {me.payments.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-line bg-card p-6 text-sm text-muted">
            {me.plan === 'commission'
              ? 'No subscription payments — commission partners do not pay a monthly fee.'
              : 'No payments yet.'}
          </p>
        ) : (
          <div className="mt-3 overflow-hidden rounded-2xl border border-line bg-card">
            <div className="divide-y divide-line">
              {me.payments.map((p) => (
                <div key={p.$id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold capitalize">
                      {p.plan} plan · {fmt(p.amount)}
                    </p>
                    <p className="truncate text-xs text-muted">
                      Ref {p.reference} · {new Date(p.$createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <StatusChip status={p.status} />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section>
        <h3 className="font-bold">Commission records</h3>
        {me.commissions.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-line bg-card p-6 text-sm text-muted">
            {me.plan === 'commission'
              ? 'No sales recorded yet. Records appear here as we log qualifying sales.'
              : 'Commission records apply to Commission Partner stores.'}
          </p>
        ) : (
          <div className="mt-3 overflow-hidden rounded-2xl border border-line bg-card">
            <div className="divide-y divide-line">
              {me.commissions.map((c) => (
                <div key={c.$id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                      {fmt(c.commissionAmount)} <span className="font-normal text-muted">on a {fmt(c.saleAmount)} sale</span>
                    </p>
                    <p className="truncate text-xs text-muted">
                      Ref {c.reference} · {c.rate}% · {new Date(c.$createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <StatusChip status={c.status} />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function StatusChip({ status }: { status: string }) {
  const styles: Record<string, string> = {
    verified: 'border-brand/50 bg-brand/15 text-brand',
    paid: 'border-brand/50 bg-brand/15 text-brand',
    settled: 'border-brand/50 bg-brand/15 text-brand',
    pending: 'border-line bg-card-2 text-muted',
    pending_verification: 'border-line bg-card-2 text-muted',
    rejected: 'border-line bg-card-2 text-muted',
    disputed: 'border-line bg-card-2 text-muted',
  };
  return (
    <span className={`shrink-0 rounded-full border px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest ${styles[status] ?? styles.pending}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
