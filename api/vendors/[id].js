import { handle, json } from '../_lib/http.js';
import { listRows, getRow, httpError } from '../_lib/aw.js';
import { isListed, publicVendor, getState, requireState } from '../_lib/vendors.js';

async function findVendor(idOrSlug) {
  const direct = await getRow('vendors', idOrSlug).catch(() => null);
  if (direct) return direct;
  const bySlug = await listRows('vendors', [{ method: 'equal', attribute: 'slug', values: [idOrSlug] }], 1);
  const row = (bySlug.rows ?? [])[0];
  if (!row) throw httpError(404, 'Vendor not found');
  return row;
}

export default async function handler(req, res) {
  await handle(req, res, async () => {
    const vendor = await findVendor(req.query.id);
    const state = requireState(await getState(vendor.$id));
    if (!isListed(vendor, state)) throw httpError(404, 'Vendor not found');
    json(res, 200, { vendor: publicVendor(vendor, state) });
  });
}
