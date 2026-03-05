import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { SlidersHorizontal } from 'lucide-react'
import { inventoryMovementsApi } from '../../lib/inventory-movements'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../components/ui/RequestState'
import { DataTable, PageHeader } from '../../components/ui'

export default function AdjustmentsList() {
  const [adjustments, setAdjustments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown | null>(null)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try { const res = await inventoryMovementsApi.transactions.list(); setAdjustments(res.data.data?.transactions || []) }
      catch (e) { setError(e) }
      finally { setLoading(false) }
    }
    fetch()
  }, [])

  const formatDate = (date: string) => date ? new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'

  if (error) {
    if (isModuleDisabledError(error)) return <ModuleDisabledState moduleName="Inventory" />
    if (isForbidden(error)) return <ForbiddenState />
    return <ErrorState message={getApiErrorMessage(error)} />
  }

  const columns = [
    { key: 'id', header: 'ID', render: (a: any) => <Link to={`/inventory/adjustments/${a.id}`} className="font-mono text-sm text-gray-500 hover:text-gray-700">#{a.id.slice(0, 8)}</Link> },
    { key: 'date', header: 'Date', render: (a: any) => formatDate(a.date || a.created_at) },
    { key: 'type', header: 'Type', render: (a: any) => <span className="capitalize">{a.type}</span> },
    { key: 'status', header: 'Status', render: (a: any) => <span className={`px-2 py-1 rounded-md text-xs ${a.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{a.status}</span> },
  ]

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <PageHeader icon={SlidersHorizontal} title="Stock Adjustments" subtitle="Inventory adjustments" />
        <DataTable columns={columns} data={adjustments} loading={loading} emptyTitle="No adjustments found" />
      </div>
    </div>
  )
}
