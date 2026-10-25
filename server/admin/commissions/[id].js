import { handle, json, readBody } from '../../_lib/http.js';
import { requireAdmin } from '../../_lib/auth.js';
import { updateRow, httpError } from '../../_lib/aw.js';

const ALLOWED = ['pending', 'settled', 'disputed'];

export default async function handler(req, res) {
  await handle(req, res, async () => {
    if (req.method !== 'PATCH') throw httpError(405, 'Method not allowed');
    await requireAdmin(req);
    const body = await readBody(req);
    const status = String(body.status || '').trim();
    if (!ALLOWED.includes(status)) throw httpError(400, 'Status must be pending, settled or disputed');
    const patch = { status };
    if (status === 'settled') patch.settledAt = new Date().toISOString();
    await updateRow('commissions', req.query.id, patch);
    json(res, 200, { ok: true, status });
  });
}
