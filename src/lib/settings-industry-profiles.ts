import api from './api'

export type IndustryProfile = {
  code: string
  name: string
  default_features?: Record<string, any>
  default_settings?: Record<string, any>
  updated_at?: string
}

export const settingsIndustryProfiles = {
  list: () => api.get('/settings/industry-profiles'),
}
