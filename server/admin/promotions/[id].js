import { handle, json } from '../../_lib/http.js';
import { requireAdmin } from '../../_lib/auth.js';
import { deleteRow, getRow, httpError, listRows, updateRow } from '../../_lib/aw.js';

export default async function handler(req, res) {
  await handle(req, res, async () => {
    if (req.method !== 'DELETE') throw httpError(405, 'Method not allowed');
    await requireAdmin(req);
    const promo = await getRow('promotions', req.query.id).catch(() => null);
    await deleteRow('promotions', req.query.id);
    if (promo && promo.kind === 'vendor') {
      const rest = await listRows(
        'promotions',
        [{ method: 'equal', attribute: 'vendorId', values: [promo.vendorId] }],
        10
      );
      const stillFeatured = (rest.rows ?? []).some((p) => p.kind === 'vendor' && p.$id !== req.query.id);
      if (!stillFeatured) {
        await updateRow('vendors', promo.vendorId, { featured: false }).catch(() => {});
      }
    }
    json(res, 200, { ok: true });
  });
}
