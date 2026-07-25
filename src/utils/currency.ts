import { type Currency, EXCHANGE_RATE_NGN, EXCHANGE_RATE_GBP, EXCHANGE_RATE_CAD } from '../App';

export function formatPrice(priceInUSD: number, currency: Currency): string {
  if (currency === 'USD') {
    return `$${priceInUSD.toFixed(2)}`;
  } else if (currency === 'NGN') {
    const priceInNGN = priceInUSD * EXCHANGE_RATE_NGN;
    // Format NGN with commas
    return `₦${priceInNGN.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  } else if (currency === 'GBP') {
    const priceInGBP = priceInUSD * EXCHANGE_RATE_GBP;
    return `£${priceInGBP.toFixed(2)}`;
  } else if (currency === 'CAD') {
    const priceInCAD = priceInUSD * EXCHANGE_RATE_CAD;
    return `CA$${priceInCAD.toFixed(2)}`;
  }
  return `$${priceInUSD.toFixed(2)}`;
}
