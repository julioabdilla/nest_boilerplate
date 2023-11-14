import * as redis from 'redis';

import env from 'env';

export enum RedisExpiryType {
  SECONDS = 'EX',
  MILLISECONDS = 'PX',
}

export interface RedisExpiry {
  type?: RedisExpiryType;
  value: number;
}

export class RedisKeys {
  public static PREFIX = env.REDIS_PREFIX;
  public static AUTH_ACCESS_TOKEN = `${RedisKeys.PREFIX}:auth:access_token`;
  public static AUTH_REFRESH_TOKEN = `${RedisKeys.PREFIX}:auth:refresh_token`;
  public static AUTH_SESSION_ID = `${RedisKeys.PREFIX}:auth:session_id`;
  public static EXTERNAL_ID = `${RedisKeys.PREFIX}:external_id`;
}

export class RedisClient {

  public static async get(key: string): Promise<string> {
    return await RedisClient.client.get(key);
  }

  public static async set(key: string, value: any, expired?: RedisExpiry|number): Promise<void> {
    let expiry: RedisExpiry = null;
    if (expired) {
      if (typeof expired === 'number') {
        expiry = {
          type: RedisExpiryType.SECONDS,
          value: expired,
        }
      } else {
        expiry = expired;
      }
    }
    await RedisClient.client.set(key, value, expiry ? {
      [expiry.type || RedisExpiryType.SECONDS]: expiry.value,
    } : null);
  }

  public static async expire(key: string, expired: RedisExpiry): Promise<void> {
    let seconds = expired.value;
    if (expired.type === RedisExpiryType.MILLISECONDS) {
      seconds = seconds / 1000;
    }
    await RedisClient.client.expire(key, seconds);
  }

  public static async del(key: string): Promise<void> {
    await RedisClient.client.del(key);
  }

  public static client = redis.createClient({
    url: `redis://:${env.REDIS_PASSWORD}@${env.REDIS_HOST}:${env.REDIS_PORT}/${env.REDIS_DATABASE}`
  });
}

RedisClient.client.connect();
