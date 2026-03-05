import api from './api'

export type Employee = {
  id: string
  name?: string
  email?: string
  phone?: string
  job_title?: string
  department_id?: string | null
  status?: string
  [key: string]: any
}

export const hrEmployees = {
  get: (id: string) => api.get(`/hr/employees/${id}`),
  update: (id: string, data: Partial<Employee>) => api.put(`/hr/employees/${id}`, data),
  delete: (id: string) => api.delete(`/hr/employees/${id}`),
}
