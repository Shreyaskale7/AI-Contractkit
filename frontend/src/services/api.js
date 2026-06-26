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
export const generateFromNotes= (data) => API.post('/contracts/generate-from-notes', data);
export const getContracts     = ()     => API.get('/contracts');
export const getContractById  = (id)   => API.get(`/contracts/${id}`);
export const deleteContract   = (id)   => API.delete(`/contracts/${id}`);
export const refineContract   = (id, data) => API.post(`/contracts/${id}/refine`, data);
export const revertContract   = (id)       => API.post(`/contracts/${id}/revert`);
export const markContractSent = (id, data) => API.post(`/contracts/${id}/send`, data || {});

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Download a contract PDF (owner) — fetched as a blob so the JWT travels
// in the Authorization header, then triggered as a browser download.
export const downloadContractPdf = async (id, filename = 'contract.pdf') => {
  const res = await API.get(`/contracts/${id}/pdf`, { responseType: 'blob' });
  triggerBlobDownload(res.data, filename);
};

const triggerBlobDownload = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

// Stream contract generation over SSE. Calls handlers as events arrive.
// Returns an abort function.
export const generateContractStream = ({ body, onStage, onDelta, onDone, onError }) => {
  const controller = new AbortController();
  (async () => {
    try {
      const res = await fetch(`${API_BASE}/contracts/generate-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Generation failed');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';
        for (const part of parts) {
          const line = part.replace(/^data: /, '').trim();
          if (!line) continue;
          const event = JSON.parse(line);
          if (event.stage) onStage?.(event.stage);
          if (event.delta) onDelta?.(event.delta);
          if (event.done) onDone?.(event.contract);
          if (event.error) onError?.(new Error(event.error));
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') onError?.(err);
    }
  })();
  return () => controller.abort();
};
export const analyzeScope     = (id, data) => API.post(`/contracts/${id}/analyze-scope`, data);
export const logScopeDefense  = (id, data) => API.post(`/contracts/${id}/scope-defense`, data);
export const getScopeDefenses = ()          => API.get('/contracts/scope-defenses');

// INVOICES
export const createInvoice       = (data)        => API.post('/invoices', data);
export const getInvoices         = ()            => API.get('/invoices');
export const updateInvoiceStatus = (id, status)  => API.put(`/invoices/${id}/status`, { status });
export const deleteInvoice       = (id)          => API.delete(`/invoices/${id}`);
export const getAnalytics = () => API.get('/analytics');
// Add these 2 lines at the bottom
export const getPublicContract = (token) => API.get(`/contracts/public/${token}`);
export const getELI5Contract   = (token) => API.get(`/contracts/public/${token}/eli5`);
export const signContract      = (token, data) => API.post(`/contracts/sign/${token}`, data);
export const addClientComment  = (token, data) => API.post(`/contracts/public/${token}/comments`, data);
export const resolveCommentWithAI = (contractId, commentId) => API.post(`/contracts/${contractId}/comments/${commentId}/resolve`);

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