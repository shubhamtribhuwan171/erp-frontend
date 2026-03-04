// Admin API Client
import axios from 'axios'

const adminApi: any = axios.create({
  baseURL: '/api/admin',
  headers: { 'Content-Type': 'application/json' },
})

// Add auth interceptor
adminApi.interceptors.request.use((config: any) => {
  const token = localStorage.getItem('adminToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor
adminApi.interceptors.response.use(
  (response: any) => response.data,
  (error: any) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken')
      window.location.href = '/admin/login'
    }
    return Promise.reject(error.response?.data || error)
  }
)

// Auth
export const adminAuth = {
  login: (email: string, password: string) =>
    adminApi.post('/login', { email, password }),
  logout: () => {
    localStorage.removeItem('adminToken')
  },
}

// Organizations
export const adminOrgs = {
  list: (params?: any) => adminApi.get('/organizations', { params }),
  create: (data: any) => adminApi.post('/organizations', data),
  update: (id: string, data: any) => adminApi.patch('/organizations', { id, ...data }),
  delete: (id: string) => adminApi.delete('/organizations', { params: { id } }),
}

// Users
export const adminUsers = {
  list: (params?: any) => adminApi.get('/users', { params }),
  create: (data: any) => adminApi.post('/users', data),
  update: (id: string, data: any) => adminApi.patch('/users', { id, ...data }),
  delete: (id: string) => adminApi.delete('/users', { params: { id } }),
}

// Audit Logs
export const adminAudit = {
  list: (params?: any) => adminApi.get('/audit-logs', { params }),
}

// Stats
export const adminStats = {
  get: () => adminApi.get('/stats'),
}

export default adminApi
