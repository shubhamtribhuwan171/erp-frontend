import api from './api'

// Purchase Returns
// NOTE: Endpoints here are placeholders until wired in src/lib/api.ts.

export const purchaseReturns = {
  list: (params?: any) => api.get('/purchases/returns', { params }),
  get: (id: string) => api.get(`/purchases/returns/${id}`),
  create: (data: any) => api.post('/purchases/returns', data),
}
