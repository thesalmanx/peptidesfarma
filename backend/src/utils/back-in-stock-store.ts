// Tracks who's waiting for a variant to come back in stock.

import Redis from "ioredis"

let redis: Redis | null = null
function client(): Redis {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
      maxRetriesPerRequest: 3,
      lazyConnect: false,
    })
  }
  return redis
}

const key = (variantId: string) => `bis:${variantId}`

export async function trackSubscriber(email: string, variantId: string): Promise<void> {
  await client().sadd(key(variantId), email.toLowerCase().trim())
}

export async function getSubscribers(variantId: string): Promise<string[]> {
  return client().smembers(key(variantId))
}

export async function clearSubscribers(variantId: string): Promise<void> {
  await client().del(key(variantId))
}
