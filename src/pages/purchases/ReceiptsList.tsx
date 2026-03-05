import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Plus } from 'lucide-react'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../components/ui/RequestState'
import { purchaseReceipts } from '../../lib/purchases-receipts'
import { formatDateIN } from '../../lib/purchases-format'

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  posted: 'bg-green-100 text-green-700',
  received: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function ReceiptsList() {
  const [receipts, setReceipts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown | null>(null)

  useEffect(() => {
    const fetchReceipts = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await purchaseReceipts.list()
        setReceipts(res.data.data?.receipts || res.data.data?.grns || [])
      } catch (e) {
        console.error('Failed to fetch receipts', e)
        setError(e)
      } finally {
        setLoading(false)
      }
    }
    fetchReceipts()
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
          <h1 className="text-2xl font-semibold">Receipts / GRN</h1>
          <p className="text-[var(--text-secondary)]">Goods received notes and purchase receipts</p>
        </div>
        <Link
          to="/purchases/receipts/new"
          className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} />
          New GRN
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-[var(--border-strong)] overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-[var(--border-strong)]">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">GRN #</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Vendor</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Date</th>
              <th className="text-center px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Status</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-strong)]">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[var(--secondary)]">
                  Loading…
                </td>
              </tr>
            ) : receipts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[var(--secondary)]">
                  No receipts yet.{' '}
                  <Link to="/purchases/receipts/new" className="text-[var(--primary)] hover:underline">
                    Create one
                  </Link>
                </td>
              </tr>
            ) : (
              receipts.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm">{r.grn_no || r.receipt_no || r.code || r.id}</td>
                  <td className="px-4 py-3">{r.vendor?.name || r.vendor_name || '—'}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{formatDateIN(r.receipt_date || r.grn_date || r.date)}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs capitalize ${statusColors[r.status] || 'bg-gray-100 text-gray-700'}`}
                    >
                      {r.status || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/purchases/receipts/${r.id}`} className="p-2 hover:bg-gray-100 rounded" title="View">
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
