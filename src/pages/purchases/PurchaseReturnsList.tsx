import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../components/ui/RequestState'
import { purchaseReturns } from '../../lib/purchases-returns'
import { formatDateIN } from '../../lib/purchases-format'

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  posted: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function PurchaseReturnsList() {
  const [returns, setReturns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown | null>(null)

  useEffect(() => {
    const fetchReturns = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await purchaseReturns.list()
        setReturns(res.data.data?.returns || [])
      } catch (e) {
        console.error('Failed to fetch purchase returns', e)
        setError(e)
      } finally {
        setLoading(false)
      }
    }
    fetchReturns()
  }, [])

  if (error) {
    if (isModuleDisabledError(error)) return <ModuleDisabledState moduleName="Purchases" />
    if (isForbidden(error)) return <ForbiddenState />
    return <ErrorState message={getApiErrorMessage(error)} />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Purchase Returns</h1>
          <p className="text-[var(--text-secondary)]">Create and track returns to vendors</p>
        </div>
        <Link
          to="/purchases/returns/new"
          className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} />
          New Return
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-[var(--border-strong)] overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-[var(--border-strong)]">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Return #</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Vendor</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Date</th>
              <th className="text-center px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-strong)]">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-[var(--secondary)]">
                  Loading…
                </td>
              </tr>
            ) : returns.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-[var(--secondary)]">
                  No returns yet.{' '}
                  <Link to="/purchases/returns/new" className="text-[var(--primary)] hover:underline">
                    Create one
                  </Link>
                </td>
              </tr>
            ) : (
              returns.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm">{r.return_no || r.code || r.id}</td>
                  <td className="px-4 py-3">{r.vendor?.name || r.vendor_name || '—'}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{formatDateIN(r.return_date || r.date)}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs capitalize ${statusColors[r.status] || 'bg-gray-100 text-gray-700'}`}
                    >
                      {r.status || '—'}
                    </span>
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
