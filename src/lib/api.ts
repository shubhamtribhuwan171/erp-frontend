import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const auth = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  register: (data: { email: string; password: string; companyName: string; fullName: string }) =>
    api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

// Settings
export const settings = {
  getCompany: () => api.get('/settings/company'),
  updateCompany: (data: any) => api.put('/settings/company', data),
  listUsers: () => api.get('/settings/users'),
  createUser: (data: any) => api.post('/settings/users', data),
};

// Inventory
export const inventory = {
  items: {
    list: (params?: any) => api.get('/inventory/items', { params }),
    get: (id: string) => api.get(`/inventory/items/${id}`),
    create: (data: any) => api.post('/inventory/items', data),
    update: (id: string, data: any) => api.put(`/inventory/items/${id}`, data),
    delete: (id: string) => api.delete(`/inventory/items/${id}`),
  },
  categories: {
    list: () => api.get('/inventory/categories'),
    create: (data: any) => api.post('/inventory/categories', data),
  },
  units: {
    list: () => api.get('/inventory/units'),
    create: (data: any) => api.post('/inventory/units', data),
  },
  warehouses: {
    list: () => api.get('/inventory/warehouses'),
    create: (data: any) => api.post('/inventory/warehouses', data),
  },
};

// Sales
export const sales = {
  orders: {
    list: (params?: any) => api.get('/sales/orders', { params }),
    get: (id: string) => api.get(`/sales/orders/${id}`),
    create: (data: any) => api.post('/sales/orders', data),
    update: (id: string, data: any) => api.put(`/sales/orders/${id}`, data),
    updateStatus: (id: string, status: string) => 
      api.patch(`/sales/orders/${id}`, { status }),
  },
  customers: {
    list: (params?: any) => api.get('/customers', { params }),
    get: (id: string) => api.get(`/customers/${id}`),
    create: (data: any) => api.post('/customers', data),
    update: (id: string, data: any) => api.put(`/customers/${id}`, data),
    delete: (id: string) => api.delete(`/customers/${id}`),
  },
};

// Purchases
export const purchases = {
  orders: {
    list: (params?: any) => api.get('/purchases/orders', { params }),
    get: (id: string) => api.get(`/purchases/orders/${id}`),
    create: (data: any) => api.post('/purchases/orders', data),
  },
  vendors: {
    list: (params?: any) => api.get('/vendors', { params }),
    get: (id: string) => api.get(`/vendors/${id}`),
    create: (data: any) => api.post('/vendors', data),
  },
};

// Accounting
export const accounting = {
  accounts: {
    list: () => api.get('/accounting/accounts'),
    create: (data: any) => api.post('/accounting/accounts', data),
  },
  journal: {
    list: () => api.get('/accounting/journal'),
    create: (data: any) => api.post('/accounting/journal', data),
  },
  reports: {
    trialBalance: (params?: any) => api.get('/accounting/reports/trial-balance', { params }),
    pnl: (params?: any) => api.get('/accounting/reports/pnl', { params }),
    balanceSheet: (params?: any) => api.get('/accounting/reports/balance-sheet', { params }),
  },
};

// HR
export const hr = {
  employees: {
    list: () => api.get('/hr/employees'),
    create: (data: any) => api.post('/hr/employees', data),
  },
  departments: {
    list: () => api.get('/hr/departments'),
    create: (data: any) => api.post('/hr/departments', data),
  },
};

// CRM
export const crm = {
  leads: {
    list: () => api.get('/crm/leads'),
    create: (data: any) => api.post('/crm/leads', data),
  },
  contacts: {
    list: () => api.get('/crm/contacts'),
    create: (data: any) => api.post('/crm/contacts', data),
  },
};

export default api;
