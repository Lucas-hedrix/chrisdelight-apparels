import { ID, Query } from 'appwrite';
import { databases, appwriteConfig, isAppwriteConfigured } from './appwrite';

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
  return databases.createDocument(db, prod, ID.unique(), data);
}

export async function adminUpdateProduct(id: string, data: AdminProductData) {
  check(prod);
  return databases.updateDocument(db, prod, id, data);
}

export async function adminDeleteProduct(id: string) {
  check(prod);
  return databases.deleteDocument(db, prod, id);
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
