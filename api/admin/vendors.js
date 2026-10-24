import { handle, json } from '../_lib/http.js';
import { requireAdmin } from '../_lib/auth.js';
import { listRows } from '../_lib/aw.js';
import { liveStatus, publicVendor, getState, requireState } from '../_lib/vendors.js';

export default async function handler(req, res) {
  await handle(req, res, async () => {
    await requireAdmin(req);
    const vendors = await listRows('vendors', [], 100);
    const out = [];
    for (const v of vendors.rows ?? []) {
      const state = requireState(await getState(v.$id));
      out.push({
        ...publicVendor(v, state),
        liveStatus: liveStatus(v, state),
        planExpiresAt: state.planExpiresAt,
        paymentStatus: state.paymentStatus,
        commissionRate: state.commissionRate,
        commissionTerms: state.commissionTerms,
        whatsapp: state.whatsapp,
        userId: v.userId,
      });
    }
    out.sort((a, b) => String(b.joinedAt).localeCompare(String(a.joinedAt)));
    json(res, 200, { vendors: out });
  });
}
