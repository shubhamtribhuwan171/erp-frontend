import api from './api'

// Receipts / GRN
// NOTE: Endpoints here are placeholders until wired in src/lib/api.ts.
// Main app can either keep these helpers or expose them via `purchases.receipts`.

export const purchaseReceipts = {
  list: (params?: any) => api.get('/purchases/receipts', { params }),
  get: (id: string) => api.get(`/purchases/receipts/${id}`),
  create: (data: any) => api.post('/purchases/receipts', data),
}
