import { Query } from 'appwrite';
import { databases, appwriteConfig, isAppwriteConfigured } from './appwrite';
import { getMarketVendorProducts } from './vendors';

export interface Product {
  id: string;
  name: string;
  category: string;
  subCategory?: string;
  price: number;
  salePrice?: number | null;
  image: string | null;
  availableSizes: string[];
  availableColors: string[];
  brand?: string;
  rating?: number | null;
  featured?: boolean;
  newArrivalExpiresAt?: string | null;
  description?: string;
  // Set when the product belongs to a vendor storefront rather than the house.
  vendorId?: string;
  vendorSlug?: string;
  vendorName?: string;
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

function normalize(doc: any): Product {
  const category = String(doc.category ?? '').trim() || 'Other';
  const sizes = toStringArray(doc.availableSizes);
  return {
    id: doc.$id,
    name: doc.name ?? 'Untitled Piece',
    category,
    subCategory: doc.subCategory || undefined,
    price: Number(doc.price ?? 0),
    salePrice:
      doc.salePrice == null || doc.salePrice === '' ? null : Number(doc.salePrice),
    image: doc.image || null,
    availableSizes: sizes.length ? sizes : ['One Size'],
    availableColors: toStringArray(doc.availableColors),
    brand: doc.brand || undefined,
    rating: doc.rating == null || doc.rating === '' ? null : Number(doc.rating),
    featured: Boolean(doc.featured),
    newArrivalExpiresAt: doc.newArrivalExpiresAt ?? null,
    description: doc.description || undefined,
  };
}

async function getHouseProducts(): Promise<Product[]> {
  if (!isAppwriteConfigured || !appwriteConfig.databaseId || !appwriteConfig.productsCollectionId) {
    return [];
  }

  try {
    const res = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.productsCollectionId,
      [Query.limit(200)]
    );
    return res.documents.map(normalize);
  } catch (err) {
    console.warn('Products collection unavailable:', (err as any)?.message);
    return [];
  }
}

function vendorToProduct(p: Awaited<ReturnType<typeof getMarketVendorProducts>>[number]): Product {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    subCategory: p.subCategory,
    price: p.price,
    salePrice: null,
    image: p.image,
    availableSizes: p.availableSizes.length ? p.availableSizes : ['One Size'],
    availableColors: p.availableColors,
    description: p.description,
    vendorId: p.vendor.id,
    vendorSlug: p.vendor.slug,
    vendorName: p.vendor.businessName,
  };
}

export async function getProducts({
  search = '',
} : { search?: string } = {}): Promise<Product[]> {
  const [house, vendorItems] = await Promise.all([
    getHouseProducts(),
    getMarketVendorProducts().catch(() => []),
  ]);
  let items = [...house, ...vendorItems.map(vendorToProduct)];

  if (search) {
    const q = search.toLowerCase();
    items = items.filter((p) =>
      `${p.name} ${p.brand ?? ''} ${p.vendorName ?? ''}`.toLowerCase().includes(q)
    );
  }
  return items;
}

export function isNewArrival(p: Product, now = new Date()): boolean {
  if (!p.newArrivalExpiresAt) return false;
  return new Date(p.newArrivalExpiresAt) > now;
}

export const MAIN_CATEGORIES: Record<string, string[]> = {
  Fabric: ['Wrappers', 'Textiles'],
  'Casual wears': ['T-Shirts', 'Joggers', 'Jeans'],
  'Corporate wear': ['French suits', 'Ties', 'Suits', 'Coats'],
  'Sewn wears': [],
  Shoes: [],
};
