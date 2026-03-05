import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { salesDocs } from '../../lib/sales-docs'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../components/ui/RequestState'

export default function QuotationDetails() {
  const { id } = useParams<{ id: string }>()

  const [quotation, setQuotation] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown | null>(null)

  useEffect(() => {
    const fetchQuotation = async () => {
      if (!id) return
      setLoading(true)
      setError(null)
      try {
        const res = await salesDocs.quotations.get(id)
        setQuotation(res.data.data?.quotation || res.data.data)
      } catch (e) {
        console.error('Failed to fetch quotation', e)
        setError(e)
      } finally {
        setLoading(false)
      }
    }

    fetchQuotation()
  }, [id])

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format((amount || 0) / 100)

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  const title = useMemo(() => {
    if (!quotation) return 'Quotation'
    return quotation.quote_no || quotation.quotation_no || quotation.number || 'Quotation'
  }, [quotation])

  if (error) {
    if (isModuleDisabledError(error)) return <ModuleDisabledState moduleName="Sales" />
    if (isForbidden(error)) return <ForbiddenState />
    return <ErrorState message={getApiErrorMessage(error)} />
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-[var(--border)] p-8 text-center text-[var(--secondary)]">
        Loading…
      </div>
    )
  }

  if (!quotation) {
    return (
      <div className="bg-white rounded-lg border border-[var(--border)] p-8 text-center text-[var(--secondary)]">
        Quotation not found.
      </div>
    )
  }

  const items = quotation.items || quotation.lines || []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/sales/quotations" className="p-2 hover:bg-gray-100 rounded" title="Back">
            <ArrowLeft size={18} className="text-[var(--secondary)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">{title}</h1>
            <p className="text-[var(--text-secondary)]">Quotation details</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-lg border border-[var(--border)] p-4">
          <h2 className="font-semibold mb-3">Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-[var(--text-secondary)]">Customer</div>
              <div className="font-medium">{quotation.customer?.name || quotation.customer_name || 'N/A'}</div>
            </div>
            <div>
              <div className="text-[var(--text-secondary)]">Status</div>
              <div className="font-medium capitalize">{quotation.status || '—'}</div>
            </div>
            <div>
              <div className="text-[var(--text-secondary)]">Quotation date</div>
              <div className="font-medium">{quotation.quote_date ? formatDate(quotation.quote_date) : '—'}</div>
            </div>
            <div>
              <div className="text-[var(--text-secondary)]">Total</div>
              <div className="font-medium">{formatCurrency(quotation.total_minor ?? quotation.total_amount_minor ?? 0)}</div>
            </div>
          </div>

          {quotation.notes && (
            <div className="mt-4">
              <div className="text-sm text-[var(--text-secondary)] mb-1">Notes</div>
              <div className="text-sm whitespace-pre-wrap">{quotation.notes}</div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-[var(--border)] p-4">
          <h2 className="font-semibold mb-3">Meta</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">ID</span>
              <span className="font-mono">{quotation.id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Created</span>
              <span>{quotation.created_at ? formatDate(quotation.created_at) : '—'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[var(--border-strong)] overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border-strong)] bg-gray-50">
          <h2 className="font-semibold">Items</h2>
          <p className="text-sm text-[var(--text-secondary)]">{items.length ? `${items.length} line(s)` : 'No items'}</p>
        </div>

        {items.length === 0 ? (
          <div className="px-4 py-8 text-center text-[var(--secondary)]">No items on this quotation.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-white border-b border-[var(--border-strong)]">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Item</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Qty</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Rate</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-strong)]">
              {items.map((it: any, idx: number) => (
                <tr key={it.id || idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{it.item?.name || it.name || it.description || '—'}</td>
                  <td className="px-4 py-3 text-right">{it.quantity ?? it.qty ?? '—'}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(it.rate_minor ?? it.unit_price_minor ?? it.price_minor ?? 0)}</td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatCurrency(it.amount_minor ?? it.line_total_minor ?? 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
