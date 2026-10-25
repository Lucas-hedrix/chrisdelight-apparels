import { handle, json, readBody } from '../../../_lib/http.js';
import { requireAdmin } from '../../../_lib/auth.js';
import { getRow, updateRow, httpError } from '../../../_lib/aw.js';
import { optionalStr } from '../../../_lib/validate.js';

const PLANS = ['starter', 'business', 'commission'];

function addMonths(iso, months) {
  const d = iso ? new Date(iso) : new Date();
  const base = d.getTime() > Date.now() ? d : new Date();
  const out = new Date(base);
  out.setMonth(out.getMonth() + months);
  return out.toISOString();
}

// Sets plan/commission terms and extends the subscription directly. Used for
// comping, corrections and commission setup — normal paid upgrades go through
// payment verification instead.
export default async function handler(req, res) {
  await handle(req, res, async () => {
    if (req.method !== 'POST') throw httpError(405, 'Method not allowed');
    await requireAdmin(req);
    const body = await readBody(req);
    await getRow('vendors', req.query.id);

    const patch = {};
    if (body.plan !== undefined) {
      const p = String(body.plan).trim().toLowerCase();
      if (!PLANS.includes(p)) throw httpError(400, 'Plan must be starter, business or commission');
      patch.plan = p;
      if (p === 'commission') patch.planExpiresAt = null;
      else if (body.extendMonths !== 0) patch.planExpiresAt = addMonths(body.planExpiresAt, Number(body.extendMonths) || 1);
    }
    if (body.extendMonths !== undefined && body.plan === undefined) {
      const vendorState = await getRow('vendor_state', req.query.id);
      if (vendorState.plan === 'commission') throw httpError(400, 'Commission partners have no expiry to extend');
      patch.planExpiresAt = addMonths(vendorState.planExpiresAt, Number(body.extendMonths) || 1);
    }
    if (body.paymentStatus !== undefined) {
      const s = String(body.paymentStatus).trim();
      if (!['none', 'pending_verification', 'paid', 'not_applicable', 'overdue'].includes(s)) {
        throw httpError(400, 'Invalid paymentStatus');
      }
      patch.paymentStatus = s;
    }
    if (body.commissionRate !== undefined) {
      const rate = Number(body.commissionRate);
      if (!Number.isFinite(rate) || rate < 0 || rate > 90) throw httpError(400, 'Commission rate must be 0-90 percent');
      patch.commissionRate = rate;
    }
    if (body.commissionTerms !== undefined) patch.commissionTerms = optionalStr(body.commissionTerms, 'Commission terms', 1000);

    if (!Object.keys(patch).length) throw httpError(400, 'Nothing to update');
    await updateRow('vendor_state', req.query.id, patch);
    json(res, 200, { ok: true, ...patch });
  });
}
