import { handle, json } from './_lib/http.js';
import { listRows } from './_lib/aw.js';
import { isListed, publicVendor, getState } from './_lib/vendors.js';

export default async function handler(req, res) {
  await handle(req, res, async () => {
    const vendors = await listRows('vendors');
    const out = [];
    for (const v of vendors.rows ?? []) {
      const state = await getState(v.$id);
      if (!state) continue;
      if (!isListed(v, state)) continue;
      out.push({ ...publicVendor(v, state), liveStatus: 'active' });
    }
    out.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || String(a.joinedAt).localeCompare(String(b.joinedAt)));
    json(res, 200, { vendors: out });
  });
}
