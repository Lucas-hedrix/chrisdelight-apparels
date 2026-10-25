import { httpError } from './aw.js';

export const RESERVED_SLUGS = new Set([
  'api', 'vendors', 'vendor', 'sell', 'admin', 'auth', 'login', 'checkout', 'collections',
  'support', 'terms', 'shipping-returns', 'assets', 'public', 'index', 'dashboard', 'cart',
]);

export const PLANS = ['starter', 'business', 'commission'];
export const PAID_PLANS = ['starter', 'business'];
export const PLAN_PRICES = { starter: 3000, business: 4000 };

export function str(v) {
  return typeof v === 'string' ? v.trim() : '';
}

export function requireStr(v, name, min, max) {
  const s = str(v);
  if (s.length < min || s.length > max) throw httpError(400, `${name} must be ${min}-${max} characters`);
  return s;
}

export function optionalStr(v, name, max) {
  const s = str(v);
  if (s.length > max) throw httpError(400, `${name} must be at most ${max} characters`);
  return s || null;
}

export function slugify(v, name = 'slug') {
  const s = str(v).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (s.length < 3 || s.length > 30) throw httpError(400, `${name} must be 3-30 letters, numbers or dashes`);
  if (RESERVED_SLUGS.has(s)) throw httpError(400, `"${s}" is reserved, choose another ${name}`);
  return s;
}

export function whatsapp(v) {
  const digits = str(v).replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 15) throw httpError(400, 'WhatsApp number must be 7-15 digits (country code included)');
  return digits;
}

export function plan(v) {
  const s = str(v).toLowerCase();
  if (!PLANS.includes(s)) throw httpError(400, 'Plan must be starter, business or commission');
  return s;
}

export function price(v, name = 'price') {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0 || n > 10_000_000) throw httpError(400, `${name} must be a positive amount`);
  return Math.round(n * 100) / 100;
}

export function stringArray(v, name, maxItems, maxLen) {
  if (v == null) return [];
  if (!Array.isArray(v)) throw httpError(400, `${name} must be a list`);
  const items = v.map((x) => str(x)).filter(Boolean);
  if (items.length > maxItems) throw httpError(400, `${name} can have at most ${maxItems} items`);
  for (const item of items) {
    if (item.length > maxLen) throw httpError(400, `each item in ${name} must be at most ${maxLen} characters`);
  }
  return items;
}
