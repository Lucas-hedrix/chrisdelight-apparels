import { handle, json, readBody } from '../_lib/http.js';
import { requireAdmin } from '../_lib/auth.js';
import { listRows, createRow, getRow, updateRow, httpError } from '../_lib/aw.js';
import { optionalStr } from '../_lib/validate.js';

export default async function handler(req, res) {
  await handle(req, res, async () => {
    await requireAdmin(req);

    if (req.method === 'GET') {
      const promos = await listRows('promotions', [], 100);
      const vendors = await listRows('vendors', [], 100);
      const nameById = new Map((vendors.rows ?? []).map((v) => [v.$id, v.businessName]));
      return json(res, 200, {
        promotions: (promos.rows ?? []).map((p) => ({ ...p, businessName: nameById.get(p.vendorId) || 'Unknown vendor' })),
      });
    }

    if (req.method === 'POST') {
      const body = await readBody(req);
      const vendorId = String(body.vendorId || '').trim();
      if (!vendorId) throw httpError(400, 'Vendor is required');
      await getRow('vendors', vendorId).catch(() => {
        throw httpError(404, 'Vendor not found');
      });
      const productId = body.productId ? String(body.productId).trim() : null;
      const row = await createRow('promotions', {
        vendorId,
        productId,
        kind: productId ? 'product' : 'vendor',
        note: optionalStr(body.note, 'Note', 300),
      });
      if (!productId) {
        // The directory sorts on vendors.featured — keep it in sync with
        // vendor-level promotions.
        await updateRow('vendors', vendorId, { featured: true }).catch(() => {});
      }
      return json(res, 201, { promotion: row });
    }

    throw httpError(405, 'Method not allowed');
  });
}
