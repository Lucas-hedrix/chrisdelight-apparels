import { handle, json, readBody } from '../_lib/http.js';
import { requireUser } from '../_lib/auth.js';
import { httpError } from '../_lib/aw.js';
import { createInAppNotification, orderEmailHtml, sendUserEmail } from '../_lib/notify.js';

// Fire-and-forget purchase confirmation: in-app notification + email.
// Email delivery requires an Appwrite Messaging email provider (Resend/SMTP).
export default async function handler(req, res) {
  await handle(req, res, async () => {
    if (req.method !== 'POST') throw httpError(405, 'Method not allowed');
    const user = await requireUser(req);
    const body = await readBody(req);

    const orderId = String(body.orderId || '').trim();
    if (!orderId) throw httpError(400, 'orderId required');

    const method = String(body.method || '').trim();
    const status = String(body.status || '').trim();
    const total = body.total != null ? Number(body.total) : undefined;

    const short = orderId.slice(-6).toUpperCase();
    const methodLabel = method === 'paystack' ? 'Paystack' : method === 'crypto' ? 'Crypto' : method || '—';
    const statusLabel = status === 'paid' ? 'confirmed' : 'pending approval';

    const title = status === 'paid' ? 'Order confirmed' : 'Order submitted';
    const message = `Your order #${short} has been placed and is ${statusLabel}. Payment method: ${methodLabel}.`;

    // In-app (server-side so permissions are correct even if the client call fails).
    try {
      await createInAppNotification({
        userId: user.$id,
        title,
        message,
        type: 'order',
        relatedId: orderId,
        href: '',
      });
    } catch (err) {
      console.error('[notify/order] notification failed', err.message || err);
    }

    // Transactional email
    let email = { sent: false };
    try {
      await sendUserEmail({
        userId: user.$id,
        subject:
          status === 'paid'
            ? `Order confirmed — #${short}`
            : `Order received — #${short}`,
        html: orderEmailHtml({
          name: user.name,
          orderId,
          method,
          status,
          total,
        }),
      });
      email = { sent: true };
    } catch (err) {
      console.error('[notify/order] email failed', err.message || err);
      email = { sent: false, error: err.message || 'email failed' };
    }

    json(res, 200, { ok: true, email });
  });
}
