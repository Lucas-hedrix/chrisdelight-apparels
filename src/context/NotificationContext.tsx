import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { Query } from 'appwrite';
import { databases, appwriteConfig, isAppwriteConfigured } from '../lib/appwrite';
import { useAuth } from './AuthContext';

export interface Notification {
  $id: string;
  $createdAt: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'payment' | 'shipping' | 'system' | 'promo';
  read: boolean;
  relatedId?: string;
  href?: string;
}

interface NotificationValue {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationValue | null>(null);
export const useNotifications = () => useContext(NotificationContext)!;

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user, ready: authReady } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!isAppwriteConfigured || !user || !appwriteConfig.notificationsCollectionId) return;
    setLoading(true);
    try {
      const res = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.notificationsCollectionId,
        [
          Query.equal('userId', user.$id),
          Query.orderDesc('$createdAt'),
          Query.limit(50),
        ]
      );
      setNotifications(res.documents as unknown as Notification[]);
    } catch (err) {
      console.warn('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authReady && user) {
      fetchNotifications();
    }
  }, [authReady, user, fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    if (!isAppwriteConfigured || !appwriteConfig.notificationsCollectionId) return;
    try {
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.notificationsCollectionId,
        id,
        { read: true }
      );
      setNotifications((prev) => prev.map((n) => (n.$id === id ? { ...n, read: true } : n)));
    } catch (err) {
      console.warn('Failed to mark notification as read:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!isAppwriteConfigured || !appwriteConfig.notificationsCollectionId) return;
    const unread = notifications.filter((n) => !n.read);
    try {
      await Promise.all(
        unread.map((n) =>
          databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.notificationsCollectionId,
            n.$id,
            { read: true }
          )
        )
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.warn('Failed to mark all notifications as read:', err);
    }
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}