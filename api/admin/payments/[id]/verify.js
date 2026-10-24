import { handle, json, readBody } from '../../../_lib/http.js';
import { requireAdmin } from '../../../_lib/auth.js';
import { getRow, updateRow, httpError } from '../../../_lib/aw.js';
import { optionalStr, PAID_PLANS } from '../../../_lib/validate.js';

function addMonth(iso) {
  const d = iso ? new Date(iso) : new Date();
  const base = d.getTime() > Date.now() ? d : new Date();
  const out = new Date(base);
  out.setMonth(out.getMonth() + 1);
  return out.toISOString();
}

// Verifies a vendor payment. On 'verified' the plan activates immediately:
// state.plan = payment.plan, expiry extended one month (stacking on any
// remaining time), vendor status flipped to active.
export default async function handler(req, res) {
  await handle(req, res, async () => {
    if (req.method !== 'POST') throw httpError(405, 'Method not allowed');
    await requireAdmin(req);
    const body = await readBody(req);
    const decision = String(body.decision || '').trim();
    if (!['verified', 'rejected'].includes(decision)) throw httpError(400, 'Decision must be verified or rejected');

    const payment = await getRow('vendor_payments', req.query.id);
    if (payment.status !== 'pending') throw httpError(409, `Payment already ${payment.status}`);

    await updateRow('vendor_payments', req.query.id, {
      status: decision,
      verifiedAt: new Date().toISOString(),
      note: optionalStr(body.note, 'Note', 500),
    });

    if (decision === 'verified') {
      const state = await getRow('vendor_state', payment.vendorId);
      const patch = {
        plan: payment.plan,
        planExpiresAt: addMonth(state.planExpiresAt),
        paymentStatus: 'paid',
      };
      await updateRow('vendor_state', payment.vendorId, patch);
      await updateRow('vendors', payment.vendorId, { status: 'active' });
    } else {
      // A rejected payment must not disturb an existing paid subscription:
      // restore 'paid' when the vendor's current plan is still valid, and
      // only fall back to 'none' when there is nothing active to protect.
      const state = await getRow('vendor_state', payment.vendorId);
      if (state.paymentStatus === 'pending_verification') {
        const planValid =
          PAID_PLANS.includes(state.plan) &&
          state.planExpiresAt &&
          new Date(state.planExpiresAt).getTime() > Date.now();
        await updateRow('vendor_state', payment.vendorId, { paymentStatus: planValid ? 'paid' : 'none' });
      }
    }

    json(res, 200, { ok: true, decision });
  });
}
