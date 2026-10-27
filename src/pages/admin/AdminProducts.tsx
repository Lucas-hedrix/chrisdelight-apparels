import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, RefreshCw, AlertTriangle, Star, PackageX, PackageCheck } from 'lucide-react';
import {
  adminListProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminSetProductSoldOut,
} from '../../lib/admin';
import { isAppwriteConfigured } from '../../lib/appwrite';
import { fmt } from '../../lib/format';
import { isNewArrival } from '../../lib/products';
import ProductModal from '../../components/admin/ProductModal';

// ── Confirm delete dialog ────────────────────────────────────────────────────
function ConfirmDialog({
  name,
  onConfirm,
  onCancel,
  busy,
}: {
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
  busy: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-line bg-panel p-6 shadow-2xl">
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-brand/10">
          <AlertTriangle className="h-5 w-5 text-brand" />
        </div>
        <h3 className="text-lg font-bold">Delete product?</h3>
        <p className="mt-2 text-sm text-muted">
          <span className="font-semibold text-cream">"{name}"</span> will be permanently removed.
          This cannot be undone.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            disabled={busy}
            className="flex-1 rounded-xl border border-line py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-card hover:text-cream disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="flex-1 rounded-xl bg-brand py-2.5 text-sm font-semibold text-ink shadow-lg shadow-white/15 transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {busy ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function AdminProducts() {
  const [products, setProducts] = useState<any[] | null>(null);
  const [q, setQ] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // undefined = modal closed | null = adding new | object = editing
  const [modalProduct, setModalProduct] = useState<any | null | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!isAppwriteConfigured) return;
    setLoading(true);
    setError(null);
    try {
      setProducts(await adminListProducts());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = (products ?? []).filter((p) =>
    `${p.name} ${p.category}`.toLowerCase().includes(q.toLowerCase())
  );

  const handleSave = async (data: any) => {
    if (modalProduct) {
      await adminUpdateProduct(modalProduct.$id, data);
    } else {
      await adminCreateProduct(data);
    }
    await load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminDeleteProduct(deleteTarget.$id);
      setDeleteTarget(null);
      await load();
    } catch (e: any) {
      setError(e.message);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const [togglingId, setTogglingId] = useState<string | null>(null);

  const toggleSoldOut = async (p: any) => {
    setTogglingId(p.$id);
    try {
      const next = !p.soldOut;
      await adminSetProductSoldOut(p.$id, next);
      setProducts((prev) =>
        prev ? prev.map((x) => (x.$id === p.$id ? { ...x, soldOut: next } : x)) : prev
      );
    } catch (e: any) {
      setError(e.message);
    } finally {
      setTogglingId(null);
    }
  };

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
          <h1 className="text-3xl font-extrabold tracking-tight">Products</h1>
          <p className="mt-1 text-sm text-muted">
            {products !== null
              ? `${products.length} product${products.length === 1 ? '' : 's'}`
              : 'Loading…'}
          </p>
        </div>
        <button
          onClick={() => setModalProduct(null)}
          className="flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-ink shadow-lg shadow-white/15 transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-brand">
          {error}
        </div>
      )}

      {/* ── Search + refresh ── */}
      <div className="mb-4 flex gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-line bg-card px-4 py-2.5 transition-colors focus-within:border-brand/50">
          <Search className="h-4 w-4 shrink-0 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or category…"
            className="w-full bg-transparent text-sm text-cream outline-none placeholder:text-muted"
          />
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line bg-card text-muted transition-colors hover:text-cream disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* ── Table ── */}
      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        {/* Column headers */}
        <div
          className="hidden border-b border-line bg-card-2 px-5 py-3 sm:grid"
          style={{ gridTemplateColumns: '1fr 110px 110px 90px 90px 110px' }}
        >
          {['Product', 'Category', 'Price', 'New', 'Stock', 'Actions'].map((h) => (
            <span key={h} className="text-[11px] font-bold uppercase tracking-wider text-muted">
              {h}
            </span>
          ))}
        </div>

        {/* Skeleton */}
        {products === null && (
          <div className="divide-y divide-line">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-4">
                <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-card-2" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-44 animate-pulse rounded bg-card-2" />
                  <div className="h-2.5 w-28 animate-pulse rounded bg-card-2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rows */}
        {products !== null && (
          <div className="divide-y divide-line">
            {filtered.length === 0 ? (
              <div className="px-5 py-14 text-center">
                <p className="text-sm text-muted">
                  {q
                    ? `No products match "${q}"`
                    : 'No products yet — click Add Product to get started.'}
                </p>
              </div>
            ) : (
              filtered.map((p) => (
                <div
                  key={p.$id}
                  className="hidden items-center gap-2 px-5 py-3.5 transition-colors hover:bg-card-2/50 sm:grid"
                  style={{ gridTemplateColumns: '1fr 110px 110px 90px 90px 110px' }}
                >
                  {/* Name + image */}
                  <div className="flex min-w-0 items-center gap-3">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded-xl border border-line object-cover"
                      />
                    ) : (
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-card-2 text-[10px] font-extrabold uppercase text-muted">
                        {(p.subCategory || p.category || '?').slice(0, 3)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{p.name}</p>
                      <p className="text-xs text-muted">{p.subCategory || '—'}</p>
                    </div>
                  </div>
                  {/* Category */}
                  <span className="inline-block w-fit rounded-lg border border-line px-2.5 py-1 text-xs font-semibold capitalize text-muted">
                    {p.category}
                  </span>
                  {/* Price */}
                  <span className="text-sm font-semibold">{fmt(p.price)}</span>
                  {/* New arrival */}
                  <div className="flex justify-center">
                    <Star
                      className={`h-4 w-4 ${
                        isNewArrival({ id: p.$id, name: p.name, category: p.category, price: Number(p.price ?? 0), image: p.image ?? null, availableSizes: [], availableColors: [], newArrivalExpiresAt: p.newArrivalExpiresAt ?? null })
                          ? 'fill-brand text-brand'
                          : 'text-muted/25'
                      }`}
                    />
                  </div>
                  {/* Stock quick toggle */}
                  <div className="flex justify-center">
                    <button
                      onClick={() => toggleSoldOut(p)}
                      disabled={togglingId === p.$id}
                      title={p.soldOut ? 'Mark back in stock' : 'Mark as sold out'}
                      className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide transition-colors disabled:opacity-50 ${
                        p.soldOut
                          ? 'border-brand/50 bg-brand/15 text-brand'
                          : 'border-line text-muted hover:border-brand/40 hover:text-cream'
                      }`}
                    >
                      {p.soldOut ? 'Sold out' : 'In stock'}
                    </button>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-2">
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
              ))
            )}

            {/* Mobile card rows (visible on small screens) */}
            {filtered.map((p) => (
              <div
                key={`m-${p.$id}`}
                className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-card-2/50 sm:hidden"
              >
                {p.image ? (
                  <img
                    src={p.image}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded-xl border border-line object-cover"
                  />
                ) : (
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-card-2 text-[10px] font-extrabold uppercase text-muted">
                    {(p.subCategory || p.category || '?').slice(0, 3)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{p.name}</p>
                  <p className="text-xs text-muted">
                    {p.subCategory || '—'} · {p.category} · {fmt(p.price)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    onClick={() => toggleSoldOut(p)}
                    disabled={togglingId === p.$id}
                    title={p.soldOut ? 'Mark back in stock' : 'Mark as sold out'}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted hover:text-cream disabled:opacity-50"
                  >
                    {p.soldOut ? (
                      <PackageCheck className="h-3.5 w-3.5" />
                    ) : (
                      <PackageX className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => setModalProduct(p)}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted hover:text-cream"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(p)}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted hover:text-brand"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product add/edit modal */}
      {modalProduct !== undefined && (
        <ProductModal
          product={modalProduct}
          onClose={() => setModalProduct(undefined)}
          onSave={handleSave}
        />
      )}

      {/* Confirm delete dialog */}
      {deleteTarget && (
        <ConfirmDialog
          name={deleteTarget.name}
          busy={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
