import { handle, json } from '../../_lib/http.js';
import { listRows, getRow, httpError } from '../../_lib/aw.js';
import { contactAllowed, getState, requireState } from '../../_lib/vendors.js';

async function findVendor(idOrSlug) {
  const direct = await getRow('vendors', idOrSlug).catch(() => null);
  if (direct) return direct;
  const bySlug = await listRows('vendors', [{ method: 'equal', attribute: 'slug', values: [idOrSlug] }], 1);
  const row = (bySlug.rows ?? [])[0];
  if (!row) throw httpError(404, 'Vendor not found');
  return row;
}

// Single controlled egress point for vendor WhatsApp numbers. The number lives
// only in vendor_state (no user permissions), so it can never leak through a
// public document read — even for suspended or expired vendors.
export default async function handler(req, res) {
  await handle(req, res, async () => {
    const vendor = await findVendor(req.query.id);
    const state = requireState(await getState(vendor.$id));
    if (vendor.status !== 'active') {
      return json(res, 200, { locked: true, reason: 'unavailable', message: 'This vendor is not currently accepting enquiries.' });
    }
    if (state.plan !== 'business' || !contactAllowed(state)) {
      const expired = state.planExpiresAt && new Date(state.planExpiresAt).getTime() < Date.now();
      return json(res, 200, {
        locked: true,
        reason: expired ? 'expired' : 'starter',
        message: expired
          ? 'This vendor\u2019s Business subscription has expired, so direct contact is paused.'
          : 'Direct WhatsApp enquiries are available on the Business plan. Send this vendor an enquiry through the platform instead.',
      });
    }
    json(res, 200, { locked: false, whatsapp: state.whatsapp, businessName: vendor.businessName });
  });
}
