import Redis from 'ioredis';

const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
    retryStrategy: (times) => Math.min(times * 100, 3000),
    enableOfflineQueue: false,
};

export const redisClient = new Redis(redisConfig);
export const redisPub = new Redis(redisConfig);
export const redisSub = new Redis(redisConfig);

redisClient.on('connect', () => console.log('[Redis] main client connected'));
redisPub.on('connect', () => console.log('[Redis] pub client connected'));
redisSub.on('connect', () => console.log('[Redis] sub client connected'));

[redisClient, redisPub, redisSub].forEach(c =>
    c.on('error', (e) => console.error('[Redis] error:', e.message))
);
export const setOnline = (userId, socketId) =>
    redisClient.setex(`presence:${userId}`, 3600, socketId);

export const setOffline = (userId) =>
    redisClient.del(`presence:${userId}`);

export const getSocketId = (userId) =>
    redisClient.get(`presence:${userId}`);

// // ── Unread badge counter (use main client) ────────────────────────────────────
// export const incrUnread  = (userId) => redisClient.incr(`unread:${userId}`);
// export const resetUnread = (userId) => redisClient.set(`unread:${userId}`, 0);
// export const syncUnread  = (userId, count) => redisClient.set(`unread:${userId}`, count);

// export const decrUnread  = async (userId) => {
//   const val  = await redisClient.get(`unread:${userId}`);
//   const next = Math.max(0, (parseInt(val) || 0) - 1);
//   await redisClient.set(`unread:${userId}`, next);
//   return next;
// };