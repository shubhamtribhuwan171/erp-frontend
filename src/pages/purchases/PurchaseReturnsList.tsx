import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { RotateCcw } from 'lucide-react'
import { purchaseReturns } from '../../lib/purchases-returns'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../components/ui/RequestState'
import { DataTable, PageHeader } from '../../components/ui'

export default function PurchaseReturnsList() {
  const [returns, setReturns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown | null>(null)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try { const res = await purchaseReturns.list(); setReturns(res.data.data || []) }
      catch (e) { setError(e) }
      finally { setLoading(false) }
    }
    fetch()
  }, [])

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format((amount || 0) / 100)
  const formatDate = (date: string) => date ? new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'

  if (error) {
    if (isModuleDisabledError(error)) return <ModuleDisabledState moduleName="Purchases" />
    if (isForbidden(error)) return <ForbiddenState />
    return <ErrorState message={getApiErrorMessage(error)} />
  }

  const columns = [
    { key: 'return_no', header: 'Return #', render: (r: any) => <Link to={`/purchases/returns/${r.id}`} className="font-mono text-sm text-gray-700 hover:text-gray-900">{r.return_no}</Link> },
    { key: 'vendor', header: 'Vendor', render: (r: any) => r.vendor?.name || '-' },
    { key: 'return_date', header: 'Date', render: (r: any) => formatDate(r.return_date) },
    { key: 'amount', header: 'Amount', align: 'right' as const, render: (r: any) => formatCurrency(r.total_minor) },
    { key: 'status', header: 'Status', render: (r: any) => <span className={`px-2 py-1 rounded-md text-xs ${r.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{r.status}</span> },
  ]

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <PageHeader icon={RotateCcw} title="Purchase Returns" subtitle="Vendor returns" />
        <DataTable columns={columns} data={returns} loading={loading} emptyTitle="No returns found" />
      </div>
    </div>
  )
}
