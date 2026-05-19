import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// AUTH
export const register = (data) => API.post('/auth/register', data);
export const login    = (data) => API.post('/auth/login', data);
export const getMe    = ()     => API.get('/auth/me');

// CLIENTS
export const getClients   = ()         => API.get('/clients');
export const createClient = (data)     => API.post('/clients', data);
export const updateClient = (id, data) => API.put(`/clients/${id}`, data);
export const deleteClient = (id)       => API.delete(`/clients/${id}`);

// CONTRACTS
export const generateContract = (data) => API.post('/contracts/generate', data);
export const getContracts     = ()     => API.get('/contracts');
export const getContractById  = (id)   => API.get(`/contracts/${id}`);
export const deleteContract   = (id)   => API.delete(`/contracts/${id}`);
export const refineContract   = (id, data) => API.post(`/contracts/${id}/refine`, data);

// INVOICES
export const createInvoice       = (data)        => API.post('/invoices', data);
export const getInvoices         = ()            => API.get('/invoices');
export const updateInvoiceStatus = (id, status)  => API.put(`/invoices/${id}/status`, { status });
export const deleteInvoice       = (id)          => API.delete(`/invoices/${id}`);
export const getAnalytics = () => API.get('/analytics');
// Add these 2 lines at the bottom
export const getPublicContract = (token) => API.get(`/contracts/public/${token}`);
export const signContract      = (token, data) => API.post(`/contracts/sign/${token}`, data);

// PROPOSALS
export const generateProposal      = (data)        => API.post('/proposals/generate', data);
export const getProposals          = ()            => API.get('/proposals');
export const getProposalById       = (id)          => API.get(`/proposals/${id}`);
export const updateProposalStatus  = (id, status)  => API.put(`/proposals/${id}/status`, { status });
export const deleteProposal        = (id)          => API.delete(`/proposals/${id}`);

// TEMPLATES
export const getTemplates           = (category)  => API.get(`/templates${category ? `?category=${category}` : ''}`);
export const getTemplateById        = (id)        => API.get(`/templates/${id}`);
export const createTemplate         = (data)      => API.post('/templates', data);
export const saveContractAsTemplate = (id, data)  => API.post(`/templates/from-contract/${id}`, data);
export const deleteTemplate         = (id)        => API.delete(`/templates/${id}`);

// PROFILE
export const updateProfile    = (data) => API.put('/auth/profile', data);
export const changePassword   = (data) => API.put('/auth/change-password', data);

export const generateWithRAG   = (data) => API.post('/rag/generate', data);
export const indexAllContracts = ()     => API.post('/rag/index-all');
export const uploadContracts   = (data) => API.post('/rag/upload', data);
export const getRAGStats       = ()     => API.get('/rag/stats');