import { useCallback, useEffect, useState } from 'react';
import { Plus, Trash2, RefreshCw, AlertTriangle, X, Store } from 'lucide-react';
import { account } from '../../lib/appwrite';
import { isAppwriteConfigured } from '../../lib/appwrite';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type StoreCategory,
} from '../../lib/categories';

const inputCls =
  'w-full rounded-xl border border-line bg-ink px-4 py-2.5 text-sm text-cream ' +
  'placeholder:text-muted outline-none transition-colors focus:border-brand/50';

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
        <h3 className="text-lg font-bold">Delete category?</h3>
        <p className="mt-2 text-sm text-muted">
          <span className="font-semibold text-cream">"{name}"</span> will be removed from the store.
          Products already assigned to it keep their label but will no longer appear under a
          category filter. This cannot be undone.
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

function SubChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="flex items-center gap-1.5 rounded-lg border border-line bg-card-2 px-2.5 py-1 text-xs font-semibold text-cream">
      {label}
      <button
        onClick={onRemove}
        aria-label={`Remove ${label}`}
        className="text-muted transition-colors hover:text-brand"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

function CategoryCard({
  cat,
  onRemoveSub,
  onAddSub,
  onDelete,
}: {
  cat: StoreCategory;
  onRemoveSub: (sub: string) => void;
  onAddSub: (sub: string) => void;
  onDelete: () => void;
}) {
  const [newSub, setNewSub] = useState('');

  const add = () => {
    const s = newSub.trim().slice(0, 100);
    if (!s || cat.subCategories.includes(s)) return;
    onAddSub(s);
    setNewSub('');
  };

  return (
    <div className="flex flex-col rounded-2xl border border-line bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold">{cat.name}</h3>
          {cat.description && <p className="mt-0.5 text-xs text-muted">{cat.description}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {cat.vendorId && (
            <span className="flex items-center gap-1 rounded-lg border border-line px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted">
              <Store className="h-3 w-3" />
              Vendor
            </span>
          )}
          <button
            onClick={onDelete}
            title="Delete category"
            className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-brand/40 hover:text-brand"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <p className="mt-4 text-[11px] font-bold uppercase tracking-widest text-muted">
        Collections ({cat.subCategories.length})
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {cat.subCategories.map((s) => (
          <SubChip key={s} label={s} onRemove={() => onRemoveSub(s)} />
        ))}
        {cat.subCategories.length === 0 && (
          <span className="text-xs text-muted">No collections yet</span>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          className={`${inputCls} flex-1`}
          placeholder="Add a collection (e.g. Phones)"
          value={newSub}
          maxLength={100}
          onChange={(e) => setNewSub(e.target.value)}
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
    </div>
  );
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<StoreCategory[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSubs, setNewSubs] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<StoreCategory | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!isAppwriteConfigured) return;
    setLoading(true);
    setError(null);
    try {
      setCategories(await getAllCategories());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim().slice(0, 100);
    if (!name) return setError('A category name is required.');
    if (categories?.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      return setError(`"${name}" already exists.`);
    }
    setCreating(true);
    setError(null);
    try {
      const me = await account.get();
      await createCategory({
        name,
        description: newDesc.trim() || undefined,
        subCategories: newSubs
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 50),
        ownerUserId: me.$id,
      });
      setNewName('');
      setNewDesc('');
      setNewSubs('');
      setShowAdd(false);
      await load();
    } catch (err: any) {
      setError(err.message ?? 'Could not create the category.');
    } finally {
      setCreating(false);
    }
  };

  const handleRemoveSub = async (cat: StoreCategory, sub: string) => {
    try {
      await updateCategory(cat.id, {
        subCategories: cat.subCategories.filter((s) => s !== sub),
      });
      await load();
    } catch (err: any) {
      setError(err.message ?? 'Could not update the category.');
    }
  };

  const handleAddSub = async (cat: StoreCategory, sub: string) => {
    try {
      await updateCategory(cat.id, { subCategories: [...cat.subCategories, sub] });
      await load();
    } catch (err: any) {
      setError(err.message ?? 'Could not update the category.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCategory(deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } catch (err: any) {
      setError(err.message ?? 'Could not delete the category.');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  if (!isAppwriteConfigured) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-card p-14 text-center">
        <p className="text-sm text-muted">Appwrite is not configured.</p>
      </div>
    );
  }

  const global = (categories ?? []).filter((c) => !c.vendorId);
  const vendorCats = (categories ?? []).filter((c) => c.vendorId);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Categories</h1>
          <p className="mt-1 text-sm text-muted">
            {categories !== null
              ? `${global.length} categor${global.length === 1 ? 'y' : 'ies'} · ${vendorCats.length} vendor-added`
              : 'Loading…'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-card text-muted transition-colors hover:text-cream disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowAdd((v) => !v)}
            className="flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-ink shadow-lg shadow-white/15 transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-brand">
          {error}
        </div>
      )}

      {showAdd && (
        <form
          onSubmit={handleCreate}
          className="mb-6 rounded-2xl border border-line bg-card p-5"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-muted">
                Category Name<span className="ml-1 text-brand">*</span>
              </label>
              <input
                className={inputCls}
                maxLength={100}
                placeholder="e.g. Electronics, Decorations"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-muted">
                Collections (comma-separated)
              </label>
              <input
                className={inputCls}
                placeholder="e.g. Phones, Tablets, Lights"
                value={newSubs}
                onChange={(e) => setNewSubs(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-muted">
              Description (optional)
            </label>
            <input
              className={inputCls}
              maxLength={500}
              placeholder="A short line shown on the category"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="rounded-xl border border-line px-5 py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-card hover:text-cream"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-ink shadow-lg shadow-white/15 transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {creating ? 'Creating…' : 'Create Category'}
            </button>
          </div>
        </form>
      )}

      {categories === null ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl border border-line bg-card" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {global.map((c) => (
              <CategoryCard
                key={c.id}
                cat={c}
                onRemoveSub={(sub) => handleRemoveSub(c, sub)}
                onAddSub={(sub) => handleAddSub(c, sub)}
                onDelete={() => setDeleteTarget(c)}
              />
            ))}
          </div>

          {vendorCats.length > 0 && (
            <>
              <h2 className="mb-3 mt-8 text-[11px] font-bold uppercase tracking-widest text-muted">
                Added by vendors
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {vendorCats.map((c) => (
                  <CategoryCard
                    key={c.id}
                    cat={c}
                    onRemoveSub={(sub) => handleRemoveSub(c, sub)}
                    onAddSub={(sub) => handleAddSub(c, sub)}
                    onDelete={() => setDeleteTarget(c)}
                  />
                ))}
              </div>
            </>
          )}

          {categories.length === 0 && (
            <div className="rounded-2xl border border-line bg-card p-14 text-center">
              <p className="text-sm text-muted">
                No categories yet — click Add Category to get started.
              </p>
            </div>
          )}
        </>
      )}

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
