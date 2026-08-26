import express from "express";

import {
    createChatController,
    getEmployeeChatsController,
    getChatWithMessagesController,
    sendMessageController,
} from "../controllers/chat.controller.js";

import { authenticateUser } from "../middleware/auth.middleware.js";


const router = express.Router();


// Create a new chat
router.post(
    "/",
    authenticateUser,
    createChatController
);


// Get all chats of logged-in employee
router.get(
    "/",
    authenticateUser,
    getEmployeeChatsController
);

// Send a message
router.post(
    "/:chatId/message",
    authenticateUser,
    sendMessageController
);

// Get one chat with all messages
router.get(
    "/:chatId",
    authenticateUser,
    getChatWithMessagesController
);


export default router;