import { Query, TablesDB } from 'appwrite';
import { appwriteConfig, client, isAppwriteConfigured } from './appwrite';
import { MAIN_CATEGORIES } from './products';
import { cached, invalidate, TTL } from './cache';

const CATEGORIES_CACHE_KEY = 'categories:rows';

export interface StoreCategory {
  id: string;
  name: string;
  subCategories: string[];
  description?: string;
  vendorId?: string;
  order?: number;
}

export const CATEGORIES_TABLE_ID = 'categories';

const tablesDB = new TablesDB(client);

function normalize(row: any): StoreCategory {
  const subs = Array.isArray(row.subCategories) ? row.subCategories.map(String) : [];
  return {
    id: row.$id,
    name: String(row.name ?? '').trim(),
    subCategories: subs,
    description: row.description || undefined,
    vendorId: row.vendorId || undefined,
    order: row.order == null ? undefined : Number(row.order),
  };
}

function sortCats(cats: StoreCategory[]): StoreCategory[] {
  return cats.sort((a, b) => {
    const oa = a.order ?? Number.MAX_SAFE_INTEGER;
    const ob = b.order ?? Number.MAX_SAFE_INTEGER;
    if (oa !== ob) return oa - ob;
    return a.name.localeCompare(b.name);
  });
}

async function listAllRows(): Promise<StoreCategory[]> {
  if (!isAppwriteConfigured || !appwriteConfig.databaseId) return [];
  try {
    // Only resolved reads are cached — on error the rejection propagates here
    // and the existing fallback path below keeps browsing working.
    return await cached(CATEGORIES_CACHE_KEY, TTL.categories, async () => {
      const res = await tablesDB.listRows({
        databaseId: appwriteConfig.databaseId,
        tableId: CATEGORIES_TABLE_ID,
        queries: [Query.limit(200)],
      });
      return (res.rows ?? []).map(normalize).filter((c) => c.name);
    });
  } catch (err) {
    console.warn('Categories table unavailable:', (err as any)?.message);
    return [];
  }
}

function fallbackFromMain(): StoreCategory[] {
  return Object.entries(MAIN_CATEGORIES).map(([name, subCategories], i) => ({
    id: `fallback-${name}`,
    name,
    subCategories,
    order: i + 1,
  }));
}

/** Global (house) categories. Falls back to the built-in taxonomy when the
 * table is unreachable or empty, so browsing never breaks. */
export async function getStoreCategories(): Promise<StoreCategory[]> {
  const rows = await listAllRows();
  const global = sortCats(rows.filter((c) => !c.vendorId));
  return global.length ? global : fallbackFromMain();
}

/** Custom categories a vendor added for their own storefront. */
export async function getVendorCategories(vendorId: string): Promise<StoreCategory[]> {
  const rows = await listAllRows();
  return sortCats(rows.filter((c) => c.vendorId === vendorId));
}

/** Every category row — global plus vendor-scoped. Admin view. */
export async function getAllCategories(): Promise<StoreCategory[]> {
  const rows = await listAllRows();
  if (!rows.length) return fallbackFromMain();
  return sortCats(rows);
}

export interface CategoryInput {
  name: string;
  subCategories?: string[];
  description?: string;
  /** Set when a vendor creates a category for their storefront. */
  vendorId?: string;
  ownerUserId: string;
}

export async function createCategory(input: CategoryInput): Promise<StoreCategory> {
  const row = await tablesDB.createRow({
    databaseId: appwriteConfig.databaseId,
    tableId: CATEGORIES_TABLE_ID,
    rowId: 'unique()',
    data: {
      name: input.name,
      subCategories: input.subCategories ?? [],
      description: input.description || null,
      vendorId: input.vendorId || null,
      ownerUserId: input.ownerUserId,
      order: null,
    },
  });
  invalidate(CATEGORIES_CACHE_KEY);
  return normalize(row);
}

export async function updateCategory(
  id: string,
  patch: { name?: string; subCategories?: string[]; description?: string | null; order?: number | null }
): Promise<StoreCategory> {
  const row = await tablesDB.updateRow({
    databaseId: appwriteConfig.databaseId,
    tableId: CATEGORIES_TABLE_ID,
    rowId: id,
    data: patch,
  });
  invalidate(CATEGORIES_CACHE_KEY);
  return normalize(row);
}

export async function deleteCategory(id: string): Promise<void> {
  await tablesDB.deleteRow({
    databaseId: appwriteConfig.databaseId,
    tableId: CATEGORIES_TABLE_ID,
    rowId: id,
  });
  invalidate(CATEGORIES_CACHE_KEY);
}
