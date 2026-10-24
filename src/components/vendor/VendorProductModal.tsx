import { useEffect, useRef, useState } from 'react';
import { X, Loader2, ImagePlus, Plus } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { uploadProductImage, type VendorProductInput } from '../../lib/vendorClient';
import type { VendorProduct } from '../../lib/vendors';

const SIZE_CHIPS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];

const CATEGORY_SUGGESTIONS = [
  'Clothing',
  'Fabric',
  'Shoes',
  'Skincare',
  'Hair & Beauty',
  'Jewelry & Accessories',
  'Art & Craft',
  'Food & Snacks',
  'Home & Living',
  'Gadgets',
];

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

export default function VendorProductModal({
  product,
  onClose,
  onSave,
}: {
  product: VendorProduct | null;
  onClose: () => void;
  onSave: (input: VendorProductInput) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [description, setDescription] = useState('');
  const [sizes, setSizes] = useState<string[]>(['One Size']);
  const [customSize, setCustomSize] = useState('');
  const [colors, setColors] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { push } = useToast();

  useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice(String(product.price));
      setCategory(product.category);
      setSubCategory(product.subCategory ?? '');
      setDescription(product.description ?? '');
      setSizes(product.availableSizes.length ? product.availableSizes : ['One Size']);
      setColors(product.availableColors.join(', '));
      setImagePreview(product.image);
    } else {
      setName('');
      setPrice('');
      setCategory('');
      setSubCategory('');
      setDescription('');
      setSizes(['One Size']);
      setColors('');
      setImagePreview(null);
    }
    setImageFile(null);
    setCustomSize('');
    setError(null);
  }, [product]);

  function pickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    e.target.value = '';
    if (!picked) return;
    setImageFile(picked);
    setImagePreview(URL.createObjectURL(picked));
  }

  function addCustomSize() {
    const s = customSize.trim().slice(0, 50);
    if (!s || sizes.includes(s)) return;
    setSizes((prev) => [...prev, s]);
    setCustomSize('');
  }

  function toggleSize(s: string) {
    setSizes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) return setError('Product name must be at least 2 characters.');
    const value = Number(price);
    if (!Number.isFinite(value) || value <= 0) return setError('Enter a valid price.');
    if (!category.trim()) return setError('A category is required.');
    if (!product && !imageFile) return setError('Please select a product image.');
    const finalSizes = sizes.length ? sizes : ['One Size'];
    setError(null);
    setSaving(true);
    try {
      const image = imageFile ? await uploadProductImage(imageFile) : imagePreview ?? '';
      await onSave({
        name: name.trim(),
        description: description.trim() || undefined,
        price: value,
        image,
        category: category.trim(),
        subCategory: subCategory.trim() || undefined,
        availableSizes: finalSizes,
        availableColors: colors
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean),
      });
      onClose();
    } catch (err: any) {
      const msg = err.message ?? 'Could not save the product.';
      setError(msg);
      push({ title: 'Save failed', message: msg, tone: 'error' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-line bg-panel shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="text-lg font-bold">{product ? 'Edit Product' : 'Add Product'}</h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:bg-card hover:text-cream"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
          <form onSubmit={handleSubmit} className="space-y-5 p-6">
            {error && (
              <div className="rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-brand">
                {error}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Product Name" required>
                <input className={inputCls} maxLength={120} placeholder="e.g. Handwoven Basket" value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
              <Field label="Price (₦)" required>
                <input className={inputCls} type="number" min="0" step="0.01" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category" required>
                <input className={inputCls} maxLength={100} list="vendor-category-options" placeholder="e.g. Skincare" value={category} onChange={(e) => setCategory(e.target.value)} />
                <datalist id="vendor-category-options">
                  {CATEGORY_SUGGESTIONS.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </Field>
              <Field label="Sub-category">
                <input className={inputCls} maxLength={100} placeholder="Optional" value={subCategory} onChange={(e) => setSubCategory(e.target.value)} />
              </Field>
            </div>

            <Field label="Description">
              <textarea className={inputCls} rows={3} maxLength={2000} placeholder="What is it, what is it made of, what makes it worth buying?" value={description} onChange={(e) => setDescription(e.target.value)} />
            </Field>

            <Field label="Product Image" required={!product}>
              {imagePreview && !imageFile ? (
                <div className="flex items-center gap-3 rounded-xl border border-line bg-card px-4 py-3">
                  <img src={imagePreview} alt="" className="h-10 w-10 shrink-0 rounded-lg border border-line object-cover" />
                  <span className="flex-1 truncate text-sm">Current image</span>
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="shrink-0 text-xs font-bold text-brand hover:underline">
                    Replace
                  </button>
                </div>
              ) : imageFile ? (
                <div className="flex items-center gap-3 rounded-xl border border-line bg-card px-4 py-3">
                  <img src={imagePreview ?? ''} alt="" className="h-10 w-10 shrink-0 rounded-lg border border-line object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{imageFile.name}</p>
                    <p className="text-xs text-muted">{Math.round(imageFile.size / 1024)} KB</p>
                  </div>
                  <button type="button" onClick={() => { setImageFile(null); setImagePreview(product?.image ?? null); }} className="shrink-0 text-muted transition-colors hover:text-brand">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => fileInputRef.current?.click()} className="flex w-full items-center gap-3 rounded-xl border border-dashed border-line bg-card px-4 py-3 text-muted transition-colors hover:border-brand/50 hover:text-cream">
                  <ImagePlus className="h-5 w-5 shrink-0" />
                  <span className="text-sm font-semibold">Upload image</span>
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={pickImage} />
            </Field>

            <Field label="Available Sizes">
              <div className="mt-1 flex flex-wrap gap-2">
                {[...new Set([...SIZE_CHIPS, ...sizes])].map((s) => {
                  const active = sizes.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSize(s)}
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
              <div className="mt-2 flex gap-2">
                <input
                  className={`${inputCls} flex-1`}
                  placeholder="Add a size (e.g. 42, Free size)"
                  value={customSize}
                  onChange={(e) => setCustomSize(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomSize();
                    }
                  }}
                />
                <button type="button" onClick={addCustomSize} className="grid w-11 shrink-0 place-items-center rounded-xl border border-line text-muted transition-colors hover:border-brand/40 hover:text-cream" aria-label="Add size">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              {sizes.length === 0 && (
                <p className="mt-1.5 text-[11px] text-muted">No sizes selected — buyers will see "One Size".</p>
              )}
            </Field>

            <Field label="Available Colors">
              <input className={inputCls} placeholder="e.g. Black, White" value={colors} onChange={(e) => setColors(e.target.value)} />
            </Field>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-line py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-card hover:text-cream">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand py-2.5 text-sm font-semibold text-ink shadow-lg shadow-white/15 transition-opacity hover:opacity-90 disabled:opacity-60">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? 'Saving…' : product ? 'Save Changes' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
