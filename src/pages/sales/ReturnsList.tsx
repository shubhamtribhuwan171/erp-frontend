import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, RotateCcw } from 'lucide-react'
import { salesDocs } from '../../lib/sales-docs'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../components/ui/RequestState'
import { DataTable, PageHeader, SearchInput, StatusBadge } from '../../components/ui'

export default function ReturnsList() {
  const [returns, setReturns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchReturns = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await salesDocs.returns.list()
        setReturns(res.data.data?.returns || [])
      } catch (e) { setError(e) }
      finally { setLoading(false) }
    }
    fetchReturns()
  }, [])

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format((amount || 0) / 100)
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  if (error) {
    if (isModuleDisabledError(error)) return <ModuleDisabledState moduleName="Sales" />
    if (isForbidden(error)) return <ForbiddenState />
    return <ErrorState message={getApiErrorMessage(error)} />
  }

  const columns = [
    { key: 'return_no', header: 'Return #', render: (r: any) => <Link to={`/sales/returns/${r.id}`} className="font-mono text-sm text-gray-700 hover:text-gray-900">{r.return_no}</Link> },
    { key: 'customer', header: 'Customer', render: (r: any) => r.customer?.name || 'N/A' },
    { key: 'return_date', header: 'Date', render: (r: any) => formatDate(r.return_date) },
    { key: 'amount', header: 'Amount', align: 'right' as const, render: (r: any) => formatCurrency(r.total_minor) },
    { key: 'status', header: 'Status', align: 'center' as const, render: (r: any) => <StatusBadge status={r.status} map={{
      draft: { bg: 'bg-gray-100 text-gray-700', label: 'Draft' },
      requested: { bg: 'bg-blue-100 text-blue-700', label: 'Requested' },
      approved: { bg: 'bg-green-100 text-green-700', label: 'Approved' },
      rejected: { bg: 'bg-red-100 text-red-700', label: 'Rejected' },
    }} /> },
  ]

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <PageHeader icon={RotateCcw} title="Returns" subtitle="Sales returns" />
        <div className="bg-white rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <SearchInput value={search} onChange={setSearch} placeholder="Search returns..." />
        </div>
        <DataTable columns={columns} data={returns} loading={loading} emptyTitle="No returns found" />
      </div>
    </div>
  )
}
