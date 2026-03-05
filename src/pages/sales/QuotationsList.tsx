import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Eye, Plus, Search } from 'lucide-react'
import { salesDocs } from '../../lib/sales-docs'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../components/ui/RequestState'

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  expired: 'bg-orange-100 text-orange-700',
  cancelled: 'bg-red-100 text-red-700',
}

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Quotations</h1>
          <p className="text-[var(--text-secondary)]">Create and manage customer quotations</p>
        </div>
        <Link
          to="/sales/quotations/new"
          className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} />
          New Quotation
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-[var(--border)] p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--secondary)]" />
            <input
              type="text"
              placeholder="Search quotations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-white pl-4 pr-10 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] hover:border-slate-300 transition"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--secondary)]"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[var(--border-strong)] overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-[var(--border-strong)]">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Quote #</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Customer</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Date</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Amount</th>
              <th className="text-center px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Status</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-strong)]">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[var(--secondary)]">
                  Loading…
                </td>
              </tr>
            ) : quotations.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[var(--secondary)]">
                  No quotations found.{' '}
                  <Link to="/sales/quotations/new" className="text-[var(--primary)] hover:underline">
                    Create one
                  </Link>
                </td>
              </tr>
            ) : (
              quotations.map((q) => (
                <tr key={q.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm">{q.quote_no || q.quotation_no || q.number || q.id}</td>
                  <td className="px-4 py-3">{q.customer?.name || q.customer_name || 'N/A'}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{q.quote_date ? formatDate(q.quote_date) : '—'}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(q.total_minor ?? q.total_amount_minor ?? 0)}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs capitalize ${statusColors[q.status] || 'bg-gray-100 text-gray-700'}`}
                    >
                      {q.status || 'unknown'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/sales/quotations/${q.id}`} className="p-2 hover:bg-gray-100 rounded" title="View">
                        <Eye size={16} className="text-[var(--secondary)]" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
