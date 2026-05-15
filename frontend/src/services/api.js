import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
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

// INVOICES
export const createInvoice       = (data)        => API.post('/invoices', data);
export const getInvoices         = ()            => API.get('/invoices');
export const updateInvoiceStatus = (id, status)  => API.put(`/invoices/${id}/status`, { status });
export const deleteInvoice       = (id)          => API.delete(`/invoices/${id}`);