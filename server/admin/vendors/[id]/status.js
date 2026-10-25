import { handle, json, readBody } from '../../../_lib/http.js';
import { requireAdmin } from '../../../_lib/auth.js';
import { getRow, updateRow, httpError } from '../../../_lib/aw.js';

const ALLOWED = ['pending', 'active', 'suspended'];

export default async function handler(req, res) {
  await handle(req, res, async () => {
    if (req.method !== 'POST') throw httpError(405, 'Method not allowed');
    await requireAdmin(req);
    const body = await readBody(req);
    const status = String(body.status || '').trim();
    if (!ALLOWED.includes(status)) throw httpError(400, 'Status must be pending, active or suspended');
    await getRow('vendors', req.query.id);
    await updateRow('vendors', req.query.id, { status });
    json(res, 200, { ok: true, status });
  });
}
