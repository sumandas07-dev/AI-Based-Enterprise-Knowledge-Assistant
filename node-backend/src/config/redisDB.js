import { createClient } from 'redis';
import { envConfig } from './envConfig.js';

const redisClient = createClient({
    username: envConfig.REDIS_USERNAME,
    password: envConfig.REDIS_PASSWORD,
    socket: {
        host: envConfig.REDIS_HOST,
        port: Number(envConfig.REDIS_PORT),
        reconnectStrategy: (retries) => {
            // Keep retrying in the background every 5 seconds without crashing the server
            return 5000;
        }
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
        console.warn('Continuing server startup without Redis (Redis features will be disabled)...');
    }
};

export { redisClient, connectRedis };