import { ID, Query } from 'appwrite';
import { databases, appwriteConfig, isAppwriteConfigured } from './appwrite';
import { invalidate } from './cache';

const db = appwriteConfig.databaseId;
const prod = appwriteConfig.productsCollectionId;
const ord = appwriteConfig.ordersCollectionId;

function check(colId: string) {
  if (!isAppwriteConfigured || !db || !colId)
    throw new Error('Appwrite is not fully configured. Check your .env file.');
}

export interface AdminProductData {
  name: string;
  price: number;
  category: string;
  subCategory: string;
  image: string;
  availableSizes: string[];
  availableColors: string[];
  newArrivalExpiresAt?: string | null;
  soldOut?: boolean;
}

// ── Products ─────────────────────────────────────────────────────────────────

export async function adminListProducts() {
  check(prod);
  const res = await databases.listDocuments(db, prod, [
    Query.limit(200),
    Query.orderDesc('$createdAt'),
  ]);
  return res.documents;
}

export async function adminCreateProduct(data: AdminProductData) {
  check(prod);
  const res = await databases.createDocument(db, prod, ID.unique(), data);
  invalidate('products');
  return res;
}

export async function adminUpdateProduct(id: string, data: AdminProductData) {
  check(prod);
  const res = await databases.updateDocument(db, prod, id, data);
  invalidate('products');
  return res;
}

export async function adminDeleteProduct(id: string) {
  check(prod);
  const res = await databases.deleteDocument(db, prod, id);
  invalidate('products');
  return res;
}

// Row quick-toggle: patches only soldOut so stale modal state can't clobber
// other fields edited elsewhere.
export async function adminSetProductSoldOut(id: string, soldOut: boolean) {
  check(prod);
  const res = await databases.updateDocument(db, prod, id, { soldOut });
  invalidate('products');
  return res;
}

// ── Orders ────────────────────────────────────────────────────────────────────

export async function adminListOrders() {
  check(ord);
  const res = await databases.listDocuments(db, ord, [
    Query.limit(200),
    Query.orderDesc('$createdAt'),
  ]);
  return res.documents;
}

export async function adminUpdateOrderStatus(id: string, status: string) {
  check(ord);
  return databases.updateDocument(db, ord, id, { status });
}
