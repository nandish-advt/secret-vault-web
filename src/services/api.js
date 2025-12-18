import axios from 'axios';

// Single API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://hackathon-backend-b5dtfzggg7a3bvfk.eastus-01.azurewebsites.net';

// Current selected environment
let currentEnvironmentId = localStorage.getItem('selectedEnvironment') || 'prod';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.data);
    }
    return Promise.reject(error);
  }
);

// Set current environment
export const setCurrentEnvironment = (envId) => {
  currentEnvironmentId = envId;
  localStorage.setItem('selectedEnvironment', envId);
};

// Get current environment
export const getCurrentEnvironment = () => currentEnvironmentId;

// API Methods
export const secretsApi = {
  // Get available environments
  getEnvironments: async () => {
    const response = await api.get('/api/Environments');
    return response.data;
  },

  // Get all secrets (with environment parameter)
  getAllSecrets: async (environmentId = null) => {
    const env = environmentId || currentEnvironmentId;
    const response = await api.get('/api/Secrets', {
      params: { env }
    });
    return response.data;
  },

  // Get specific secret
  getSecret: async (name, environmentId = null) => {
    const env = environmentId || currentEnvironmentId;
    const response = await api.get(`/api/Secrets/${encodeURIComponent(name)}`, {
      params: { env }
    });
    return response.data;
  },

  // Create or update secret
  createSecret: async (name, value, environmentId = null) => {
    const env = environmentId || currentEnvironmentId;
    const response = await api.post('/api/Secrets', 
      { name, value },
      { params: { env } }
    );
    return response.data;
  },

  // Delete secret
  deleteSecret: async (name, environmentId = null) => {
    const env = environmentId || currentEnvironmentId;
    const response = await api.delete(`/api/Secrets/${encodeURIComponent(name)}`, {
      params: { env }
    });
    return response.data;
  },

  // Compare two environments
  compareEnvironments: async (env1, env2) => {
    const response = await api.get('/api/Secrets/compare', {
      params: { env1, env2 }
    });
    return response.data;
  },

  // Copy single secret
  copySecret: async (secretName, sourceEnv, targetEnv) => {
    const response = await api.post('/api/Secrets/copy', {
      secretName,
      sourceEnv,
      targetEnv
    });
    return response.data;
  },

  // Copy multiple secrets
  copyMultipleSecrets: async (secretNames, sourceEnv, targetEnv) => {
    const response = await api.post('/api/Secrets/copy-multiple', {
      secretNames,
      sourceEnv,
      targetEnv
    });
    return response.data;
  },

  // Get audit logs
  // Get audit logs
  getAuditLogs: async (page = 1, pageSize = 20) => {
    const response = await api.get('/api/Secrets/audit', {
      params: { page, pageSize }
    });
    return response.data;
  },

  // Get audit logs for specific secret
  getSecretAuditLogs: async (name, limit = 10) => {
    const response = await api.get(`/api/Secrets/audit/secret/${encodeURIComponent(name)}`, {
      params: { limit }
    });
    return response.data;
  },

  // Get total audit count
  getAuditCount: async () => {
    const response = await api.get('/api/Secrets/audit/count');
    return response.data;
  },
};

export default api;