import { ID, Permission, Query, Role, TablesDB } from 'appwrite';
import { account, appwriteConfig, client, storage } from './appwrite';
import { toVendorProduct, type VendorProduct } from './vendors';

const tablesDB = new TablesDB(client);

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// Authenticated calls to /api/*: attaches a short-lived JWT when the visitor is
// signed in; guests send no header and get the API's 401.
export async function apiFetch<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body) headers.set('Content-Type', 'application/json');
  try {
    const jwt = await account.createJWT();
    headers.set('Authorization', `Bearer ${jwt.jwt}`);
  } catch {
    // not signed in
  }
  const res = await fetch(`/api${path}`, { ...init, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error ?? 'Something went wrong');
  return data as T;
}

export interface VendorMe {
  vendor: {
    vendorId: string;
    slug: string;
    businessName: string;
    bio: string | null;
    category: string | null;
    logoUrl: string | null;
    featured: boolean;
    status: string;
  };
  liveStatus: 'active' | 'pending' | 'suspended' | 'expired';
  plan: 'starter' | 'business' | 'commission';
  planExpiresAt: string | null;
  paymentStatus: string;
  commissionRate: number | null;
  commissionTerms: string | null;
  whatsapp: string;
  payments: {
    $id: string;
    plan: string;
    amount: number;
    reference: string;
    status: string;
    $createdAt: string;
    verifiedAt: string | null;
    note: string | null;
  }[];
  commissions: {
    $id: string;
    reference: string;
    saleAmount: number;
    rate: number;
    commissionAmount: number;
    status: string;
    $createdAt: string;
    settledAt: string | null;
  }[];
  featuredPromotions: {
    $id: string;
    kind: string;
    productId: string | null;
    note: string | null;
    $createdAt: string;
  }[];
}

export function getMyVendor() {
  return apiFetch<VendorMe>('/vendor/me');
}

export interface VendorProductInput {
  name: string;
  description?: string;
  price: number;
  image: string;
  category: string;
  subCategory?: string;
  availableSizes: string[];
  availableColors?: string[];
}

// Rows are created client-side against vendor_products (rowSecurity). The row
// permissions make it world-readable but editable/deletable only by its owner;
// public display additionally goes through /api/vendor-products which verifies
// ownerUserId against the vendor record server-side.
export async function createVendorProduct(vendorId: string, input: VendorProductInput) {
  const me = await account.get();
  const row = await tablesDB.createRow({
    databaseId: appwriteConfig.databaseId,
    tableId: 'vendor_products',
    rowId: ID.unique(),
    data: {
      vendorId,
      ownerUserId: me.$id,
      name: input.name,
      description: input.description ?? null,
      price: input.price,
      image: input.image,
      category: input.category,
      subCategory: input.subCategory ?? null,
      availableSizes: input.availableSizes,
      availableColors: input.availableColors ?? [],
    },
    permissions: [
      Permission.read(Role.any()),
      Permission.update(Role.user(me.$id)),
      Permission.delete(Role.user(me.$id)),
    ],
  });
  return toVendorProduct(row);
}

export async function updateVendorProduct(rowId: string, input: VendorProductInput) {
  const row = await tablesDB.updateRow({
    databaseId: appwriteConfig.databaseId,
    tableId: 'vendor_products',
    rowId,
    data: {
      name: input.name,
      description: input.description ?? null,
      price: input.price,
      image: input.image,
      category: input.category,
      subCategory: input.subCategory ?? null,
      availableSizes: input.availableSizes,
      availableColors: input.availableColors ?? [],
    },
  });
  return toVendorProduct(row);
}

export async function deleteVendorProduct(rowId: string) {
  await tablesDB.deleteRow({
    databaseId: appwriteConfig.databaseId,
    tableId: 'vendor_products',
    rowId,
  });
}

export async function listMyProducts(vendorId: string): Promise<VendorProduct[]> {
  const me = await account.get();
  const res = await tablesDB.listRows({
    databaseId: appwriteConfig.databaseId,
    tableId: 'vendor_products',
    queries: [
      Query.equal('vendorId', vendorId),
      Query.equal('ownerUserId', me.$id),
      Query.limit(100),
    ],
  });
  return (res.rows ?? []).map(toVendorProduct);
}

export async function uploadProductImage(file: File): Promise<string> {
  const created = await storage.createFile(appwriteConfig.bucketId, ID.unique(), file);
  return productImageUrl(created.$id)!;
}

export function productImageUrl(fileId: string): string | null {
  if (!fileId) return null;
  return `${import.meta.env.VITE_APPWRITE_ENDPOINT}/storage/buckets/${appwriteConfig.bucketId}/files/${fileId}/view?project=${import.meta.env.VITE_APPWRITE_PROJECT_ID}`;
}

export async function uploadLogo(file: File): Promise<string> {
  const created = await storage.createFile(appwriteConfig.bucketId, ID.unique(), file);
  return created.$id;
}
