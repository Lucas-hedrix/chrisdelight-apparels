import { getRow, httpError } from './aw.js';

export const GRACE_MS = 7 * 24 * 60 * 60 * 1000; // expired plans stay listed 7 more days

export function liveStatus(vendor, state, now = Date.now()) {
  if (vendor.status === 'suspended') return 'suspended';
  if (vendor.status !== 'active') return vendor.status || 'pending';
  if (state.plan !== 'commission' && state.planExpiresAt) {
    if (new Date(state.planExpiresAt).getTime() < now) return 'expired';
  }
  return 'active';
}

export function isListed(vendor, state, now = Date.now()) {
  const s = liveStatus(vendor, state, now);
  if (s === 'active') return true;
  // 7-day grace: expired vendors keep their storefront visible, contact locked.
  if (vendor.status === 'active' && state.plan !== 'commission' && state.planExpiresAt) {
    return new Date(state.planExpiresAt).getTime() >= now - GRACE_MS;
  }
  return false;
}

export function contactAllowed(state, now = Date.now()) {
  return (
    state.plan === 'business' &&
    (!state.planExpiresAt || new Date(state.planExpiresAt).getTime() > now)
  );
}

export function storageUrl(bucketId, projectId, fileId) {
  if (!fileId) return null;
  return `https://fra.cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${fileId}/view?project=${projectId}`;
}

export function publicVendor(vendor, state, { includePlan = true } = {}) {
  const { P, B } = awEnvPub();
  return {
    vendorId: vendor.$id,
    slug: vendor.slug,
    businessName: vendor.businessName,
    bio: vendor.bio || null,
    category: vendor.category || null,
    logoUrl: storageUrl(B, P, vendor.logoFileId),
    featured: !!vendor.featured,
    joinedAt: vendor.$createdAt,
    status: vendor.status,
    plan: includePlan ? state.plan : undefined,
  };
}

function awEnvPub() {
  // lazy import avoided: aw.js is imported by callers anyway
  // eslint-disable-next-line node/no-unsupported-features
  return { P: process.env.VITE_APPWRITE_PROJECT_ID, B: process.env.VITE_APPWRITE_BUCKET_ID };
}

export async function getState(vendorId) {
  try {
    return await getRow('vendor_state', vendorId);
  } catch (err) {
    if (err && err.status === 404) return null;
    throw err;
  }
}

export function requireState(state) {
  if (!state) throw httpError(409, 'Vendor account is incomplete, contact support');
  return state;
}
