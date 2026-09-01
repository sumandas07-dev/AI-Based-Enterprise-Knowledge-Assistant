import express from "express";
import cookieParser from "cookie-parser";

import connectMongoDB from "./config/mongoDB.js";
import { connectRedis } from "./config/redisDB.js";
import { envConfig } from "./config/envConfig.js";

import authRoutes from "./routes/auth.route.js";
import employeeRoutes from "./routes/employee.route.js";
import chatRoutes from "./routes/chat.route.js";
import documentRoutes from "./routes/document.route.js";
import statisticsRoutes from "./routes/statistics.route.js";

import { sendSingleMessageController } from "./controllers/chat.controller.js";
import { authenticateUser } from "./middleware/auth.middleware.js";


const app = express();

app.use(cookieParser());
app.use(express.json());

// Custom CORS Middleware to handle credentials and dynamic preflight
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && origin.startsWith("http://localhost:")) {
        res.header("Access-Control-Allow-Origin", origin);
    } else {
        res.header("Access-Control-Allow-Origin", "http://localhost:5173");
    }
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With");
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

// Health check endpoint for frontend liveness checks
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        service: "node-backend"
    });
});

app.use('/api/auth', authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/history", chatRoutes); // Maps history requests to chat router
app.use("/api/documents", documentRoutes);
app.use("/api/statistics", statisticsRoutes);
app.post("/api/chat", authenticateUser, sendSingleMessageController); // Unified messaging endpoint

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