import { cached, TTL } from './cache';

export interface Vendor {
  id: string;
  slug: string;
  businessName: string;
  bio?: string;
  category?: string;
  logoUrl?: string | null;
  featured: boolean;
}

export interface VendorProduct {
  id: string;
  vendorId: string;
  name: string;
  description?: string;
  price: number;
  image: string | null;
  category: string;
  subCategory?: string;
  availableSizes: string[];
  availableColors: string[];
  soldOut?: boolean;
}

export interface MarketVendorProduct extends VendorProduct {
  vendor: { id: string; slug: string; businessName: string; featured: boolean };
}

export interface VendorStoreCategory {
  id: string;
  name: string;
  subCategories: string[];
  description?: string;
  vendorId?: string;
  order?: number;
}

export interface VendorContact {
  locked: boolean;
  reason?: 'unavailable' | 'starter' | 'expired';
  message?: string;
  whatsapp?: string;
  businessName?: string;
}

export type VendorPlan = 'starter' | 'business' | 'commission';

// Mirrors PLAN_PRICES in api/_lib/validate.js — the API re-checks every amount.
export const PLAN_PRICES: Record<'starter' | 'business', number> = {
  starter: 3000,
  business: 4000,
};

async function getJSON<T>(path: string): Promise<T | null> {
  // One retry on server/network failures — a transient blip should not read
  // as "not found". Genuine 4xx responses return immediately.
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(path, { signal: AbortSignal.timeout(15000) });
      if (res.ok) return await res.json();
      if (res.status < 500) return null;
    } catch {
      // network failure — retry once
    }
    if (attempt === 0) await new Promise((r) => setTimeout(r, 1500));
  }
  return null;
}

function mapVendor(v: any): Vendor {
  return {
    id: v.vendorId ?? v.id,
    slug: v.slug,
    businessName: v.businessName,
    bio: v.bio || undefined,
    category: v.category || undefined,
    logoUrl: v.logoUrl ?? null,
    featured: Boolean(v.featured),
  };
}

export function toVendorProduct(row: any): VendorProduct {
  return {
    id: row.$id,
    vendorId: row.vendorId,
    name: row.name ?? 'Untitled Piece',
    description: row.description || undefined,
    price: Number(row.price ?? 0),
    image: row.image || null,
    category: String(row.category ?? 'Other'),
    subCategory: row.subCategory || undefined,
    availableSizes: toStringArray(row.availableSizes),
    availableColors: toStringArray(row.availableColors),
    soldOut: Boolean(row.soldOut),
  };
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v));
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map((v) => String(v));
    } catch {
      return value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return [];
}

export async function getVendors(): Promise<Vendor[]> {
  const data = await getJSON<{ vendors: Vendor[] }>('/api/vendors');
  return (data?.vendors ?? []).map(mapVendor);
}

export async function getVendor(idOrSlug: string): Promise<Vendor | null> {
  const data = await getJSON<{ vendor?: Vendor }>(`/api/vendors/${encodeURIComponent(idOrSlug)}`);
  return data?.vendor ? mapVendor(data.vendor) : null;
}

export async function getVendorContact(idOrSlug: string): Promise<VendorContact | null> {
  return getJSON<VendorContact>(`/api/vendors/${encodeURIComponent(idOrSlug)}/contact`);
}

export async function getMarketVendorProducts(
  vendor?: string
): Promise<{ products: MarketVendorProduct[]; categories: VendorStoreCategory[] }> {
  const key = `vendor-products:${vendor ?? 'all'}`;
  return cached(key, TTL.products, async () => {
    const qs = vendor ? `?vendor=${encodeURIComponent(vendor)}` : '';
    const data = await getJSON<{ products: any[]; categories?: any[] }>(
      `/api/vendor-products${qs}`
    );
    const products = (data?.products ?? []).map((p) => ({
      ...toVendorProduct(p),
      vendor: p.vendor,
    }));
    const categories = (data?.categories ?? []).map((c) => ({
      id: String(c.id ?? c.name),
      name: String(c.name ?? ''),
      subCategories: Array.isArray(c.subCategories) ? c.subCategories.map(String) : [],
      description: c.description || undefined,
      vendorId: c.vendorId || undefined,
      order: c.order == null ? undefined : Number(c.order),
    }));
    return { products, categories };
  });
}
