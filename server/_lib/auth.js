import { userFromJWT, httpError } from './aw.js';

export function adminEmails() {
  return (process.env.APPWRITE_ADMIN_EMAILS || 'christiegish@yahoo.com')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email) {
  return adminEmails().includes(String(email || '').toLowerCase());
}

export async function requireUser(req) {
  const header = req.headers.authorization || '';
  const jwt = header.startsWith('Bearer ') ? header.slice(7).trim() : null;
  if (!jwt) throw httpError(401, 'Sign in required');
  const user = await userFromJWT(jwt);
  if (!user || !user.$id) throw httpError(401, 'Session expired, sign in again');
  return user;
}

export async function requireAdmin(req) {
  const user = await requireUser(req);
  if (!isAdminEmail(user.email)) throw httpError(403, 'Admins only');
  return user;
}
