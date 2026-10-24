import { handle, json, readBody } from '../_lib/http.js';
import { requireUser } from '../_lib/auth.js';
import { listRows, updateRow, createRow, getRow, httpError } from '../_lib/aw.js';
import { requireStr, optionalStr, slugify, whatsapp as validateWhatsapp } from '../_lib/validate.js';
import { getState, requireState, liveStatus, publicVendor } from '../_lib/vendors.js';

async function myVendor(userId) {
  const found = await listRows('vendors', [{ method: 'equal', attribute: 'userId', values: [userId] }], 1);
  const row = (found.rows ?? [])[0];
  if (!row) throw httpError(404, 'No vendor account yet');
  return row;
}

export default async function handler(req, res) {
  await handle(req, res, async () => {
    const user = await requireUser(req);
    const vendor = await myVendor(user.$id);
    const state = requireState(await getState(vendor.$id));

    if (req.method === 'GET') {
      const payments = await listRows('vendor_payments', [{ method: 'equal', attribute: 'vendorId', values: [vendor.$id] }], 50);
      const commissions = await listRows('commissions', [{ method: 'equal', attribute: 'vendorId', values: [vendor.$id] }], 100);
      const promo = await listRows('promotions', [{ method: 'equal', attribute: 'vendorId', values: [vendor.$id] }], 50);
      return json(res, 200, {
        vendor: publicVendor(vendor, state),
        liveStatus: liveStatus(vendor, state),
        plan: state.plan,
        planExpiresAt: state.planExpiresAt,
        paymentStatus: state.paymentStatus,
        commissionRate: state.commissionRate,
        commissionTerms: state.commissionTerms,
        whatsapp: state.whatsapp,
        payments: (payments.rows ?? []).map((p) => ({
          $id: p.$id, plan: p.plan, amount: p.amount, reference: p.reference,
          status: p.status, $createdAt: p.$createdAt, verifiedAt: p.verifiedAt, note: p.note,
        })),
        commissions: (commissions.rows ?? []).map((c) => ({
          $id: c.$id, reference: c.reference, saleAmount: c.saleAmount, rate: c.rate,
          commissionAmount: c.commissionAmount, status: c.status, $createdAt: c.$createdAt, settledAt: c.settledAt,
        })),
        featuredPromotions: (promo.rows ?? []).map((p) => ({
          $id: p.$id, kind: p.kind, productId: p.productId, note: p.note, $createdAt: p.$createdAt,
        })),
      });
    }

    if (req.method === 'PATCH') {
      const body = await readBody(req);
      const patch = {};
      if (body.businessName !== undefined) patch.businessName = requireStr(body.businessName, 'Business name', 2, 100);
      if (body.bio !== undefined) patch.bio = optionalStr(body.bio, 'Bio', 1000);
      if (body.category !== undefined) patch.category = optionalStr(body.category, 'Category', 100);
      if (body.logoFileId !== undefined) patch.logoFileId = optionalStr(body.logoFileId, 'Logo', 64);
      if (body.slug !== undefined && body.slug !== vendor.slug) {
        const slug = slugify(body.slug);
        const taken = await listRows('vendors', [{ method: 'equal', attribute: 'slug', values: [slug] }], 1);
        if ((taken.rows ?? []).some((r) => r.$id !== vendor.$id)) throw httpError(409, 'That store address is taken, try another');
        patch.slug = slug;
      }
      let updated = Object.keys(patch).length ? await updateRow('vendors', vendor.$id, patch) : vendor;

      if (body.whatsapp !== undefined) {
        const phone = validateWhatsapp(body.whatsapp);
        await updateRow('vendor_state', vendor.$id, { whatsapp: phone }).catch(async (err) => {
          if (err && err.status === 404) return createRow('vendor_state', { whatsapp: phone, plan: 'starter', paymentStatus: 'none' }, vendor.$id);
          throw err;
        });
        updated = await getRow('vendors', vendor.$id);
      }

      const freshState = requireState(await getState(updated.$id));
      return json(res, 200, { vendor: publicVendor(updated, freshState), liveStatus: liveStatus(updated, freshState), whatsapp: freshState.whatsapp });
    }

    throw httpError(405, 'Method not allowed');
  });
}
