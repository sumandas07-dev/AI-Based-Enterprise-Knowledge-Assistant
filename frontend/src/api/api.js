import axios from 'axios';
import { mockHistory, mockDocuments, mockSources, mockSettings } from '../data/mockData';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cache for simulated in-memory state of mock data during design/development
let localHistory = [...mockHistory];
let localDocuments = [...mockDocuments];
let localSettings = { ...mockSettings };

// Helper to determine if we should fall back to mock data
async function checkBackendAvailable() {
  try {
    // Ping backend server health endpoint
    await axios.get(`${baseURL.replace('/api', '')}/health`, { timeout: 600 });
    return true;
  } catch {
    return false;
  }
}

export const authApi = {
  getCurrentUser: async () => {
    return { name: "Enterprise Admin", email: "admin@enterprise.com" };
  },
  isAuthenticated: () => true, // Bypass authentication for development
  logout: () => {
    console.log("Logged out placeholder called.");
  }
};

export const chatApi = {
  sendMessage: async (question, conversationId, documentId = null) => {
    const response = await apiClient.post('/chat', { 
      question, 
      conversationId, 
      document_id: documentId 
    });
    return response.data;
  }
};

export const historyApi = {
  getHistory: async () => {
    const isOnline = await checkBackendAvailable();
    if (isOnline) {
      const res = await apiClient.get('/history');
      return res.data;
    }
    return localHistory;
  },
  getConversation: async (id) => {
    const isOnline = await checkBackendAvailable();
    if (isOnline) {
      const res = await apiClient.get(`/history/${id}`);
      return res.data;
    }
    const convo = localHistory.find(c => c.id === id);
    if (!convo) throw new Error("Conversation not found");
    return convo;
  },
  renameConversation: async (id, title) => {
    const isOnline = await checkBackendAvailable();
    if (isOnline) {
      const res = await apiClient.put(`/history/${id}`, { title });
      return res.data;
    }
    const convo = localHistory.find(c => c.id === id);
    if (convo) {
      convo.title = title;
      convo.updatedAt = new Date().toISOString();
    }
    return convo;
  },
  deleteConversation: async (id) => {
    const isOnline = await checkBackendAvailable();
    if (isOnline) {
      await apiClient.delete(`/history/${id}`);
      return;
    }
    localHistory = localHistory.filter(c => c.id !== id);
  }
};

export const documentApi = {
  uploadDocument: async (file, onUploadProgress) => {
    const isOnline = await checkBackendAvailable();
    if (isOnline) {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiClient.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress
      });
      return res.data;
    }

    // Mock upload
    console.log("Backend offline. Simulating mock document upload.");
    const id = `doc-${Math.random().toString(36).substring(2, 9)}`;
    const newDoc = {
      id,
      filename: file.name,
      type: 'pdf',
      size: file.size,
      createdAt: new Date().toISOString(),
      status: 'Indexed'
    };
    localDocuments.unshift(newDoc);
    return newDoc;
  },
  getDocuments: async () => {
    const isOnline = await checkBackendAvailable();
    if (isOnline) {
      const res = await apiClient.get('/documents');
      return res.data;
    }
    return localDocuments;
  },
  getDocument: async (id) => {
    const isOnline = await checkBackendAvailable();
    if (isOnline) {
      const res = await apiClient.get(`/documents/${id}`);
      return res.data;
    }
    const doc = localDocuments.find(d => d.id === id);
    if (!doc) throw new Error("Document not found");
    return doc;
  },
  deleteDocument: async (id) => {
    const isOnline = await checkBackendAvailable();
    if (isOnline) {
      await apiClient.delete(`/documents/${id}`);
      return;
    }
    localDocuments = localDocuments.filter(d => d.id !== id);
  },
  getSources: async () => {
    const isOnline = await checkBackendAvailable();
    if (isOnline) {
      const res = await apiClient.get('/sources');
      return res.data;
    }
    // Convert documents to sources
    return localDocuments.filter(d => d.status === 'Indexed').map((doc, idx) => ({
      id: doc.id,
      filename: doc.filename,
      type: doc.type,
      size: doc.size,
      relevanceScore: 0.82 + (idx * 0.05) > 1.0 ? 0.98 : 0.82 + (idx * 0.05),
      pageCount: 3 + idx,
      createdAt: doc.createdAt
    }));
  }
};

export const settingsApi = {
  getSettings: async () => {
    const isOnline = await checkBackendAvailable();
    if (isOnline) {
      const res = await apiClient.get('/settings');
      return res.data;
    }
    return localSettings;
  },
  updateSettings: async (settings) => {
    const isOnline = await checkBackendAvailable();
    if (isOnline) {
      const res = await apiClient.put('/settings', settings);
      return res.data;
    }
    localSettings = { ...localSettings, ...settings };
    return localSettings;
  }
};
