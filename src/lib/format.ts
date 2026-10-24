export type Currency = 'USD' | 'NGN' | 'GBP' | 'CAD';

export const EXCHANGE_RATE_NGN = 1500;
export const EXCHANGE_RATE_GBP = 0.79;
export const EXCHANGE_RATE_CAD = 1.35;

// Product prices are stored in NGN. NGN renders as a whole-naira amount;
// other currencies convert down from the NGN price.
export const fmt = (n: number | null | undefined, currency: Currency = 'NGN'): string => {
  const value = Number(n ?? 0);
  if (currency === 'NGN') {
    return `₦${value.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
  }
  const usd = value / EXCHANGE_RATE_NGN;
  if (currency === 'GBP') return `£${(usd * EXCHANGE_RATE_GBP).toFixed(2)}`;
  if (currency === 'CAD') return `CA$${(usd * EXCHANGE_RATE_CAD).toFixed(2)}`;
  return `$${usd.toFixed(2)}`;
};

export function fmtDate(iso: string): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function fmtDateShort(iso: string): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}
