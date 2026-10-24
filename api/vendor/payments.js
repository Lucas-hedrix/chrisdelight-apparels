import { handle, json, readBody } from '../_lib/http.js';
import { requireUser } from '../_lib/auth.js';
import { createRow, listRows, updateRow, httpError } from '../_lib/aw.js';
import { str, plan as validatePlan, PAID_PLANS, PLAN_PRICES } from '../_lib/validate.js';
import { getState, requireState } from '../_lib/vendors.js';

// Records a payment reference for admin verification. Nothing is confirmed
// here — the row stays 'pending' until an admin verifies it in the dashboard.
export default async function handler(req, res) {
  await handle(req, res, async () => {
    if (req.method !== 'POST') throw httpError(405, 'Method not allowed');
    const user = await requireUser(req);
    const body = await readBody(req);

    const found = await listRows('vendors', [{ method: 'equal', attribute: 'userId', values: [user.$id] }], 1);
    const vendor = (found.rows ?? [])[0];
    if (!vendor) throw httpError(404, 'No vendor account yet');
    const state = requireState(await getState(vendor.$id));

    const chosenPlan = validatePlan(body.plan);
    if (!PAID_PLANS.includes(chosenPlan)) throw httpError(400, 'Commission partners do not pay a subscription');
    const reference = str(body.reference);
    if (!/^[A-Za-z0-9_-]{6,100}$/.test(reference)) throw httpError(400, 'A valid payment reference is required');

    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || Math.round(amount) !== PLAN_PRICES[chosenPlan]) {
      throw httpError(400, `Amount must be exactly ₦${PLAN_PRICES[chosenPlan].toLocaleString()} for the ${chosenPlan} plan`);
    }

    const dupe = await listRows('vendor_payments', [{ method: 'equal', attribute: 'reference', values: [reference] }], 1);
    if ((dupe.rows ?? []).length) throw httpError(409, 'This payment reference was already submitted');

    const payment = await createRow('vendor_payments', {
      vendorId: vendor.$id,
      userId: user.$id,
      plan: chosenPlan,
      amount,
      reference,
      status: 'pending',
    });
    await updateRow('vendor_state', vendor.$id, { paymentStatus: 'pending_verification' });

    json(res, 201, {
      payment: {
        $id: payment.$id, plan: payment.plan, amount: payment.amount,
        reference: payment.reference, status: payment.status, $createdAt: payment.$createdAt,
      },
    });
  });
}
