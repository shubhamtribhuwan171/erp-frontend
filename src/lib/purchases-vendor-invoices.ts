import api from './api'

// Vendor Invoices
// NOTE: Endpoints here are placeholders until wired in src/lib/api.ts.

export const purchaseVendorInvoices = {
  list: (params?: any) => api.get('/purchases/vendor-invoices', { params }),
  get: (id: string) => api.get(`/purchases/vendor-invoices/${id}`),
  create: (data: any) => api.post('/purchases/vendor-invoices', data),
}
