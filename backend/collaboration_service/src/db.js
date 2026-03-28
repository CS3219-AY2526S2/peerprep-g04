import { createClient, RESP_TYPES } from 'redis'
import * as Y from 'yjs'

export const redis = createClient({
  url: process.env.REDIS_URL
});

redis.on("error", (err) => console.error("Redis error:", err));

await redis.connect();

const redisBuffer = redis.withTypeMapping({
  [RESP_TYPES.BLOB_STRING]: Buffer
});

export const redisPersistence = {
  bindState: async (docname, ydoc) => {
    const raw = await redisBuffer.get(docname);
    if (!raw) return;

    try {
      Y.applyUpdate(ydoc, new Uint8Array(raw));
    } catch (err) {
      console.log(`Failed to save ${docname}`);
      await redis.del(docname);
    }
  },

  writeState: async (docname, ydoc) => {
    const update = Y.encodeStateAsUpdate(ydoc); 
    await redis.set(docname, Buffer.from(update)); 
  }
}