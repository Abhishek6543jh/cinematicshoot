import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private isConnected = false;
  private memoryCache = new Map<string, { value: string; expiresAt?: number }>();

  onModuleInit() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    this.client = new Redis(redisUrl, {
      maxRetriesPerRequest: 0,
      connectTimeout: 1000,
    });

    this.client.on('connect', () => {
      this.isConnected = true;
      console.log('[REDIS] Connected successfully to Redis server');
    });

    this.client.on('error', (err) => {
      this.isConnected = false;
      // Keep logs quiet after first failure to avoid spamming the terminal
    });
  }

  async onModuleDestroy() {
    try {
      await this.client.quit();
    } catch {}
  }

  async get(key: string): Promise<string | null> {
    if (this.isConnected) {
      try {
        return await this.client.get(key);
      } catch (err) {
        // fall back to memory
      }
    }

    const item = this.memoryCache.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (this.isConnected) {
      try {
        if (ttlSeconds) {
          await this.client.set(key, value, 'EX', ttlSeconds);
        } else {
          await this.client.set(key, value);
        }
        return;
      } catch (err) {
        // fall back to memory
      }
    }

    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
    this.memoryCache.set(key, { value, expiresAt });
  }

  async del(key: string): Promise<void> {
    if (this.isConnected) {
      try {
        await this.client.del(key);
        return;
      } catch (err) {
        // fall back to memory
      }
    }

    this.memoryCache.delete(key);
  }
}

