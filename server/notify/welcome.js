import { handle, json } from '../_lib/http.js';
import { requireUser } from '../_lib/auth.js';
import { httpError } from '../_lib/aw.js';
import { createInAppNotification } from '../_lib/notify.js';

// In-app welcome after signup (verification email is sent client-side via Auth).
export default async function handler(req, res) {
  await handle(req, res, async () => {
    if (req.method !== 'POST') throw httpError(405, 'Method not allowed');
    const user = await requireUser(req);

    try {
      await createInAppNotification({
        userId: user.$id,
        title: 'Welcome to Cybernexus',
        message: 'Check your inbox for a confirm-email link, then start shopping.',
        type: 'system',
      });
    } catch (err) {
      console.error('[notify/welcome] failed', err.message || err);
    }

    json(res, 200, { ok: true });
  });
}
