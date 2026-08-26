import mongoose from "mongoose";

import Chat from "../models/chat.schema.js";
import Message from "../models/messages.schema.js";
import { queryAI } from "./ai.service.js";


// Create a new chat
export const createChat = async (
    employeeId,
    title = "New Chat",
    documentId = null
) => {

    if (!employeeId) {
        throw new Error("Employee ID is required");
    }

    // Validate ObjectIds before sending them to MongoDB
    if (!mongoose.isValidObjectId(employeeId)) {
        throw new Error("Invalid employee ID");
    }

    if (documentId && !mongoose.isValidObjectId(documentId)) {
        throw new Error("Invalid document ID");
    }

    const chat = await Chat.create({
        employeeId,
        title,
        documentId,
    });

    return chat;
};


// Get all chats belonging to an employee
export const getEmployeeChats = async (employeeId) => {

    if (!employeeId) {
        throw new Error("Employee ID is required");
    }

    if (!mongoose.isValidObjectId(employeeId)) {
        throw new Error("Invalid employee ID");
    }

    const chats = await Chat.find({
        employeeId,
    })
        .sort({ updatedAt: -1 })
        .lean();

    return chats;
};


// Get one chat belonging to the employee
export const getChatById = async (chatId, employeeId) => {

    if (!chatId) {
        throw new Error("Chat ID is required");
    }

    if (!mongoose.isValidObjectId(chatId)) {
        throw new Error("Invalid chat ID");
    }

    if (!employeeId) {
        throw new Error("Employee ID is required");
    }

    if (!mongoose.isValidObjectId(employeeId)) {
        throw new Error("Invalid employee ID");
    }

    const chat = await Chat.findOne({
        _id: chatId,
        employeeId,
    }).lean();

    if (!chat) {
        throw new Error("Chat not found");
    }

    return chat;
};


// Get a chat along with all of its messages
export const getChatWithMessages = async (
    chatId,
    employeeId
) => {

    // First verify ownership
    const chat = await getChatById(
        chatId,
        employeeId
    );

    const messages = await Message.find({
        chatId,
    })
        .sort({ createdAt: 1 })
        .lean();

    return {
        chat,
        messages,
    };
};


// Get the previous 5 messages for AI context
export const getPreviousMessages = async (chatId) => {

    if (!chatId) {
        throw new Error("Chat ID is required");
    }

    if (!mongoose.isValidObjectId(chatId)) {
        throw new Error("Invalid chat ID");
    }

    const messages = await Message.find({
        chatId,
    })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

    // MongoDB returned newest → oldest.
    // AI should receive oldest → newest.
    return messages.reverse();
};

export const sendMessage = async (
    chatId,
    employeeId,
    content
) => {

    // 1. Verify chat exists and belongs to employee
    const chat = await getChatById(
        chatId,
        employeeId
    );

    // 2. Validate message
    if (typeof content !== "string") {
        throw new Error("Message must be a string");
    }

    const messageContent = content.trim();

    if (!messageContent) {
        throw new Error("Message cannot be empty");
    }

    // 3. Get previous 5 messages BEFORE saving
    //    the current user message.
    const previousMessages = await getPreviousMessages(
        chatId
    );

    // 4. Convert MongoDB messages into the format
    //    expected by the Python AI service.
    const chatHistory = previousMessages.map(
        (message) => ({
            role: message.role,
            content: message.content,
        })
    );

    // 5. Save current user message
    const userMessage = await Message.create({
        chatId,
        role: "user",
        content: messageContent,
    });

    try {

        // 6. Ask the AI service
        const aiResponse = await queryAI({
            question: messageContent,
            documentId: chat.documentId || null,
            chatHistory,
        });

        // 7. Validate AI response
        if (
            !aiResponse ||
            typeof aiResponse.answer !== "string" ||
            !aiResponse.answer.trim()
        ) {
            throw new Error("AI service returned an invalid response");
        }

        // 8. Save assistant message
        const assistantMessage = await Message.create({
            chatId,
            role: "assistant",
            content: aiResponse.answer,
            sources: Array.isArray(aiResponse.sources)
                ? aiResponse.sources
                : [],
        });

        // 9. Update chat's updatedAt
        await Chat.findByIdAndUpdate(
            chatId,
            {
                $currentDate: {
                    updatedAt: true,
                },
            }
        );

        return {
            userMessage,
            assistantMessage,
        };

    } catch (error) {

        console.error(
            "AI message processing failed:",
            error
        );

        throw error;
    }
};