import api from './api'

/**
 * Minimal Sales documents API wrapper.
 *
 * NOTE: This exists so pages can be implemented without touching src/lib/api.ts.
 * Main integration should move these methods into the exported `sales` object in api.ts.
 */
export const salesDocs = {
  quotations: {
    list: (params?: any) => api.get('/sales/quotations', { params }),
    get: (id: string) => api.get(`/sales/quotations/${id}`),
    create: (data: any) => api.post('/sales/quotations', data),
  },
  invoices: {
    list: (params?: any) => api.get('/sales/invoices', { params }),
    get: (id: string) => api.get(`/sales/invoices/${id}`),
  },
  returns: {
    list: (params?: any) => api.get('/sales/returns', { params }),
    get: (id: string) => api.get(`/sales/returns/${id}`),
    create: (data: any) => api.post('/sales/returns', data),
  },
}
