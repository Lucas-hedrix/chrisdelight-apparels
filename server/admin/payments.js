import { handle, json } from '../_lib/http.js';
import { requireAdmin } from '../_lib/auth.js';
import { listRows } from '../_lib/aw.js';

export default async function handler(req, res) {
  await handle(req, res, async () => {
    await requireAdmin(req);
    const payments = await listRows('vendor_payments', [], 100);
    const vendors = await listRows('vendors', [], 100);
    const nameById = new Map((vendors.rows ?? []).map((v) => [v.$id, v.businessName]));
    const out = (payments.rows ?? [])
      .map((p) => ({ ...p, businessName: nameById.get(p.vendorId) || 'Unknown vendor' }))
      .sort((a, b) => String(b.$createdAt).localeCompare(String(a.$createdAt)));
    json(res, 200, { payments: out });
  });
}
