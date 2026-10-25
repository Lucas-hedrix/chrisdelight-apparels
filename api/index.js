/**
 * Single Vercel Serverless Function for the whole API.
 * Hobby plan allows only 12 functions — every file under /api used to be one.
 * Handlers live in ../server and are dispatched here by method + path.
 */
import vendors from '../server/vendors.js';
import vendorById from '../server/vendors/[id].js';
import vendorContact from '../server/vendors/[id]/contact.js';
import vendorProducts from '../server/vendor-products.js';
import vendorRegister from '../server/vendor/register.js';
import vendorMe from '../server/vendor/me.js';
import vendorPayments from '../server/vendor/payments.js';
import adminVendors from '../server/admin/vendors.js';
import adminVendorStatus from '../server/admin/vendors/[id]/status.js';
import adminVendorPlan from '../server/admin/vendors/[id]/plan.js';
import adminPayments from '../server/admin/payments.js';
import adminPaymentVerify from '../server/admin/payments/[id]/verify.js';
import adminCommissions from '../server/admin/commissions.js';
import adminCommissionById from '../server/admin/commissions/[id].js';
import adminPromotions from '../server/admin/promotions.js';
import adminPromotionById from '../server/admin/promotions/[id].js';
import adminVendorProductById from '../server/admin/vendor-products/[id].js';
import notifyOrder from '../server/notify/order.js';
import notifyWelcome from '../server/notify/welcome.js';

const routes = [
  ['GET', /^\/api\/vendors$/, vendors],
  ['GET', /^\/api\/vendor-products$/, vendorProducts],
  ['GET', /^\/api\/vendors\/(?<id>[^/]+)$/, vendorById],
  ['GET', /^\/api\/vendors\/(?<id>[^/]+)\/contact$/, vendorContact],
  ['POST', /^\/api\/vendor\/register$/, vendorRegister],
  ['GET', /^\/api\/vendor\/me$/, vendorMe],
  ['PATCH', /^\/api\/vendor\/me$/, vendorMe],
  ['POST', /^\/api\/vendor\/payments$/, vendorPayments],
  ['GET', /^\/api\/admin\/vendors$/, adminVendors],
  ['POST', /^\/api\/admin\/vendors\/(?<id>[^/]+)\/status$/, adminVendorStatus],
  ['POST', /^\/api\/admin\/vendors\/(?<id>[^/]+)\/plan$/, adminVendorPlan],
  ['GET', /^\/api\/admin\/payments$/, adminPayments],
  ['POST', /^\/api\/admin\/payments\/(?<id>[^/]+)\/verify$/, adminPaymentVerify],
  ['GET', /^\/api\/admin\/commissions$/, adminCommissions],
  ['POST', /^\/api\/admin\/commissions$/, adminCommissions],
  ['PATCH', /^\/api\/admin\/commissions\/(?<id>[^/]+)$/, adminCommissionById],
  ['GET', /^\/api\/admin\/promotions$/, adminPromotions],
  ['POST', /^\/api\/admin\/promotions$/, adminPromotions],
  ['DELETE', /^\/api\/admin\/promotions\/(?<id>[^/]+)$/, adminPromotionById],
  ['DELETE', /^\/api\/admin\/vendor-products\/(?<id>[^/]+)$/, adminVendorProductById],
  ['POST', /^\/api\/notify\/order$/, notifyOrder],
  ['POST', /^\/api\/notify\/welcome$/, notifyWelcome],
];

function pathnameOf(req) {
  // Prefer original URL when present (rewrite / catch-all), else req.url.
  const raw =
    req.headers['x-forwarded-uri'] ||
    req.headers['x-invoke-path'] ||
    req.url ||
    '/';
  try {
    return new URL(raw, 'http://localhost').pathname;
  } catch {
    return String(raw).split('?')[0] || '/';
  }
}

export default async function handler(req, res) {
  // CORS preflight (safe no-op for same-origin Vite proxy / Vercel)
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  const pathname = pathnameOf(req);
  const search = (() => {
    try {
      return Object.fromEntries(new URL(req.url || '/', 'http://localhost').searchParams);
    } catch {
      return {};
    }
  })();
  req.query = { ...(req.query || {}), ...search };

  for (const [method, pattern, fn] of routes) {
    if (req.method !== method) continue;
    const m = pathname.match(pattern);
    if (!m) continue;
    req.query = { ...req.query, ...(m.groups || {}) };
    return fn(req, res);
  }

  res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({ error: 'Not found' }));
}
