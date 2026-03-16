const CACHE_PREFIX = 'studio201:';

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

function getStore() {
  if (typeof window === 'undefined') return null;
  return window.sessionStorage;
}

export function getCached<T>(key: string): T | null {
  const store = getStore();
  if (!store) return null;
  const raw = store.getItem(`${CACHE_PREFIX}${key}`);
  if (!raw) return null;
  try {
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (Date.now() > entry.expiresAt) {
      store.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }
    return entry.value;
  } catch {
    store.removeItem(`${CACHE_PREFIX}${key}`);
    return null;
  }
}

export function setCached<T>(key: string, value: T, ttlMs: number) {
  const store = getStore();
  if (!store) return;
  const entry: CacheEntry<T> = {
    value,
    expiresAt: Date.now() + ttlMs,
  };
  store.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
}
