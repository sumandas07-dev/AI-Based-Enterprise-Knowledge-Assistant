import express from "express";
import cors from "cors";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { randomUUID } from "crypto";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import axios from "axios";

import {
    getDocuments,
    addDocument,
    deleteDocument,
    getConversations,
    getConversation,
    addConversation,
    updateConversation,
    deleteConversation,
    getSettings,
    updateSettings
} from "./db.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const PYTHON_AI_SERVICE_URL = process.env.PYTHON_AI_SERVICE_URL || "http://localhost:8000";

// Ensure upload directory exists
const UPLOAD_DIR = path.join(__dirname, "temp_uploads");
await fs.mkdir(UPLOAD_DIR, { recursive: true });

// Setup multer for temp file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        cb(null, `${randomUUID()}_${file.originalname}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf" || file.originalname.endsWith(".pdf")) {
            cb(null, true);
        } else {
            cb(new Error("Only PDF files are supported."));
        }
    }
});

// Configure CORS
app.use(cors({
    origin: "*", // allow all origins for development/production flexibility
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Initialize Cloudinary
const isCloudinaryConfigured = 
    process.env.CLOUDINARY_CLOUD_NAME && 
    process.env.CLOUDINARY_API_KEY && 
    process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    console.log("Cloudinary successfully configured.");
} else {
    console.warn("WARNING: Cloudinary environment variables are missing! Document uploads will fail.");
}

// Helper to check python AI service health
async function checkPythonHealth() {
    try {
        const res = await axios.get(`${PYTHON_AI_SERVICE_URL}/health`, { timeout: 1000 });
        return res.status === 200;
    } catch {
        return false;
    }
}

// Health check endpoint for React frontend
app.get("/health", (req, res) => {
    res.json({ status: "healthy" });
});

// Express gateway API health endpoint
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "node-backend" });
});

// ============================================
// AUTH ROUTES
// ============================================

app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
    }

    // In a real application, check database credentials.
    // For this implementation, accept any standard email & password.
    res.json({
        token: "jwt-token-enterprise-knowledge-assistant",
        user: {
            id: "1",
            name: "Enterprise Admin",
            email: email,
            role: "administrator"
        }
    });
});

app.get("/api/auth/me", (req, res) => {
    // Return standard mock user for authenticated requests
    res.json({
        id: "1",
        name: "Enterprise Admin",
        email: "admin@enterprise.com",
        role: "administrator"
    });
});

// ============================================
// CHAT & RAG ROUTES
// ============================================

app.post("/api/chat", async (req, res) => {
    const { question, conversationId, document_id } = req.body;

    if (!question) {
        return res.status(400).json({ error: "Question is required." });
    }

    try {
        let currentConvoId = conversationId;
        let convo;

        if (!currentConvoId) {
            currentConvoId = randomUUID();
            // Generate conversation title from the first 5 words of the question
            const title = question.split(" ").slice(0, 5).join(" ") + (question.split(" ").length > 5 ? "..." : "");
            convo = await addConversation({
                id: currentConvoId,
                title,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                messages: []
            });
        } else {
            convo = await getConversation(currentConvoId);
            if (!convo) {
                return res.status(404).json({ error: "Conversation not found." });
            }
        }

        // Add user message
        const userMsg = {
            id: randomUUID(),
            sender: "user",
            content: question,
            createdAt: new Date().toISOString()
        };
        convo.messages.push(userMsg);

        // Fetch answer from Python AI service
        let answer = "The AI service is currently unavailable. Please verify that the python RAG system is running.";
        let sources = [];

        const isPythonActive = await checkPythonHealth();
        if (isPythonActive) {
            try {
                // Map recent chat history for query rewriting context
                const chatHistory = convo.messages
                    .slice(0, -1) // Exclude the user message we just pushed
                    .slice(-4)    // Keep only last 4 messages for token efficiency
                    .map(msg => ({
                        role: msg.sender === "user" ? "user" : "assistant",
                        content: msg.content
                    }));

                const response = await axios.post(`${PYTHON_AI_SERVICE_URL}/api/chat`, {
                    question,
                    document_id: document_id || null,
                    chat_history: chatHistory
                });
                answer = response.data.answer;
                sources = response.data.sources || [];
            } catch (err) {
                console.error("Error calling Python AI service:", err.message);
                answer = `Error generating response: ${err.response?.data?.detail || err.message}`;
            }
        } else {
            console.warn("Python AI service is not running or unreachable at:", PYTHON_AI_SERVICE_URL);
        }

        // Add assistant message
        const assistantMsg = {
            id: randomUUID(),
            sender: "assistant",
            content: answer,
            sources,
            createdAt: new Date().toISOString()
        };
        convo.messages.push(assistantMsg);

        // Update conversation in database
        await updateConversation(currentConvoId, { messages: convo.messages });

        res.json({
            answer,
            sources,
            conversationId: currentConvoId,
            conversation: convo
        });

    } catch (error) {
        console.error("Error in chat route:", error);
        res.status(500).json({ error: "Internal server error occurred while processing chat." });
    }
});

