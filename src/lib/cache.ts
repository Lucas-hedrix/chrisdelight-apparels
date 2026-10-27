type Entry = { at: number; value: unknown };

const store = new Map<string, Entry>();
const inflight = new Map<string, Promise<unknown>>();

/** TTLs for the data libs. Kept short so admin/vendor edits show quickly. */
export const TTL = {
  categories: 5 * 60_000,
  products: 60_000,
} as const;

/**
 * In-memory cache with TTL and single-flight dedup (concurrent callers share
 * one request). Only resolved values are stored — a failed load is retried on
 * the next call. Cleared on page reload.
 */
export function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const hit = store.get(key);
  if (hit && Date.now() - hit.at < ttlMs) return Promise.resolve(hit.value as T);

  const pending = inflight.get(key);
  if (pending) return pending as Promise<T>;

  const p = load()
    .then((value) => {
      store.set(key, { at: Date.now(), value });
      return value;
    })
    .finally(() => {
      inflight.delete(key);
    });
  inflight.set(key, p);
  return p;
}

/** Drop cached entries — with a prefix, only keys starting with it. */
export function invalidate(prefix?: string) {
  if (!prefix) {
    store.clear();
    return;
  }
  for (const key of [...store.keys()]) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}
