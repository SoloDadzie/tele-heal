/**
 * Caching service for Tele Heal
 * Implements in-memory caching with TTL support
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class CacheService {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Set a value in cache with optional TTL
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Get a value from cache if not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const isExpired = Date.now() - entry.timestamp > entry.ttl;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    const isExpired = Date.now() - entry.timestamp > entry.ttl;

    if (isExpired) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete a value from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get all cache keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    keys: string[];
    oldestEntry: number | null;
    newestEntry: number | null;
  } {
    const entries = Array.from(this.cache.values());

    if (entries.length === 0) {
      return {
        size: 0,
        keys: [],
        oldestEntry: null,
        newestEntry: null,
      };
    }

    const timestamps = entries.map((e) => e.timestamp);

    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      oldestEntry: Math.min(...timestamps),
      newestEntry: Math.max(...timestamps),
    };
  }
}

// Export singleton instance
export const cacheService = new CacheService();

/**
 * Cache key generators for common queries
 */
export const cacheKeys = {
  userProfile: (userId: string) => `user:profile:${userId}`,
  providerProfile: (providerId: string) => `provider:profile:${providerId}`,
  consultationQueue: (providerId: string) => `provider:queue:${providerId}`,
  providerTasks: (providerId: string) => `provider:tasks:${providerId}`,
  providerStats: (providerId: string) => `provider:stats:${providerId}`,
  paymentHistory: (userId: string) => `payment:history:${userId}`,
  appointmentList: (userId: string) => `appointment:list:${userId}`,
  messageHistory: (conversationId: string) => `message:history:${conversationId}`,
};

/**
 * Cache TTL constants
 */
export const cacheTTL = {
  SHORT: 1 * 60 * 1000, // 1 minute
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  LONG: 15 * 60 * 1000, // 15 minutes
  VERY_LONG: 60 * 60 * 1000, // 1 hour
};
