import { ID, Permission, Role } from 'appwrite';
import { databases, appwriteConfig, isAppwriteConfigured } from './appwrite';
import { apiFetch } from './vendorClient';

export type NotificationType = 'order' | 'payment' | 'shipping' | 'system' | 'promo';

export interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  relatedId?: string;
}

export async function createNotification(params: CreateNotificationParams) {
  if (!isAppwriteConfigured || !appwriteConfig.notificationsCollectionId) return;
  try {
    await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      ID.unique(),
      {
        userId: params.userId,
        title: params.title,
        message: params.message,
        type: params.type,
        read: false,
        relatedId: params.relatedId ?? '',
        href: '',
      },
      [
        Permission.read(Role.user(params.userId)),
        Permission.update(Role.user(params.userId)),
        Permission.delete(Role.user(params.userId)),
      ]
    );
  } catch (err) {
    console.warn('Failed to create notification:', err);
  }
}

/** In-app notification + purchase confirmation email (via /api/notify/order). */
export async function createOrderNotification(
  userId: string,
  orderId: string,
  method: string,
  status: string,
  total?: number
) {
  try {
    await apiFetch('/notify/order', {
      method: 'POST',
      body: JSON.stringify({ orderId, method, status, total }),
    });
    return;
  } catch (err) {
    console.warn('Purchase notify API failed, falling back to in-app only:', err);
  }

  const methodLabel = method === 'paystack' ? 'Paystack' : 'Crypto';
  const statusLabel = status === 'paid' ? 'confirmed' : 'pending approval';
  await createNotification({
    userId,
    title: 'Order Placed Successfully',
    message: `Your order #${orderId.slice(-6).toUpperCase()} has been placed and is ${statusLabel}. Payment method: ${methodLabel}.`,
    type: 'order',
    relatedId: orderId,
  });
}

export async function createOrderStatusNotification(userId: string, orderId: string, newStatus: string) {
  const statusMessages: Record<string, { title: string; message: string }> = {
    paid: {
      title: 'Payment Confirmed',
      message: `Your payment for order #${orderId.slice(-6).toUpperCase()} has been confirmed.`,
    },
    processing: {
      title: 'Order Processing',
      message: `Your order #${orderId.slice(-6).toUpperCase()} is now being processed.`,
    },
    shipped: {
      title: 'Order Shipped',
      message: `Your order #${orderId.slice(-6).toUpperCase()} has been shipped!`,
    },
    delivered: {
      title: 'Order Delivered',
      message: `Your order #${orderId.slice(-6).toUpperCase()} has been delivered.`,
    },
    cancelled: {
      title: 'Order Cancelled',
      message: `Your order #${orderId.slice(-6).toUpperCase()} has been cancelled.`,
    },
    rejected: {
      title: 'Payment Rejected',
      message: `Your crypto payment for order #${orderId.slice(-6).toUpperCase()} was rejected. Please contact support.`,
    },
  };

  const config = statusMessages[newStatus];
  if (config) {
    await createNotification({
      userId,
      title: config.title,
      message: config.message,
      type: 'order',
      relatedId: orderId,
    });
  }
}

export async function notifyWelcome() {
  try {
    await apiFetch('/notify/welcome', { method: 'POST', body: '{}' });
  } catch (err) {
    console.warn('Welcome notification failed:', err);
  }
}
