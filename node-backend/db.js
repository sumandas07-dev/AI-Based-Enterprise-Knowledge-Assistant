import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, "data", "db.json");

// Default initial state
const defaultState = {
    documents: [],
    conversations: [],
    settings: {
        profile: { name: "Enterprise User", email: "user@enterprise.com" },
        appearance: { theme: "dark" },
        notifications: { email: true, push: false },
        aiPreferences: { model: "llama-3.3-70b-versatile", temperature: 0 },
        dataPreferences: { storeHistory: true }
    }
};

// Memory cache
let dbCache = null;

async function initDb() {
    try {
        await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
        try {
            const data = await fs.readFile(DB_PATH, "utf8");
            dbCache = JSON.parse(data);
        } catch (error) {
            // File doesn't exist, create it with default state
            dbCache = { ...defaultState };
            await saveDb();
        }
    } catch (err) {
        console.error("Failed to initialize database:", err);
        dbCache = { ...defaultState };
    }
}

async function saveDb() {
    if (!dbCache) return;
    try {
        await fs.writeFile(DB_PATH, JSON.stringify(dbCache, null, 2), "utf8");
    } catch (err) {
        console.error("Failed to save database:", err);
    }
}

export async function getDb() {
    if (!dbCache) {
        await initDb();
    }
    return dbCache;
}

// Helpers
export async function getDocuments() {
    const db = await getDb();
    return db.documents;
}

export async function addDocument(doc) {
    const db = await getDb();
    db.documents.push(doc);
    await saveDb();
    return doc;
}

export async function deleteDocument(id) {
    const db = await getDb();
    db.documents = db.documents.filter(d => d.id !== id);
    await saveDb();
}

export async function getConversations() {
    const db = await getDb();
    // Sort conversations by updatedAt descending
    return [...db.conversations].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

export async function getConversation(id) {
    const db = await getDb();
    return db.conversations.find(c => c.id === id);
}

export async function addConversation(convo) {
    const db = await getDb();
    db.conversations.push(convo);
    await saveDb();
    return convo;
}

export async function updateConversation(id, updates) {
    const db = await getDb();
    const index = db.conversations.findIndex(c => c.id === id);
    if (index !== -1) {
        db.conversations[index] = { ...db.conversations[index], ...updates, updatedAt: new Date().toISOString() };
        await saveDb();
        return db.conversations[index];
    }
    return null;
}

export async function deleteConversation(id) {
    const db = await getDb();
    db.conversations = db.conversations.filter(c => c.id !== id);
    await saveDb();
}

export async function getSettings() {
    const db = await getDb();
    return db.settings;
}

export async function updateSettings(settings) {
    const db = await getDb();
    db.settings = { ...db.settings, ...settings };
    await saveDb();
    return db.settings;
}
