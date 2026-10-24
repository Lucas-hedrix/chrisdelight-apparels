import { Client, Account, Databases, Storage } from 'appwrite';
export { ID } from 'appwrite';

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;

export const appwriteConfig = {
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID ?? '',
  productsCollectionId: import.meta.env.VITE_APPWRITE_COLLECTION_ID ?? '',
  ordersCollectionId: import.meta.env.VITE_APPWRITE_ORDERS_COLLECTION_ID ?? '',
  bucketId: import.meta.env.VITE_APPWRITE_BUCKET_ID ?? '',
  evidenceBucketId: import.meta.env.VITE_APPWRITE_EVIDENCE_BUCKET_ID ?? '',
  notificationsCollectionId: import.meta.env.VITE_APPWRITE_NOTIFICATIONS_COLLECTION_ID ?? '',
};

export const isAppwriteConfigured = Boolean(endpoint && projectId);

export const client = new Client();
if (isAppwriteConfigured) {
  client.setEndpoint(endpoint).setProject(projectId);
}

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export const ADMIN_EMAILS = ['admin@example.com', 'christiegish@yahoo.com','gishisrael432@gmail.com'];
export const isAdmin = (email?: string) =>
  email ? ADMIN_EMAILS.includes(email.trim().toLowerCase()) : false;
