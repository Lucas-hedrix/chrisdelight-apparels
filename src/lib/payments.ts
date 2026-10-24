import { Permission, Role } from 'appwrite';
import { appwriteConfig } from './appwrite';

export const CRYPTO_WALLETS = [
  {
    coin: 'SOL',
    name: 'Solana',
    network: 'Solana',
    address: 'EKE4s82tBpaiVBKFPCMp2EjoDUTVVHoH8aLEwCtg4g8k',
  },
  {
    coin: 'ETH',
    name: 'Ethereum',
    network: 'ERC-20',
    address: '0x509dc30a012a8bb3bbed57001389fc741105eb97',
  },
  {
    coin: 'BTC',
    name: 'Bitcoin',
    network: 'Bitcoin',
    address: '1DeQKKmd9sZhrXkMUz29dwAM6nWZbkaqa5',
  },
];

export function evidenceFileUrl(fileId: string): string | null {
  if (!fileId || !appwriteConfig.evidenceBucketId) return null;
  return `${import.meta.env.VITE_APPWRITE_ENDPOINT}/storage/buckets/${appwriteConfig.evidenceBucketId}/files/${fileId}/view?project=${import.meta.env.VITE_APPWRITE_PROJECT_ID}`;
}

export const paystackPublicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY ?? '';
export const isPaystackConfigured = Boolean(paystackPublicKey);

let paystackPromise: Promise<any> | null = null;

export function loadPaystack(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject(new Error('No window'));
  if ((window as any).PaystackPop) return Promise.resolve((window as any).PaystackPop);
  if (!paystackPromise) {
    paystackPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.onload = () => resolve((window as any).PaystackPop);
      script.onerror = () => {
        paystackPromise = null;
        reject(new Error("Couldn't load Paystack. Check your connection and try again."));
      };
      document.head.appendChild(script);
    });
  }
  return paystackPromise;
}

// Client requests may only grant permissions to the session user itself, so
// orders/evidence are created with owner-only access. Admin read access has to
// be added server-side (API key or Appwrite Function) once orders go live.
export function orderPermissions(userId: string) {
  return [Permission.read(Role.user(userId))];
}

export function evidencePermissions(userId: string) {
  return [Permission.read(Role.user(userId))];
}
