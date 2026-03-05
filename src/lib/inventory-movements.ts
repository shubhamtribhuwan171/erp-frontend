import api from './api'

export type ListTransactionsParams = {
  item_id?: string
  warehouse_id?: string
}

export type CreateTransferInput = {
  from_warehouse_id: string
  to_warehouse_id: string
  item_id: string
  qty: number
  unit_id: string
  notes?: string
}

export type CreateAdjustmentInput = {
  item_id: string
  warehouse_id: string
  qty_change: number
  unit_id: string
  reason?: string
}

export const inventoryMovementsApi = {
  transactions: {
    list: (params?: ListTransactionsParams) => api.get('/inventory/transactions', { params }),
  },
  transfers: {
    create: (data: CreateTransferInput) => api.post('/inventory/transfer', data),
  },
  adjustments: {
    create: (data: CreateAdjustmentInput) => api.post('/inventory/adjustment', data),
  },
}
