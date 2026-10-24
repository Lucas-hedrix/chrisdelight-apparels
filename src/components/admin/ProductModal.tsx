import { useEffect, useRef, useState } from 'react';
import { X, Loader2, ImagePlus } from 'lucide-react';
import { storage, appwriteConfig } from '../../lib/appwrite';
import { ID } from 'appwrite';
import { MAIN_CATEGORIES } from '../../lib/products';
import { useToast } from '../../context/ToastContext';

const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];

const BLANK = {
  name: '',
  price: '',
  category: Object.keys(MAIN_CATEGORIES)[0],
  subCategory: '',
  sizes: [] as string[],
  colors: '',
  image: '' as string,
  isNewArrival: false,
  newArrivalDuration: '7',
};

const inputCls =
  'w-full rounded-xl border border-line bg-ink px-4 py-2.5 text-sm text-cream ' +
  'placeholder:text-muted outline-none transition-colors focus:border-brand/50';

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-muted">
        {label}
        {required && <span className="ml-1 text-brand">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function ProductModal({
  product,
  onClose,
  onSave,
}: {
  product: any | null;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}) {
  const [form, setForm] = useState(BLANK);
  const [extraSizes, setExtraSizes] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { push } = useToast();

  useEffect(() => {
    if (product) {
      const sizes: string[] = Array.isArray(product.availableSizes)
        ? product.availableSizes
        : typeof product.availableSizes === 'string'
          ? product.availableSizes.split(',').map((s: string) => s.trim()).filter(Boolean)
          : [];
      const known = sizes.filter((s) => ALL_SIZES.includes(s));
      const extra = sizes.filter((s) => !ALL_SIZES.includes(s));
      const colors: string[] = Array.isArray(product.availableColors)
        ? product.availableColors
        : typeof product.availableColors === 'string'
          ? product.availableColors.split(',').map((s: string) => s.trim()).filter(Boolean)
          : [];
      let isNew = false;
      let duration = '7';
      if (product.newArrivalExpiresAt) {
        const expiry = new Date(product.newArrivalExpiresAt);
        if (expiry > new Date()) {
          isNew = true;
          const days = Math.round((expiry.getTime() - Date.now()) / 86400000);
          duration = String(Math.min(30, Math.max(3, days)));
        }
      }
      setForm({
        name: product.name ?? '',
        price: product.price != null ? String(product.price) : '',
        category: product.category ?? Object.keys(MAIN_CATEGORIES)[0],
        subCategory: product.subCategory ?? '',
        sizes: known,
        colors: colors.join(', '),
        image: product.image ?? '',
        isNewArrival: isNew,
        newArrivalDuration: duration,
      });
      setExtraSizes(extra);
    } else {
      setForm(BLANK);
      setExtraSizes([]);
    }
    setImageFile(null);
    setError(null);
  }, [product]);

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const toggleSize = (s: string) =>
    set(
      'sizes',
      form.sizes.includes(s) ? form.sizes.filter((x) => x !== s) : [...form.sizes, s]
    );

  const toggleExtraSize = (s: string) =>
    setExtraSizes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const allSizes = [...new Set([...ALL_SIZES, ...extraSizes])];

  const handleFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    e.target.value = '';
    if (!picked) return;
    setImageFile(picked);
  };

  const uploadImage = async (): Promise<string> => {
    if (!imageFile) return form.image;
    setUploading(true);
    try {
      const uploaded = await storage.createFile(appwriteConfig.bucketId, ID.unique(), imageFile);
      return storage.getFileView(appwriteConfig.bucketId, uploaded.$id).toString();
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Product name is required.');
    if (!form.price || isNaN(+form.price)) return setError('A valid price is required.');
    if (!product && !imageFile) return setError('Please select an image file.');
    setError(null);
    setSaving(true);
    try {
      const image = await uploadImage();
      const sizes = [...form.sizes, ...extraSizes];
      let newArrivalExpiresAt: string | null = null;
      if (form.isNewArrival) {
        const days = parseInt(form.newArrivalDuration);
        if (!isNaN(days)) {
          const expiry = new Date();
          expiry.setDate(expiry.getDate() + days);
          newArrivalExpiresAt = expiry.toISOString();
        }
      }
      await onSave({
        name: form.name.trim(),
        price: Number(form.price),
        category: form.category,
        subCategory: form.subCategory,
        image: image || (product?.image ?? ''),
        availableSizes: sizes,
        availableColors: form.colors
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean),
        newArrivalExpiresAt,
      });
      onClose();
    } catch (err: any) {
      setError(err.message);
      push({ title: 'Save failed', message: err.message, tone: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const subCategories = MAIN_CATEGORIES[form.category] ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-line bg-panel shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="text-lg font-bold">{product ? 'Edit Product' : 'Add New Product'}</h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:bg-card hover:text-cream"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable form body */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
          <form onSubmit={handleSubmit} className="space-y-5 p-6">
            {error && (
              <div className="rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-brand">
                {error}
              </div>
            )}

            {/* Name + Price */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Product Name" required>
                <input
                  className={inputCls}
                  placeholder="e.g. Vintage Wash Wrapper"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                />
              </Field>
              <Field label="Price (₦)" required>
                <input
                  className={inputCls}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={form.price}
                  onChange={(e) => set('price', e.target.value)}
                />
              </Field>
            </div>

            {/* Category + Sub Category */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category">
                <select
                  className={inputCls}
                  value={form.category}
                  onChange={(e) => {
                    const cat = e.target.value;
                    setForm((f) => ({
                      ...f,
                      category: cat,
                      subCategory: (MAIN_CATEGORIES[cat] ?? [])[0] ?? '',
                    }));
                  }}
                  style={{ background: '#0a0a0a' }}
                >
                  {Object.keys(MAIN_CATEGORIES).map((c) => (
                    <option key={c} value={c} style={{ background: '#101010' }}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Sub Category">
                <select
                  className={inputCls}
                  value={form.subCategory}
                  onChange={(e) => set('subCategory', e.target.value)}
                  style={{ background: '#0a0a0a' }}
                  disabled={subCategories.length === 0}
                >
                  {subCategories.length === 0 ? (
                    <option value="" style={{ background: '#101010' }}>
                      None
                    </option>
                  ) : (
                    subCategories.map((sc) => (
                      <option key={sc} value={sc} style={{ background: '#101010' }}>
                        {sc}
                      </option>
                    ))
                  )}
                </select>
              </Field>
            </div>

            {/* Image */}
            <Field label="Product Image">
              {imageFile ? (
                <div className="flex items-center gap-3 rounded-xl border border-line bg-card px-4 py-3">
                  <ImagePlus className="h-5 w-5 shrink-0 text-brand" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{imageFile.name}</p>
                    <p className="text-xs text-muted">{Math.round(imageFile.size / 1024)} KB</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setImageFile(null)}
                    className="shrink-0 text-muted transition-colors hover:text-brand"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full items-center gap-3 rounded-xl border border-dashed border-line bg-card px-4 py-3 text-muted transition-colors hover:border-brand/50 hover:text-cream"
                >
                  {form.image ? (
                    <img
                      src={form.image}
                      alt=""
                      className="h-10 w-10 shrink-0 rounded-lg border border-line object-cover"
                    />
                  ) : (
                    <ImagePlus className="h-5 w-5 shrink-0" />
                  )}
                  <span className="text-sm font-semibold">
                    {form.image ? 'Replace image' : 'Upload image'}
                  </span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFilePicked}
              />
            </Field>

            {/* Sizes */}
            <Field label="Available Sizes">
              <div className="mt-1 flex flex-wrap gap-2">
                {allSizes.map((s) => {
                  const active = form.sizes.includes(s) || extraSizes.includes(s);
                  const isExtra = extraSizes.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => (isExtra ? toggleExtraSize(s) : toggleSize(s))}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${
                        active
                          ? 'border-brand bg-brand/15 text-brand'
                          : 'border-line bg-card text-muted hover:border-brand/40 hover:text-cream'
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </Field>

            {/* Colors */}
            <Field label="Available Colors">
              <input
                className={inputCls}
                placeholder="e.g. Black, White"
                value={form.colors}
                onChange={(e) => set('colors', e.target.value)}
              />
            </Field>

            {/* New Arrival */}
            <Field label="New Arrival">
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.isNewArrival}
                  onClick={() => set('isNewArrival', !form.isNewArrival)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    form.isNewArrival ? 'bg-brand' : 'bg-card-2'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full shadow-md transition-transform duration-200 ${
                      form.isNewArrival ? 'translate-x-6 bg-ink' : 'translate-x-1 bg-white'
                    }`}
                  />
                </button>
                <span className="text-sm text-muted">
                  {form.isNewArrival ? 'Badged as New Arrival' : 'Not a new arrival'}
                </span>
              </div>
            </Field>

            {form.isNewArrival && (
              <Field label="New Arrival Duration">
                <select
                  className={inputCls}
                  value={form.newArrivalDuration}
                  onChange={(e) => set('newArrivalDuration', e.target.value)}
                  style={{ background: '#0a0a0a' }}
                >
                  <option value="3" style={{ background: '#101010' }}>3 Days</option>
                  <option value="7" style={{ background: '#101010' }}>7 Days</option>
                  <option value="14" style={{ background: '#101010' }}>14 Days</option>
                  <option value="30" style={{ background: '#101010' }}>30 Days</option>
                </select>
              </Field>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-line py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-card hover:text-cream"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || uploading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand py-2.5 text-sm font-semibold text-ink shadow-lg shadow-white/15 transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {(saving || uploading) && <Loader2 className="h-4 w-4 animate-spin" />}
                {uploading ? 'Uploading…' : saving ? 'Saving…' : product ? 'Save Changes' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
