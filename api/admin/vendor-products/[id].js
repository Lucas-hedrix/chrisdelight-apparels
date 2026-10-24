import { handle, json } from '../../_lib/http.js';
import { requireAdmin } from '../../_lib/auth.js';
import { deleteRow, httpError } from '../../_lib/aw.js';

// Admin moderation: remove a vendor product listing entirely.
export default async function handler(req, res) {
  await handle(req, res, async () => {
    if (req.method !== 'DELETE') throw httpError(405, 'Method not allowed');
    await requireAdmin(req);
    await deleteRow('vendor_products', req.query.id).catch((err) => {
      if (err && err.status === 404) throw httpError(404, 'Listing not found');
      throw err;
    });
    json(res, 200, { ok: true });
  });
}
