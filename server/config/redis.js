import Redis from "ioredis";

let clients = {
    main: null,
    pub: null,
    sub: null,
};

export const initRedis = async () => {
    if (clients.main) return clients;

    const config = {
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,

        retryStrategy: (times) => Math.min(times * 100, 3000),
        maxRetriesPerRequest: null,
        enableReadyCheck: true,
    };

    clients.main = new Redis(config);
    clients.pub = new Redis(config);
    clients.sub = new Redis(config);

    Object.entries(clients).forEach(([key, client]) => {
        client.on("connect", () => console.log(`✅ [Redis] ${key} connected`));

        client.on("error", (err) => console.error(`❌ [Redis] ${key} error`, err));
    });

    await Promise.all([
        new Promise((res) => clients.main.once("ready", res)),
        new Promise((res) => clients.pub.once("ready", res)),
        new Promise((res) => clients.sub.once("ready", res)),
    ]);

    return clients;
};

export const getRedis = () => {
    if (!clients.main) throw new Error("Redis not initialized");
    return clients.main;
};

export const getRedisPub = () => {
    if (!clients.pub) throw new Error("Redis pub not initialized");
    return clients.pub;
};

export const getRedisSub = () => {
    if (!clients.sub) throw new Error("Redis sub not initialized");
    return clients.sub;
};

export const setOnline = (userId, socketId) =>
    getRedis().setex(`presence:${userId}`, 3600, socketId);

export const setOffline = (userId) => getRedis().del(`presence:${userId}`);

export const getSocketId = (userId) => getRedis().get(`presence:${userId}`);

export async function getUnreadCount(userId) {
    const redis = getRedis();
    const count = await redis.get(`unread:${userId}`);
    return parseInt(count) || 0;
}

export async function incrementUnreadCount(userId) {
    const redis = getRedis();
    await redis.incr(`unread:${userId}`);
}

export async function decrementUnreadCount(userId) {
    const redis = getRedis();
    await redis.decr(`unread:${userId}`);
}

export async function resetUnreadCount(userId, count = 0) {
    const redis = getRedis();
    await redis.set(`unread:${userId}`, count);
}