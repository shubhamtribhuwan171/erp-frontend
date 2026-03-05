import api from './api'

export type SettingsUser = {
  id: string
  email: string
  full_name?: string
  phone?: string
  role?: string
  is_admin?: boolean
  is_active?: boolean
  created_at?: string
  [key: string]: any
}

export const settingsUsers = {
  list: () => api.get('/settings/users'),
  get: (id: string) => api.get(`/settings/users/${id}`),
  update: (id: string, data: Partial<SettingsUser>) => api.put(`/settings/users/${id}`, data),
  delete: (id: string) => api.delete(`/settings/users/${id}`),
}
