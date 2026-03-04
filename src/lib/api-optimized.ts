import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

// Simple client-side cache
const cache = new Map<string, { data: AxiosResponse; expires: number }>()

const CACHE_DURATION = 60000 // 1 minute

// Check cache
function getCached<T>(url: string, config?: AxiosRequestConfig): AxiosResponse<T> | null {
  const key = JSON.stringify({ url, config })
  const entry = cache.get(key)
  
  if (entry && entry.expires > Date.now()) {
    return entry.data as AxiosResponse<T>
  }
  cache.delete(key)
  return null
}

// Set cache
function setCache<T>(url: string, config: AxiosRequestConfig | undefined, response: AxiosResponse<T>) {
  const key = JSON.stringify({ url, config })
  cache.set(key, { data: response, expires: Date.now() + CACHE_DURATION })
}

// Clear cache
export function clearCache(pattern?: string) {
  if (!pattern) {
    cache.clear()
    return
  }
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key)
    }
  }
}

// Optimized axios instance
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Add auth interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Add cache + optimization interceptor
api.interceptors.response.use(
  (response) => {
    // Cache GET responses
    if (response.config.method === 'get') {
      setCache(response.config.url || '', response.config, response)
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Optimized GET with cache
export async function getCached<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  // Check cache first
  const cached = getCached<T>(url, config)
  if (cached) {
    return cached.data
  }
  
  // Fetch fresh
  const response = await api.get<T>(url, config)
  return response.data
}

export { api }
export default api
