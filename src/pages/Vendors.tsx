import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, BadgeCheck, Store } from 'lucide-react';
import { getVendors, type Vendor } from '../lib/vendors';
import SkeletonCard from '../components/SkeletonCard';

export default function Vendors() {
  const [vendors, setVendors] = useState<Vendor[] | null>(null);

  useEffect(() => {
    let active = true;
    getVendors().then((v) => {
      if (active) setVendors(v);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <h1 className="font-display text-4xl tracking-wide">VENDOR DIRECTORY</h1>
      <p className="mt-1 text-sm text-muted">
        {vendors ? `${vendors.length} store${vendors.length === 1 ? '' : 's'} on Cybernexus` : 'Loading stores...'}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {vendors === null
          ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
          : vendors.map((v, i) => <VendorCard key={v.id} vendor={v} index={i} />)}
      </div>

      {vendors !== null && vendors.length === 0 && (
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-card-2 text-muted">
            <Store className="h-7 w-7" />
          </div>
          <h3 className="font-bold">No stores yet</h3>
          <p className="max-w-md text-sm leading-relaxed text-muted">
            The vendor spaces are open — your business could be the first storefront here.
          </p>
          <Link
            to="/sell"
            className="mt-2 flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-brand-strong"
          >
            Become a Vendor
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}

function VendorCard({ vendor, index }: { vendor: Vendor; index: number }) {
  const initial = vendor.businessName.trim().charAt(0).toUpperCase() || '?';
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: (index % 3) * 0.08, ease: 'easeOut' }}
      className="group rounded-3xl border border-line bg-card p-6 transition-colors hover:border-brand/40"
    >
      <div className="flex items-start gap-4">
        {vendor.logoUrl ? (
          <img
            src={vendor.logoUrl}
            alt={vendor.businessName}
            loading="lazy"
            className="h-14 w-14 shrink-0 rounded-2xl border border-line object-cover"
          />
        ) : (
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-card-2 font-display text-2xl text-brand">
            {initial}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-bold">{vendor.businessName}</h3>
            {vendor.featured && <BadgeCheck className="h-4 w-4 shrink-0 text-brand" aria-label="Featured vendor" />}
          </div>
          {vendor.category && <p className="mt-0.5 truncate text-xs text-muted">{vendor.category}</p>}
        </div>
      </div>

      {vendor.bio && <p className="mt-4 line-clamp-3 text-xs leading-relaxed text-muted">{vendor.bio}</p>}

      <Link
        to={`/vendors/${vendor.slug}`}
        className="mt-5 flex items-center justify-center gap-2 rounded-full border border-brand/60 bg-brand/10 px-5 py-2.5 text-sm font-bold text-brand transition-colors hover:bg-brand/20"
      >
        Visit Store
        <ArrowRight className="h-4 w-4" />
      </Link>
    </motion.div>
  );
}
