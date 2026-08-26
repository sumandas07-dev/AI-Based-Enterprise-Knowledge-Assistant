import {
    createChat,
    getEmployeeChats,
    getChatWithMessages,
    sendMessage,
} from "../services/chat.service.js";


// Create a new chat
export const createChatController = async (req, res) => {
    try {
        const employeeId = req.user?.userId;

        if (!employeeId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const { title, documentId } = req.body || {};

        // Title is optional
        const chatTitle =
            typeof title === "string" && title.trim()
                ? title.trim()
                : "New Chat";

        // documentId is optional
        if (
            documentId !== undefined &&
            documentId !== null &&
            typeof documentId !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid document ID",
            });
        }

        const chat = await createChat(
            employeeId,
            chatTitle,
            documentId || null
        );

        return res.status(201).json({
            success: true,
            message: "Chat created successfully",
            chat,
        });

    } catch (error) {
        console.error("Error createChatController:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create chat",
        });
    }
};


// Get all chats of the logged-in employee
export const getEmployeeChatsController = async (req, res) => {
    try {
        const employeeId = req.user?.userId;

        if (!employeeId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const chats = await getEmployeeChats(employeeId);

        return res.status(200).json({
            success: true,
            chats,
        });

    } catch (error) {
        console.error("Error getEmployeeChatsController:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch chats",
        });
    }
};


// Get one chat with all its messages
export const getChatWithMessagesController = async (req, res) => {
    try {
        const employeeId = req.user?.userId;
        const { chatId } = req.params;

        if (!employeeId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        if (!chatId) {
            return res.status(400).json({
                success: false,
                message: "Chat ID is required",
            });
        }

        const result = await getChatWithMessages(
            chatId,
            employeeId
        );

        return res.status(200).json({
            success: true,
            chat: result.chat,
            messages: result.messages,
        });

    } catch (error) {
        console.error("Error getChatWithMessagesController:", error);

        if (error.message === "Chat not found") {
            return res.status(404).json({
                success: false,
                message: "Chat not found",
            });
        }


        if (error.message === "Invalid chat ID") {
            return res.status(400).json({
                success: false,
                message: "Invalid chat ID",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to fetch chat",
        });
    }
};

// Send a message in a chat
export const sendMessageController = async (req, res) => {
    try {
        const employeeId = req.user?.userId;
        const { chatId } = req.params;
        const { content } = req.body || {};

        if (!employeeId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        if (!chatId) {
            return res.status(400).json({
                success: false,
                message: "Chat ID is required",
            });
        }

        if (typeof content !== "string") {
            return res.status(400).json({
                success: false,
                message: "Message must be a string",
            });
        }

        if (!content.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message cannot be empty",
            });
        }

        const result = await sendMessage(
            chatId,
            employeeId,
            content
        );

        return res.status(200).json({
            success: true,
            message: "Message sent successfully",
            userMessage: result.userMessage,
            assistantMessage: result.assistantMessage,
        });

    } catch (error) {
        console.error("Error sendMessageController:", error);

        if (error.message === "Chat not found") {
            return res.status(404).json({
                success: false,
                message: "Chat not found",
            });
        }

        if (error.message === "Invalid chat ID") {
            return res.status(400).json({
                success: false,
                message: "Invalid chat ID",
            });
        }

        if (error.message === "Message must be a string") {
            return res.status(400).json({
                success: false,
                message: "Message must be a string",
            });
        }

        if (error.message === "Message cannot be empty") {
            return res.status(400).json({
                success: false,
                message: "Message cannot be empty",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to send message",
        });
    }
};