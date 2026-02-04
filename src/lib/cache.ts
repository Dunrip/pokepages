type Entry<T> = { value: T; expiresAt: number };

const store = new Map<string, Entry<unknown>>();

export function getCached<T>(key: string): T | undefined {
  const e = store.get(key);
  if (!e) return undefined;
  if (Date.now() > e.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return e.value as T;
}

export function setCached<T>(key: string, value: T, ttlMs: number) {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export async function fetchJSONCached<T>(
  key: string,
  url: string,
  init?: RequestInit,
  ttlMs = 1000 * 60 * 10
): Promise<T> {
  const cached = getCached<T>(key);
  if (cached !== undefined) return cached;

  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const json = (await res.json()) as T;
  setCached(key, json, ttlMs);
  return json;
}
