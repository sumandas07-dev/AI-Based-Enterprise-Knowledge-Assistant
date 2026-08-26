import { createClient } from 'redis';
import { envConfig } from './envConfig.js';

const redisClient = createClient({
    username: envConfig.REDIS_USERNAME,
    password: envConfig.REDIS_PASSWORD,
    socket: {
        host: envConfig.REDIS_HOST,
        port: Number(envConfig.REDIS_PORT)
    }
});

redisClient.on('error', err => {
    console.log('Redis Client Error', err)
});

const connectRedis = async () => {
    try {
        await redisClient.connect();
        console.log("Redis DB connected successfully...");
    } catch(err) {
        console.error('Redis connection failed...', err.message);
        process.exit(1);
    }
};

export { redisClient, connectRedis };