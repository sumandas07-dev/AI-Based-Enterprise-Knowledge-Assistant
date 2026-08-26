import mongoose from 'mongoose';
import { envConfig } from './envConfig.js';

const connectMongoDB = async () => {
    try {
        await mongoose.connect(envConfig.MONGODB_URI);
        console.log("MongoDB connected successfully...");
    }
    catch (error) {
        console.log(`MongoDB connection failed... ${error.message}`);
        process.exit(1);
    }
};

export default connectMongoDB;