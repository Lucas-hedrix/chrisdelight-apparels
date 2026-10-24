import { aw, awEnv, httpError } from './aw.js';

function notificationsPath() {
  const { D } = awEnv();
  const col = process.env.VITE_APPWRITE_NOTIFICATIONS_COLLECTION_ID || 'notifications';
  return `/databases/${D}/collections/${col}/documents`;
}

/** Persist an in-app notification the user can open from the bell. */
export async function createInAppNotification({ userId, title, message, type, relatedId, href }) {
  if (!userId) return null;
  return aw('POST', notificationsPath(), {
    documentId: 'unique()',
    data: {
      userId,
      title,
      message,
      type: type || 'system',
      read: false,
      relatedId: relatedId || '',
      href: href || '',
    },
    permissions: [
      `read("user:${userId}")`,
      `update("user:${userId}")`,
      `delete("user:${userId}")`,
    ],
  });
}

/** Send a transactional email via Appwrite Messaging (needs an email provider). */
export async function sendUserEmail({ userId, subject, html }) {
  if (!userId || !subject || !html) throw httpError(400, 'Missing email fields');
  return aw('POST', '/messaging/messages/email', {
    messageId: 'unique()',
    subject,
    content: html,
    users: [userId],
    html: true,
  });
}

export function orderEmailHtml({ name, orderId, method, status, total }) {
  const short = String(orderId || '').slice(-6).toUpperCase();
  const methodLabel = method === 'paystack' ? 'Paystack' : method === 'crypto' ? 'Crypto' : method || '—';
  const statusLabel =
    status === 'paid'
      ? 'Payment confirmed'
      : status === 'pending_approval'
        ? 'Awaiting payment verification'
        : status || 'Received';
  const totalLine =
    typeof total === 'number' && Number.isFinite(total)
      ? `<p style="margin:0 0 12px"><strong>Total:</strong> ₦${total.toLocaleString('en-NG')}</p>`
      : '';

  return `<!DOCTYPE html>
<html><body style="font-family:Arial,sans-serif;background:#0a0a0a;color:#f5f4f0;padding:24px">
  <div style="max-width:520px;margin:0 auto;background:#161616;border:1px solid #262626;border-radius:16px;padding:28px">
    <p style="margin:0 0 4px;letter-spacing:0.08em;font-size:12px;color:#9c9ca6">CYBERNEXUS</p>
    <h1 style="margin:0 0 16px;font-size:22px">Order confirmation</h1>
    <p style="margin:0 0 12px">Hi ${name || 'there'},</p>
    <p style="margin:0 0 12px">Thanks for your order <strong>#${short}</strong>.</p>
    <p style="margin:0 0 8px"><strong>Status:</strong> ${statusLabel}</p>
    <p style="margin:0 0 8px"><strong>Payment:</strong> ${methodLabel}</p>
    ${totalLine}
    <p style="margin:16px 0 0;color:#9c9ca6;font-size:13px;line-height:1.5">
      ${
        status === 'pending_approval'
          ? "We'll verify your transfer against the evidence you uploaded and confirm shortly."
          : "We'll reach out with shipping and pickup details."
      }
    </p>
  </div>
</body></html>`;
}
