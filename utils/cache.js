/**
 * In-Memory Caching Engine for High-Performance API Responses
 * Provides microsecond response times for read-heavy routes (Tasks, Dashboard Stats, User Sessions)
 * Automatically invalidates on mutations (Create, Update, Delete) to guarantee 100% data consistency.
 */

class MemoryCache {
  constructor() {
    this.store = new Map();

    // Auto-clean expired entries every 2 minutes
    this.cleanupInterval = setInterval(() => {
      this.purgeExpired();
    }, 2 * 60 * 1000);

    // Ensure timer doesn't block node process exit in tests
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value;
  }

  set(key, value, ttlSeconds = 30) {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  delete(key) {
    this.store.delete(key);
  }

  /**
   * Invalidate all cached data for a specific user ID
   * Called immediately on task creation, modification, deletion, or user update
   */
  invalidateUser(userId) {
    if (!userId) return;
    const prefix = `user:${userId.toString()}`;

    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }

  purgeExpired() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }

  clear() {
    this.store.clear();
  }
}

module.exports = new MemoryCache();
