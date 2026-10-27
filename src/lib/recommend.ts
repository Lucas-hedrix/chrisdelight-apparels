import { isNewArrival, type Product } from './products';

type CartSignal = { productId: string; category: string };

/**
 * Category-affinity picks: wishlist carries the strongest signal, cart next.
 * Already-saved/carted products are excluded; new arrivals, ratings and sale
 * items break ties. Deterministic ordering.
 */
export function recommendForYou(
  products: Product[],
  wishlist: Product[],
  cart: CartSignal[],
  limit = 3,
): Product[] {
  const signalIds = new Set<string>([
    ...wishlist.map((p) => p.id),
    ...cart.map((i) => i.productId),
  ]);

  const weights = new Map<string, number>();
  const bump = (key: string, weight: number) =>
    weights.set(key, (weights.get(key) ?? 0) + weight);
  wishlist.forEach((p) => {
    bump(p.category, 3);
    if (p.subCategory) bump(p.subCategory, 2);
  });
  cart.forEach((i) => bump(i.category, 2));

  return products
    .filter((p) => !signalIds.has(p.id) && !p.soldOut)
    .map((p) => {
      let score = weights.get(p.category) ?? 0;
      if (p.subCategory) score += (weights.get(p.subCategory) ?? 0) * 0.5;
      if (isNewArrival(p)) score += 1;
      if (p.rating != null) score += p.rating / 5;
      if (p.salePrice != null) score += 0.25;
      return { p, score };
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        (b.p.rating ?? 0) - (a.p.rating ?? 0) ||
        a.p.name.localeCompare(b.p.name),
    )
    .slice(0, limit)
    .map((x) => x.p);
}