// ============================================
// HISTORY ROUTES
// ============================================

app.get("/api/history", async (req, res) => {
    try {
        const history = await getConversations();
        res.json(history);
    } catch (err) {
        res.status(500).json({ error: "Failed to load chat history." });
    }
});

app.get("/api/history/:id", async (req, res) => {
    try {
        const convo = await getConversation(req.params.id);
        if (!convo) {
            return res.status(404).json({ error: "Conversation not found." });
        }
        res.json(convo);
    } catch (err) {
        res.status(500).json({ error: "Failed to load conversation details." });
    }
});

app.put("/api/history/:id", async (req, res) => {
    const { title } = req.body;
    if (!title) {
        return res.status(400).json({ error: "Title is required." });
    }
    try {
        const updated = await updateConversation(req.params.id, { title });
        if (!updated) {
            return res.status(404).json({ error: "Conversation not found." });
        }
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: "Failed to rename conversation." });
    }
});

app.delete("/api/history/:id", async (req, res) => {
    try {
        await deleteConversation(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete conversation." });
    }
});

// ============================================
// DOCUMENT MANAGEMENT ROUTES
// ============================================

app.post("/api/documents", upload.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded or invalid file format." });
    }

    if (!isCloudinaryConfigured) {
        // Clean up temp file
        await fs.unlink(req.file.path).catch(() => {});
        return res.status(500).json({ error: "Cloudinary is not configured. Document upload is unavailable." });
    }

    const documentId = randomUUID();
    const filename = req.file.originalname;
    const publicId = `enterprise-documents/${filename}`;

    const newDoc = {
        id: documentId,
        filename,
        size: req.file.size,
        type: "pdf",
        status: "Uploading",
        cloudinary_url: "",
        public_id: publicId,
        createdAt: new Date().toISOString()
    };

    // Add to local database
    await addDocument(newDoc);

    // Perform Cloudinary Upload
    try {
        let asset;
        try {
            // Check if already exists in Cloudinary
            asset = await cloudinary.api.resource(publicId, {
                resource_type: "raw",
                type: "authenticated"
            });
            console.log(`Cloudinary asset already exists: ${publicId}`);
        } catch (err) {
            if (err.http_code === 404) {
                // Upload fresh file
                asset = await cloudinary.uploader.upload(req.file.path, {
                    resource_type: "raw",
                    type: "authenticated",
                    public_id: publicId,
                    asset_folder: "enterprise-documents",
                    overwrite: false
                });
                console.log(`Uploaded fresh asset to Cloudinary: ${publicId}`);
            } else {
                throw err;
            }
        }

        // Generate private signed link valid for 10 minutes
        const expiresAt = Math.floor(Date.now() / 1000) + (10 * 60);
        const downloadUrl = cloudinary.utils.private_download_url(asset.public_id, "pdf", {
            resource_type: "raw",
            type: "authenticated",
            expires_at: expiresAt
        });

        // Update local status to processing
        newDoc.cloudinary_url = downloadUrl;
        newDoc.status = "Processing";
        await deleteDocument(documentId);
        await addDocument(newDoc);

        // Tell Python RAG service to ingest the file asynchronously
        const isPythonActive = await checkPythonHealth();
        if (isPythonActive) {
            // Fire-and-forget / Run ingestion in background so upload endpoint responds quickly
            axios.post(`${PYTHON_AI_SERVICE_URL}/ingest`, {
                file_url: downloadUrl,
                document_id: documentId,
                filename: filename
            }).then(async (response) => {
                console.log(`Successfully ingested ${filename} in Pinecone.`);
                newDoc.status = "Indexed";
                await deleteDocument(documentId);
                await addDocument(newDoc);
            }).catch(async (err) => {
                console.error(`Python ingestion failed for ${filename}:`, err.message);
                newDoc.status = "Failed";
                await deleteDocument(documentId);
                await addDocument(newDoc);
            });
        } else {
            console.warn("Python AI service is not running. Ingestion skipped.");
            newDoc.status = "Failed";
            await deleteDocument(documentId);
            await addDocument(newDoc);
        }

        res.status(202).json(newDoc);

    } catch (error) {
        console.error("Cloudinary upload failed:", error);
        newDoc.status = "Failed";
        await deleteDocument(documentId);
        await addDocument(newDoc);
        res.status(500).json({ error: "Failed to process and index document." });
    } finally {
        // Clean up temporary local file
        await fs.unlink(req.file.path).catch(() => {});
    }
});

