import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, FileText } from 'lucide-react'
import { salesDocs } from '../../lib/sales-docs'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../components/ui/RequestState'
import { DataTable, PageHeader, SearchInput, StatusBadge } from '../../components/ui'

export default function QuotationsList() {
  const [quotations, setQuotations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown | null>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchQuotations = async () => {
      setLoading(true)
      setError(null)
      try {
        const params: Record<string, string> = {}
        if (statusFilter) params.status = statusFilter
        if (search) params.search = search
        const response = await salesDocs.quotations.list(params)
        setQuotations(response.data.data?.quotations || [])
      } catch (e) {
        console.error('Failed to fetch quotations', e)
        setError(e)
      } finally {
        setLoading(false)
      }
    }
    fetchQuotations()
  }, [statusFilter, search])

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format((amount || 0) / 100)

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  if (error) {
    if (isModuleDisabledError(error)) return <ModuleDisabledState moduleName="Sales" />
    if (isForbidden(error)) return <ForbiddenState />
    return <ErrorState message={getApiErrorMessage(error)} />
  }

  const columns = [
    { key: 'quotation_no', header: 'Quotation #', render: (q: any) => (
      <Link to={`/sales/quotations/${q.id}`} className="font-mono text-sm text-gray-700 hover:text-gray-900">{q.quotation_no}</Link>
    )},
    { key: 'customer', header: 'Customer', render: (q: any) => q.customer?.name || 'N/A' },
    { key: 'quotation_date', header: 'Date', render: (q: any) => formatDate(q.quotation_date) },
    { key: 'valid_until', header: 'Valid Until', render: (q: any) => formatDate(q.valid_until) },
    { key: 'total_minor', header: 'Amount', align: 'right' as const, render: (q: any) => formatCurrency(q.total_minor) },
    { key: 'status', header: 'Status', align: 'center' as const, render: (q: any) => (
      <StatusBadge status={q.status} map={{
        draft: { bg: 'bg-gray-100 text-gray-700', label: 'Draft' },
        sent: { bg: 'bg-blue-100 text-blue-700', label: 'Sent' },
        accepted: { bg: 'bg-green-100 text-green-700', label: 'Accepted' },
        rejected: { bg: 'bg-red-100 text-red-700', label: 'Rejected' },
        expired: { bg: 'bg-orange-100 text-orange-700', label: 'Expired' },
        cancelled: { bg: 'bg-red-100 text-red-700', label: 'Cancelled' },
      }} />
    )},
  ]

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <PageHeader icon={FileText} title="Quotations" subtitle="Manage quotations" />
        <div className="bg-white rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-4">
            <div className="flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Search quotations..." /></div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="appearance-none bg-gray-50 pl-4 pr-11 py-2.5 rounded-xl border-0 focus:ring-2 cursor-pointer">
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
        <DataTable columns={columns} data={quotations} loading={loading} emptyTitle="No quotations found" actions={[{ icon: 'view' as const, path: (q: any) => `/sales/quotations/${q.id}` }]} />
      </div>
    </div>
  )
}
