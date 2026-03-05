import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRightLeft } from 'lucide-react'
import { inventoryMovementsApi } from '../../lib/inventory-movements'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../components/ui/RequestState'
import { DataTable, PageHeader } from '../../components/ui'

export default function TransfersList() {
  const [transfers, setTransfers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown | null>(null)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try { const res = await inventoryMovementsApi.list(); setTransfers(res.data.data || []) }
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
    { key: 'transfer_no', header: 'Transfer #', render: (t: any) => <Link to={`/inventory/transfers/${t.id}`} className="font-mono text-sm text-gray-700 hover:text-gray-900">{t.transfer_no}</Link> },
    { key: 'from_warehouse', header: 'From', render: (t: any) => t.from_warehouse?.name || '-' },
    { key: 'to_warehouse', header: 'To', render: (t: any) => t.to_warehouse?.name || '-' },
    { key: 'transfer_date', header: 'Date', render: (t: any) => formatDate(t.transfer_date) },
    { key: 'status', header: 'Status', render: (t: any) => <span className={`px-2 py-1 rounded-md text-xs ${t.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{t.status}</span> },
  ]

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <PageHeader icon={ArrowRightLeft} title="Stock Transfers" subtitle="Inter-warehouse transfers" />
        <DataTable columns={columns} data={transfers} loading={loading} emptyTitle="No transfers found" />
      </div>
    </div>
  )
}
