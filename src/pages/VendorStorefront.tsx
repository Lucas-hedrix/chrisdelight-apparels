import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, BadgeCheck, Lock, MessageCircle, SearchX, Store } from 'lucide-react';
import { getMarketVendorProducts, getVendor, getVendorContact, type MarketVendorProduct, type Vendor, type VendorContact, type VendorStoreCategory } from '../lib/vendors';
import { fmt } from '../lib/format';
import CategoryChips from '../components/CategoryChips';

const ALL_OPTIONS = [{ id: 'all', label: 'All' }];

export default function VendorStorefront() {
  const { slug = '' } = useParams();
  const [vendor, setVendor] = useState<Vendor | null | undefined>(undefined);
  const [products, setProducts] = useState<MarketVendorProduct[] | null>(null);
  const [categories, setCategories] = useState<VendorStoreCategory[]>([]);
  const [contact, setContact] = useState<VendorContact | null>(null);
  const [category, setCategory] = useState('all');
  const [subCategory, setSubCategory] = useState('all');

  useEffect(() => {
    let active = true;
    setVendor(undefined);
    setProducts(null);
    setCategories([]);
    setContact(null);
    setCategory('all');
    setSubCategory('all');
    getVendor(slug).then((v) => {
      if (!active) return;
      setVendor(v);
      if (v) {
        getVendorContact(slug).then((c) => active && setContact(c));
        getMarketVendorProducts(slug).then((r) => {
          if (!active) return;
          setProducts(r.products);
          setCategories(r.categories);
        });
      }
    });
    return () => {
      active = false;
    };
  }, [slug]);

  const categoryOptions = useMemo(() => {
    const names: string[] = [];
    const seen = new Set<string>();
    for (const c of categories) {
      if (c.name && !seen.has(c.name.toLowerCase())) {
        seen.add(c.name.toLowerCase());
        names.push(c.name);
      }
    }
    for (const p of products ?? []) {
      if (p.category && !seen.has(p.category.toLowerCase())) {
        seen.add(p.category.toLowerCase());
        names.push(p.category);
      }
    }
    return [...ALL_OPTIONS, ...names.map((n) => ({ id: n, label: n }))];
  }, [categories, products]);

  const subs = useMemo(() => {
    if (category === 'all') return [];
    const fromTable =
      categories.find((c) => c.name.toLowerCase() === category.toLowerCase())?.subCategories ?? [];
    const fromProducts = (products ?? [])
      .filter((p) => p.category.toLowerCase() === category.toLowerCase() && p.subCategory)
      .map((p) => p.subCategory as string);
    return [...new Set([...fromTable, ...fromProducts])];
  }, [category, categories, products]);

  const filtered = useMemo(() => {
    if (!products) return [];
    let out =
      category === 'all'
        ? products
        : products.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    if (subCategory !== 'all')
      out = out.filter((p) => (p.subCategory ?? '').toLowerCase() === subCategory.toLowerCase());
    return out;
  }, [products, category, subCategory]);

  const handleCategory = (id: string) => {
    setCategory(id);
    setSubCategory('all');
  };

  if (vendor === undefined) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-brand" />
      </div>
    );
  }

  if (vendor === null) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-card-2 text-muted">
          <SearchX className="h-7 w-7" />
        </div>
        <h1 className="font-display text-3xl tracking-wide">STORE NOT FOUND</h1>
        <p className="max-w-md text-sm leading-relaxed text-muted">
          This store doesn't exist or isn't open right now.
        </p>
        <Link
          to="/vendors"
          className="mt-2 flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-brand-strong"
        >
          Browse all vendors
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const initial = vendor.businessName.trim().charAt(0).toUpperCase() || '?';
  const waLink = contact && !contact.locked && contact.whatsapp
    ? `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(`Hi ${contact.businessName ?? vendor.businessName}, I found your store on Cybernexus.`)}`
    : null;

  return (
    <div className="mx-auto max-w-6xl">
      <header className="relative overflow-hidden rounded-3xl border border-line bg-card p-6 sm:p-10">
        <div className="glow-circle pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full" />
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          {vendor.logoUrl ? (
            <img
              src={vendor.logoUrl}
              alt={vendor.businessName}
              className="h-24 w-24 shrink-0 rounded-3xl border border-line object-cover"
            />
          ) : (
            <div className="grid h-24 w-24 shrink-0 place-items-center rounded-3xl bg-card-2 font-display text-4xl text-brand">
              {initial}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-3xl tracking-wide sm:text-4xl">{vendor.businessName}</h1>
              {vendor.featured && (
                <span className="flex items-center gap-1 rounded-full bg-brand px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-ink">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Featured
                </span>
              )}
            </div>
            {vendor.category && <p className="mt-1 text-sm text-muted">{vendor.category}</p>}
            {vendor.bio && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{vendor.bio}</p>}
          </div>
        </div>

        <div className="mt-6 border-t border-line pt-5">
          {waLink ? (
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold text-ink transition-colors hover:bg-brand-strong"
              >
                <MessageCircle className="h-4 w-4" />
                Contact on WhatsApp
              </a>
              <span className="text-xs text-muted">Chat with {vendor.businessName} directly about anything you see here.</span>
            </div>
          ) : contact?.locked ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-bold text-muted">
                <Lock className="h-4 w-4" />
                WhatsApp contact
                <span className="select-none blur-[5px]" aria-hidden="true">
                  +234 801 234 5678
                </span>
              </span>
              <span className="max-w-md text-xs leading-relaxed text-muted">{contact.message}</span>
            </div>
          ) : null}
        </div>
      </header>

      <section className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl tracking-wide">PRODUCTS</h2>
          {products !== null && products.length > 0 && (
            <p className="text-sm text-muted">
              {filtered.length === products.length
                ? `${products.length} piece${products.length === 1 ? '' : 's'}`
                : `${filtered.length} of ${products.length} pieces`}
            </p>
          )}
        </div>

        {products !== null && products.length > 0 && (
          <div className="mt-4">
            <CategoryChips value={category} onChange={handleCategory} options={categoryOptions} />
          </div>
        )}

        {subs.length > 0 && (
          <div className="mt-3">
            <CategoryChips
              value={subCategory}
              onChange={setSubCategory}
              options={[
                { id: 'all', label: `All ${category}` },
                ...subs.map((s) => ({ id: s, label: s })),
              ]}
              layoutId="sub-chip-store"
            />
          </div>
        )}

        {products === null ? (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-3xl border border-line bg-card" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="mt-8 flex flex-col items-center gap-3 rounded-3xl border border-line bg-card p-10 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-card-2 text-muted">
              <Store className="h-6 w-6" />
            </div>
            <h3 className="font-bold">No products listed yet</h3>
            <p className="text-sm text-muted">This store is setting up — check back soon.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-8 flex flex-col items-center gap-3 rounded-3xl border border-line bg-card p-10 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-card-2 text-muted">
              <SearchX className="h-6 w-6" />
            </div>
            <h3 className="font-bold">Nothing here yet</h3>
            <p className="text-sm text-muted">
              No pieces in this selection — try another category.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p, i) => (
              <StoreProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </section>

      <div className="mt-14 rounded-3xl border border-line bg-card p-6 sm:p-8">
        <p className="text-sm leading-relaxed text-muted">
          <span className="font-bold text-cream">Shopping from an independent vendor.</span> Orders
          made through this storefront are handled by {vendor.businessName}. Cybernexus provides the
          platform and is not a party to vendor sales.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/vendors"
            className="rounded-full border border-line px-5 py-2.5 text-sm font-bold text-cream transition-colors hover:border-brand/40"
          >
            More vendors
          </Link>
          <Link
            to="/sell"
            className="rounded-full border border-line px-5 py-2.5 text-sm font-bold text-cream transition-colors hover:border-brand/40"
          >
            Become a Vendor
          </Link>
        </div>
      </div>
    </div>
  );
}

function StoreProductCard({ product, index }: { product: MarketVendorProduct; index: number }) {
  const sizes = product.availableSizes.length ? product.availableSizes : ['One Size'];
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: (index % 3) * 0.08, ease: 'easeOut' }}
      className="rounded-3xl border border-line bg-card p-3"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-card-2">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-muted">
            <Store className="h-8 w-8" />
          </div>
        )}
        <span className="absolute right-3 top-3 rounded-full border border-line bg-ink/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-muted backdrop-blur">
          {(product.subCategory ?? product.category).toUpperCase()}
        </span>
      </div>
      <div className="px-2 pb-2 pt-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 truncate font-bold">{product.name}</h3>
          <div className="shrink-0 font-display text-2xl text-brand">{fmt(product.price)}</div>
        </div>
        {product.description && (
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted">{product.description}</p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {sizes.map((s) => (
            <span key={s} className="rounded-lg border border-line px-2 py-0.5 text-[11px] font-semibold text-muted">
              {s}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  );
}
