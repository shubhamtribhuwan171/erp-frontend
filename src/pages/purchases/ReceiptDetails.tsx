import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { purchaseReceipts } from '../../lib/purchases-receipts'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../components/ui/RequestState'
import { formatDateIN } from '../../lib/purchases-format'

export default function ReceiptDetails() {
  const { id } = useParams<{ id: string }>()
  const [receipt, setReceipt] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown | null>(null)

  useEffect(() => {
    const fetchReceipt = async () => {
      if (!id) return
      setLoading(true)
      setError(null)
      try {
        const res = await purchaseReceipts.get(id)
        setReceipt(res.data.data?.receipt || res.data.data?.grn || res.data.data)
      } catch (e) {
        console.error('Failed to fetch receipt', e)
        setError(e)
      } finally {
        setLoading(false)
      }
    }
    fetchReceipt()
  }, [id])

  if (error) {
    if (isModuleDisabledError(error)) return <ModuleDisabledState moduleName="Purchases" />
    if (isForbidden(error)) return <ForbiddenState />
    return <ErrorState message={getApiErrorMessage(error)} />
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-[var(--border-strong)] p-6 text-[var(--secondary)]">Loading…</div>
    )
  }

  if (!receipt) {
    return <div className="text-[var(--text-secondary)]">Receipt not found.</div>
  }

  const lines = receipt.lines || receipt.items || []

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <Link to="/purchases/receipts" className="p-2 hover:bg-gray-100 rounded" title="Back">
            <ArrowLeft size={18} className="text-[var(--secondary)]" />
          </Link>
          <h1 className="text-2xl font-semibold">Receipt / GRN Details</h1>
        </div>
        <p className="text-[var(--text-secondary)]">{receipt.grn_no || receipt.receipt_no || receipt.code || receipt.id}</p>
      </div>

      <div className="bg-white rounded-lg border border-[var(--border-strong)] p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-[var(--text-secondary)]">Vendor</div>
            <div className="font-medium">{receipt.vendor?.name || receipt.vendor_name || '—'}</div>
          </div>
          <div>
            <div className="text-sm text-[var(--text-secondary)]">Date</div>
            <div className="font-medium">{formatDateIN(receipt.receipt_date || receipt.grn_date || receipt.date)}</div>
          </div>
          <div>
            <div className="text-sm text-[var(--text-secondary)]">Status</div>
            <div className="font-medium capitalize">{receipt.status || '—'}</div>
          </div>
        </div>

        {(receipt.reference_no || receipt.notes) && (
          <div className="mt-4 pt-4 border-t border-[var(--border)] space-y-2">
            {receipt.reference_no && (
              <div>
                <div className="text-sm text-[var(--text-secondary)]">Reference #</div>
                <div className="font-medium">{receipt.reference_no}</div>
              </div>
            )}
            {receipt.notes && (
              <div>
                <div className="text-sm text-[var(--text-secondary)]">Notes</div>
                <div className="font-medium whitespace-pre-wrap">{receipt.notes}</div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-[var(--border-strong)] overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border-strong)] bg-gray-50">
          <div className="text-sm font-medium">Items</div>
        </div>
        <table className="w-full">
          <thead className="bg-white border-b border-[var(--border)]">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Item</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Qty</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">UOM</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {lines.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-[var(--secondary)]">
                  No line items
                </td>
              </tr>
            ) : (
              lines.map((ln: any, idx: number) => (
                <tr key={ln.id || idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{ln.item?.name || ln.item_name || ln.sku || '—'}</td>
                  <td className="px-4 py-3 text-right font-medium">{ln.qty || ln.quantity || '—'}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{ln.uom || ln.unit || ln.uom_name || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
