import Redis from 'ioredis';

class CacheService {
  private redis: Redis | null = null;
  private isRedisConnected = false;
  private memoryStore = new Map<string, { value: string; expiresAt?: number }>();

  constructor() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    try {
      this.redis = new Redis(redisUrl, {
        lazyConnect: true,
        connectTimeout: 2000,
        maxRetriesPerRequest: 1,
        retryStrategy: () => null, // Don't infinite retry if offline
      });

      this.redis.connect()
        .then(() => {
          this.isRedisConnected = true;
          console.log('⚡ Connected to Redis successfully');
        })
        .catch(() => {
          this.isRedisConnected = false;
          console.log('ℹ️ Redis offline: transparently utilizing in-memory cache & rate limiter fallback');
        });

      this.redis.on('error', () => {
        this.isRedisConnected = false;
      });
    } catch {
      this.isRedisConnected = false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.isRedisConnected && this.redis) {
      try {
        const val = await this.redis.get(key);
        return val ? JSON.parse(val) : null;
      } catch {
        // Fallback
      }
    }

    const item = this.memoryStore.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.memoryStore.delete(key);
      return null;
    }
    return JSON.parse(item.value);
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (this.isRedisConnected && this.redis) {
      try {
        if (ttlSeconds) {
          await this.redis.set(key, serialized, 'EX', ttlSeconds);
        } else {
          await this.redis.set(key, serialized);
        }
        return;
      } catch {
        // Fallback
      }
    }

    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
    this.memoryStore.set(key, { value: serialized, expiresAt });
  }

  async del(key: string): Promise<void> {
    if (this.isRedisConnected && this.redis) {
      try {
        await this.redis.del(key);
        return;
      } catch {
        // Fallback
      }
    }
    this.memoryStore.delete(key);
  }

  async rateLimit(
    key: string,
    limit: number,
    windowSeconds: number
  ): Promise<{ allowed: boolean; remaining: number; resetInSeconds: number }> {
    const prefixedKey = `ratelimit:${key}`;

    if (this.isRedisConnected && this.redis) {
      try {
        const count = await this.redis.incr(prefixedKey);
        if (count === 1) {
          await this.redis.expire(prefixedKey, windowSeconds);
        }
        const ttl = await this.redis.ttl(prefixedKey);
        return {
          allowed: count <= limit,
          remaining: Math.max(0, limit - count),
          resetInSeconds: Math.max(0, ttl),
        };
      } catch {
        // Fallback to memory
      }
    }

    const now = Date.now();
    const item = this.memoryStore.get(prefixedKey);

    if (!item || (item.expiresAt && now > item.expiresAt)) {
      const expiresAt = now + windowSeconds * 1000;
      this.memoryStore.set(prefixedKey, { value: '1', expiresAt });
      return {
        allowed: true,
        remaining: limit - 1,
        resetInSeconds: windowSeconds,
      };
    }

    const currentCount = parseInt(item.value, 10) + 1;
    this.memoryStore.set(prefixedKey, { value: String(currentCount), expiresAt: item.expiresAt });
    const resetInSeconds = Math.max(0, Math.ceil(((item.expiresAt || now) - now) / 1000));

    return {
      allowed: currentCount <= limit,
      remaining: Math.max(0, limit - currentCount),
      resetInSeconds,
    };
  }
}

export const cache = new CacheService();

