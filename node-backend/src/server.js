import express from "express";
import cookieParser from "cookie-parser";

import connectMongoDB from "./config/mongoDB.js";
import { connectRedis } from "./config/redisDB.js";
import { envConfig } from "./config/envConfig.js";

import authRoutes from "./routes/auth.route.js";
import employeeRoutes from "./routes/employee.route.js";
import chatRoutes from "./routes/chat.route.js";


const app = express();

app.use(cookieParser());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/chats", chatRoutes);

// Global error handler
app.use((err, req, res, next) => {

    console.error(err);

    res.status(500).json({
        success: false,
        message: err.message || "Internal server error",
    });
});


const startServer = async () => {
    try {
        await connectMongoDB();
        await connectRedis();

        app.listen(envConfig.PORT, () => {
            console.log(`AI Service is running on port ${envConfig.PORT}....`);
        });
    }
    catch (err) {
        console.log('Server connection failed...');
        process.exit(1);
    }
}

startServer();