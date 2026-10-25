import { handle, json, readBody } from '../_lib/http.js';
import { requireAdmin } from '../_lib/auth.js';
import { listRows, createRow, getRow, httpError } from '../_lib/aw.js';
import { requireStr, optionalStr, price as validatePrice } from '../_lib/validate.js';

export default async function handler(req, res) {
  await handle(req, res, async () => {
    await requireAdmin(req);

    if (req.method === 'GET') {
      const commissions = await listRows('commissions', [], 100);
      const vendors = await listRows('vendors', [], 100);
      const nameById = new Map((vendors.rows ?? []).map((v) => [v.$id, v.businessName]));
      const out = (commissions.rows ?? [])
        .map((c) => ({ ...c, businessName: nameById.get(c.vendorId) || 'Unknown vendor' }))
        .sort((a, b) => String(b.$createdAt).localeCompare(String(a.$createdAt)));
      return json(res, 200, { commissions: out });
    }

    if (req.method === 'POST') {
      const body = await readBody(req);
      const vendorId = requireStr(body.vendorId, 'Vendor', 1, 64);
      const vendor = await getRow('vendors', vendorId).catch(() => {
        throw httpError(404, 'Vendor not found');
      });
      const state = await getRow('vendor_state', vendorId).catch(() => null);
      if (!state || state.commissionRate == null) {
        throw httpError(400, 'No commission rate agreed with this vendor yet — set one in their plan settings first');
      }
      const saleAmount = validatePrice(body.saleAmount, 'Sale amount');
      const rate = Number(state.commissionRate);
      const commissionAmount = Math.round(saleAmount * (rate / 100) * 100) / 100;
      const row = await createRow('commissions', {
        vendorId,
        reference: requireStr(body.reference, 'Reference', 3, 100),
        saleAmount,
        rate,
        commissionAmount,
        status: 'pending',
        note: optionalStr(body.note, 'Note', 500),
      });
      return json(res, 201, { commission: { ...row, businessName: vendor.businessName } });
    }

    throw httpError(405, 'Method not allowed');
  });
}
