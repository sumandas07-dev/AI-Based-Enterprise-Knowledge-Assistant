import axios from 'axios';
import { mockHistory, mockDocuments, mockSources, mockSettings } from '../data/mockData';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
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
    await axios.get(`${baseURL.replace('/api', '')}/health`, { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

export const authApi = {
  getCurrentUser: async () => {
    const isOnline = await checkBackendAvailable();
    if (isOnline) {
      try {
        const res = await apiClient.get('/auth/me');
        return res.data?.user || null;
      } catch (e) {
        return null;
      }
    }
    // Mock user for offline mode
    return { id: "mock-admin-id", name: "Enterprise Admin", email: "admin@enterprise.com", role: "admin" };
  },
  signupAdmin: async (companyName, name, email, password) => {
    const response = await apiClient.post('/auth/admin/signup', {
      company_name: companyName,
      name,
      email,
      password
    });
    return response.data;
  },
  login: async (email, password, role) => {
    const response = await apiClient.post(`/auth/${role}/login`, {
      email,
      password,
      loginType: role
    });
    return response.data;
  },
  logout: async (role) => {
    await apiClient.post(`/auth/${role}/logout`);
  },
  forgotPassword: async (email, role) => {
    const response = await apiClient.post(`/auth/${role}/forgot-password`, { email, loginType: role });
    return response.data;
  },
  verifyOtp: async (email, otp, role) => {
    const response = await apiClient.post(`/auth/${role}/verify-otp`, { email, otp, loginType: role });
    return response.data;
  },
  resetPassword: async (email, otp, newPassword, role) => {
    const response = await apiClient.post(`/auth/${role}/reset-password`, {
      email,
      resetToken: otp,
      newPassword,
      loginType: role
    });
    return response.data;
  },
  resetPasswordFirstLogin: async (email, currentPassword, newPassword, role) => {
    const response = await apiClient.post(`/auth/${role}/reset-password`, {
      email,
      currentPassword,
      newPassword,
      loginType: role
    });
    return response.data;
  },
  isAuthenticated: () => {
    return true; // Managed inside AuthContext.jsx
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
      return res.data?.document || res.data;
    }

    // Mock upload
    console.log("Backend offline. Simulating mock document upload.");
    const id = `doc-${Math.random().toString(36).substring(2, 9)}`;
    const newDoc = {
      _id: id,
      filename: file.name,
      type: 'pdf',
      size: file.size,
      createdAt: new Date().toISOString(),
      status: 'completed'
    };
    return newDoc;
  },
  getDocuments: async () => {
    const isOnline = await checkBackendAvailable();
    if (isOnline) {
      const res = await apiClient.get('/documents');
      return res.data?.documents || [];
    }
    return [
      { _id: "doc-1", filename: "Mock_Enterprise_Guide.pdf", status: 'completed', createdAt: new Date().toISOString() }
    ];
  },
  getDocument: async (id) => {
    const isOnline = await checkBackendAvailable();
    if (isOnline) {
      const res = await apiClient.get(`/documents/${id}`);
      return res.data?.document;
    }
    return { _id: id, filename: "Mock_Enterprise_Guide.pdf", status: 'completed', createdAt: new Date().toISOString() };
  },
  deleteDocument: async (id) => {
    const isOnline = await checkBackendAvailable();
    if (isOnline) {
      await apiClient.delete(`/documents/${id}`);
      return;
    }
  },
  getSources: async () => {
    const isOnline = await checkBackendAvailable();
    if (isOnline) {
      const res = await apiClient.get('/documents');
      const documents = res.data?.documents || [];
      return documents.filter(d => d.status === 'completed').map((doc, idx) => ({
        id: doc._id,
        filename: doc.filename,
        type: 'pdf',
        size: 1024 * 1024,
        relevanceScore: 0.95 - (idx * 0.05) > 1.0 ? 0.98 : 0.95 - (idx * 0.05),
        createdAt: doc.createdAt
      }));
    }
    return [
      { id: "doc-1", filename: "Mock_Enterprise_Guide.pdf", type: 'pdf', size: 1024 * 1024, relevanceScore: 0.92, createdAt: new Date().toISOString() }
    ];
  }
};

export const employeeApi = {
  getEmployees: async (search = "") => {
    const isOnline = await checkBackendAvailable();
    if (isOnline) {
      const res = await apiClient.get(`/employees?search=${search}`);
      return res.data?.employees || [];
    }
    return [
      { _id: "1", empId: "EMP001", name: "Alice Smith", email: "alice@enterprise.com", department: "HR", isActive: true },
      { _id: "2", empId: "EMP002", name: "Bob Johnson", email: "bob@enterprise.com", department: "Engineering", isActive: false }
    ];
  },
  getEmployee: async (id) => {
    const isOnline = await checkBackendAvailable();
    if (isOnline) {
      const res = await apiClient.get(`/employees/${id}`);
      return res.data?.employee;
    }
    return { _id: id, empId: "EMP001", name: "Alice Smith", email: "alice@enterprise.com", department: "HR", isActive: true };
  },
  createEmployee: async (empData) => {
    const res = await apiClient.post('/employees', empData);
    return res.data;
  },
  updateEmployee: async (id, empData) => {
    const res = await apiClient.put(`/employees/${id}`, empData);
    return res.data;
  },
  toggleStatus: async (id) => {
    const res = await apiClient.put(`/employees/${id}/toggle-status`);
    return res.data;
  },
  deleteEmployee: async (id) => {
    const res = await apiClient.delete(`/employees/${id}`);
    return res.data;
  },
  importEmployees: async (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post('/employees/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress
    });
    return res.data;
  }
};

export const statisticsApi = {
  getStatistics: async () => {
    const isOnline = await checkBackendAvailable();
    if (isOnline) {
      const res = await apiClient.get('/statistics');
      return res.data?.statistics;
    }
    return {
      totalEmployees: 2,
      activeEmployees: 1,
      inactiveEmployees: 1,
      totalDocuments: 1,
      indexedDocuments: 1,
      failedDocuments: 0,
      processingDocuments: 0,
      totalChats: 5
    };
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
