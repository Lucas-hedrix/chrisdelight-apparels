import { handle, json, readBody } from '../_lib/http.js';
import { requireUser } from '../_lib/auth.js';
import { createRow, deleteRow, listRows, httpError } from '../_lib/aw.js';
import { requireStr, optionalStr, slugify, whatsapp, plan } from '../_lib/validate.js';
import { publicVendor } from '../_lib/vendors.js';

export default async function handler(req, res) {
  await handle(req, res, async () => {
    if (req.method !== 'POST') throw httpError(405, 'Method not allowed');
    const user = await requireUser(req);
    const body = await readBody(req);

    const existing = await listRows('vendors', [{ method: 'equal', attribute: 'userId', values: [user.$id] }], 1);
    if ((existing.rows ?? []).length) throw httpError(409, 'You already have a vendor account');

    const businessName = requireStr(body.businessName, 'Business name', 2, 100);
    const slug = slugify(body.slug || body.businessName);
    const category = optionalStr(body.category, 'Category', 100);
    const bio = optionalStr(body.bio, 'Bio', 1000);
    const phone = whatsapp(body.whatsapp);
    const chosenPlan = plan(body.plan);
    const logoFileId = optionalStr(body.logoFileId, 'Logo', 64);

    const slugTaken = await listRows('vendors', [{ method: 'equal', attribute: 'slug', values: [slug] }], 1);
    if ((slugTaken.rows ?? []).length) throw httpError(409, 'That store address is taken, try another');

    let vendor;
    try {
      vendor = await createRow('vendors', {
        userId: user.$id,
        slug,
        businessName,
        bio,
        category,
        logoFileId,
        status: 'pending',
        featured: false,
      });
    } catch (err) {
      if (err && err.status === 409) throw httpError(409, 'That store address is taken, try another');
      throw err;
    }

    await createRow('vendor_state', {
      whatsapp: phone,
      plan: chosenPlan,
      paymentStatus: chosenPlan === 'commission' ? 'not_applicable' : 'none',
    }, vendor.$id).catch(async (err) => {
      // Roll back the profile row so the user can retry registration instead
      // of being permanently stuck with a half-created vendor account.
      await deleteRow('vendors', vendor.$id).catch(() => {});
      throw err;
    });

    json(res, 201, { vendor: publicVendor(vendor, { plan: chosenPlan }) });
  });
}
