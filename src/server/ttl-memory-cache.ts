interface CacheEntry<T> {
  readonly value: T;
  readonly expiresAtMs: number;
}

export class TtlMemoryCache {
  private readonly store = new Map<string, CacheEntry<unknown>>();
  private readonly defaultTtlMs: number;

  constructor(defaultTtlMs: number) {
    this.defaultTtlMs = defaultTtlMs;
  }

  get<T>(key: string): T | undefined {
    const hit = this.store.get(key) as CacheEntry<T> | undefined;
    if (!hit) {
      return undefined;
    }
    if (Date.now() >= hit.expiresAtMs) {
      this.store.delete(key);
      return undefined;
    }
    return hit.value;
  }

  set<T>(key: string, value: T, ttlMs?: number): void {
    const ttl: number = ttlMs ?? this.defaultTtlMs;
    this.store.set(key, {
      value,
      expiresAtMs: Date.now() + ttl,
    });
  }
}