app.get("/api/documents", async (req, res) => {
    try {
        const docs = await getDocuments();
        res.json(docs);
    } catch (err) {
        res.status(500).json({ error: "Failed to retrieve documents." });
    }
});

app.get("/api/documents/:id", async (req, res) => {
    try {
        const docs = await getDocuments();
        const doc = docs.find(d => d.id === req.params.id);
        if (!doc) {
            return res.status(404).json({ error: "Document not found." });
        }
        res.json(doc);
    } catch (err) {
        res.status(500).json({ error: "Failed to get document metadata." });
    }
});

app.delete("/api/documents/:id", async (req, res) => {
    try {
        const docs = await getDocuments();
        const doc = docs.find(d => d.id === req.params.id);
        if (!doc) {
            return res.status(404).json({ error: "Document not found." });
        }

        // Delete from local DB
        await deleteDocument(req.params.id);

        // Delete vectors from Python Pinecone service
        const isPythonActive = await checkPythonHealth();
        if (isPythonActive) {
            axios.delete(`${PYTHON_AI_SERVICE_URL}/documents/${req.params.id}`)
                .then(() => console.log(`Deleted vectors for document ID: ${req.params.id}`))
                .catch(err => console.error("Failed to delete vectors from python:", err.message));
        }

        // Try to delete raw asset from Cloudinary
        if (isCloudinaryConfigured && doc.public_id) {
            cloudinary.uploader.destroy(doc.public_id, { resource_type: "raw" })
                .then(() => console.log(`Deleted Cloudinary raw asset: ${doc.public_id}`))
                .catch(err => console.error("Cloudinary asset deletion error:", err));
        }

        res.json({ success: true });
    } catch (err) {
        console.error("Error deleting document:", err);
        res.status(500).json({ error: "Failed to delete document." });
    }
});

// ============================================
// SOURCES & SETTINGS ROUTES
// ============================================

app.get("/api/sources", async (req, res) => {
    try {
        const docs = await getDocuments();
        const indexedDocs = docs.filter(d => d.status === "Indexed");
        
        // Generate simulated relevance score and pages details for dashboard overview
        const sources = indexedDocs.map(doc => ({
            id: doc.id,
            filename: doc.filename,
            type: doc.type,
            size: doc.size,
            relevanceScore: 0.85 + (Math.random() * 0.14),
            pageCount: 1 + Math.floor(Math.random() * 15),
            createdAt: doc.createdAt
        }));

        res.json(sources);
    } catch (err) {
        res.status(500).json({ error: "Failed to load sources." });
    }
});

app.get("/api/settings", async (req, res) => {
    try {
        const settings = await getSettings();
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: "Failed to load settings." });
    }
});

app.put("/api/settings", async (req, res) => {
    try {
        const updated = await updateSettings(req.body);
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: "Failed to save settings." });
    }
});

// Start Express application
app.listen(PORT, () => {
    console.log(`-----------------------------------------------`);
    console.log(`Express Gateway API running on port ${PORT}`);
    console.log(`Python AI service target: ${PYTHON_AI_SERVICE_URL}`);
    console.log(`-----------------------------------------------`);
});
