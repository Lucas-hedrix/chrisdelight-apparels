import { Client, Account, Databases, Storage, ID } from 'appwrite';
export { ID };

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;

export const client = new Client();
client.setEndpoint(endpoint).setProject(projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export const APPWRITE_CONFIG = {
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
  collectionId: import.meta.env.VITE_APPWRITE_COLLECTION_ID,
  bucketId: import.meta.env.VITE_APPWRITE_BUCKET_ID,
};

export const ADMIN_EMAILS = ['admin@example.com', 'christiegish@yahoo.com'];
export const isAdmin = (email?: string) => email ? ADMIN_EMAILS.includes(email.trim().toLowerCase()) : false;
