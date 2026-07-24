import { type Currency, EXCHANGE_RATE_NGN } from '../App';

export function formatPrice(priceInUSD: number, currency: Currency): string {
  if (currency === 'USD') {
    return `$${priceInUSD.toFixed(2)}`;
  } else {
    const priceInNGN = priceInUSD * EXCHANGE_RATE_NGN;
    // Format NGN with commas
    return `₦${priceInNGN.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }
}
