import { apiFetch } from './vendorClient';
import { invalidate } from './cache';

export interface AdminVendor {
  vendorId: string;
  slug: string;
  businessName: string;
  bio: string | null;
  category: string | null;
  logoUrl: string | null;
  featured: boolean;
  joinedAt: string;
  status: string;
  liveStatus: string;
  plan: string;
  planExpiresAt: string | null;
  paymentStatus: string;
  commissionRate: number | null;
  commissionTerms: string | null;
  whatsapp: string;
  userId: string;
}

export interface AdminPayment {
  $id: string;
  vendorId: string;
  businessName: string;
  plan: string;
  amount: number;
  reference: string;
  status: string;
  $createdAt: string;
  verifiedAt: string | null;
  note: string | null;
}

export interface AdminCommission {
  $id: string;
  vendorId: string;
  businessName: string;
  reference: string;
  saleAmount: number;
  rate: number;
  commissionAmount: number;
  status: string;
  $createdAt: string;
  settledAt: string | null;
  note: string | null;
}

export interface AdminPromotion {
  $id: string;
  vendorId: string;
  businessName: string;
  productId: string | null;
  kind: string;
  note: string | null;
  $createdAt: string;
}

export const adminListVendors = () => apiFetch<{ vendors: AdminVendor[] }>('/admin/vendors').then((d) => d.vendors);

export const adminSetVendorStatus = (id: string, status: 'pending' | 'active' | 'suspended') =>
  apiFetch(`/admin/vendors/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) });

export const adminSetVendorPlan = (
  id: string,
  body: {
    plan?: string;
    extendMonths?: number;
    paymentStatus?: string;
    commissionRate?: number;
    commissionTerms?: string;
  }
) => apiFetch(`/admin/vendors/${id}/plan`, { method: 'POST', body: JSON.stringify(body) });

export const adminListPayments = () => apiFetch<{ payments: AdminPayment[] }>('/admin/payments').then((d) => d.payments);

export const adminVerifyPayment = (id: string, decision: 'verified' | 'rejected') =>
  apiFetch(`/admin/payments/${id}/verify`, { method: 'POST', body: JSON.stringify({ decision }) });

export const adminListCommissions = () => apiFetch<{ commissions: AdminCommission[] }>('/admin/commissions').then((d) => d.commissions);

export const adminRecordCommission = (vendorId: string, reference: string, saleAmount: number, note?: string) =>
  apiFetch('/admin/commissions', { method: 'POST', body: JSON.stringify({ vendorId, reference, saleAmount, note }) });

export const adminSetCommissionStatus = (id: string, status: 'pending' | 'settled' | 'disputed') =>
  apiFetch(`/admin/commissions/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });

export const adminListPromotions = () => apiFetch<{ promotions: AdminPromotion[] }>('/admin/promotions').then((d) => d.promotions);

export const adminFeature = (vendorId: string, productId?: string, note?: string) =>
  apiFetch('/admin/promotions', { method: 'POST', body: JSON.stringify({ vendorId, productId, note }) });

export const adminUnfeature = (id: string) => apiFetch(`/admin/promotions/${id}`, { method: 'DELETE' });

export const adminDeleteVendorProduct = async (id: string) => {
  await apiFetch(`/admin/vendor-products/${id}`, { method: 'DELETE' });
  invalidate('vendor-products');
  invalidate('products');
};
