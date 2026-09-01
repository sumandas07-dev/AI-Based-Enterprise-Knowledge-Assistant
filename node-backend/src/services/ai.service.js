import axios from "axios";


const AI_SERVICE_URL = "http://127.0.0.1:8001";


export const queryAI = async ({
    question,
    documentId = null,
    chatHistory = [],
}) => {

    console.log("\n========== AI REQUEST ==========");
    console.log("Question:", question);
    console.log("Document ID:", documentId);
    console.log("Chat history count:", chatHistory.length);
    console.log("Chat history:", chatHistory);
    console.log("================================\n");

    const response = await axios.post(
        `${AI_SERVICE_URL}/query`,
        {
            question,
            document_id: documentId,
            chat_history: chatHistory,
        },
        {
            timeout: 120000,
        }
    );

    return response.data;
};