import express from "express";

import {
    createChatController,
    getEmployeeChatsController,
    getChatWithMessagesController,
    sendMessageController,
    renameChatController,
    deleteChatController,
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

// Rename a chat
router.put(
    "/:chatId",
    authenticateUser,
    renameChatController
);

// Delete a chat
router.delete(
    "/:chatId",
    authenticateUser,
    deleteChatController
);


export default router;