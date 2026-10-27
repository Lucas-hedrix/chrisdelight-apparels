// Public marketplace listing of vendor products. Rows are created client-side,
// so this endpoint re-verifies ownership server-side: a row is only published
// when its vendorId belongs to a listed vendor AND its ownerUserId matches
// that vendor's account (forged rows never surface here).
// Also returns the store taxonomy: global categories, plus (when ?vendor= is
// given) that vendor's own categories under the same ownership rule.
import { handle, json } from './_lib/http.js';
import { listRows } from './_lib/aw.js';
import { isListed, getState } from './_lib/vendors.js';

function normalizeCategory(r) {
  return {
    id: r.$id,
    name: r.name,
    subCategories: Array.isArray(r.subCategories) ? r.subCategories.map(String) : [],
    description: r.description || null,
    vendorId: r.vendorId || null,
    order: r.order == null ? null : Number(r.order),
  };
}

function sortCategories(cats) {
  return cats.sort((a, b) => {
    const oa = a.order ?? Number.MAX_SAFE_INTEGER;
    const ob = b.order ?? Number.MAX_SAFE_INTEGER;
    if (oa !== ob) return oa - ob;
    return String(a.name).localeCompare(String(b.name));
  });
}

export default async function handler(req, res) {
  await handle(req, res, async () => {
    const vendorFilter = req.query.vendor ? String(req.query.vendor) : null;

    const vendors = (await listRows('vendors', [], 200)).rows ?? [];
    const listed = [];
    for (const v of vendors) {
      const state = await getState(v.$id);
      if (!state || !isListed(v, state)) continue;
      if (vendorFilter && v.slug !== vendorFilter && v.$id !== vendorFilter) continue;
      listed.push({ vendor: v, state });
    }

    const byVendorId = new Map(listed.map((e) => [e.vendor.$id, e]));
    const allowed = new Set(byVendorId.keys());
    if (vendorFilter && allowed.size === 0) {
      return json(res, 200, { products: [], categories: [] });
    }

    let categories = [];
    try {
      const catRows = (await listRows('categories', [], 200)).rows ?? [];
      categories = sortCategories(catRows.filter((r) => !r.vendorId).map(normalizeCategory));
      if (vendorFilter) {
        const entry = byVendorId.get(listed[0].vendor.$id);
        const scoped = catRows.filter(
          (r) => r.vendorId === entry.vendor.$id && r.ownerUserId === entry.vendor.userId
        );
        categories = [...categories, ...sortCategories(scoped.map(normalizeCategory))];
      }
    } catch {
      // Taxonomy is additive — a missing/broken categories table must not take
      // product listings down with it.
      categories = [];
    }

    const rows = (await listRows('vendor_products', [], 200)).rows ?? [];
    const products = [];
    for (const r of rows) {
      const entry = byVendorId.get(r.vendorId);
      if (!entry) continue;
      if (r.ownerUserId !== entry.vendor.userId) continue;
      products.push({
        id: r.$id,
        vendorId: r.vendorId,
        name: r.name,
        description: r.description || null,
        price: Number(r.price ?? 0),
        image: r.image || null,
        category: r.category,
        subCategory: r.subCategory || null,
        availableSizes: r.availableSizes ?? [],
        availableColors: r.availableColors ?? [],
        soldOut: !!r.soldOut,
        vendor: {
          id: entry.vendor.$id,
          slug: entry.vendor.slug,
          businessName: entry.vendor.businessName,
          featured: !!entry.vendor.featured,
        },
      });
    }
    products.sort((a, b) => String(b.id).localeCompare(String(a.id)));
    json(res, 200, { products, categories });
  });
}
