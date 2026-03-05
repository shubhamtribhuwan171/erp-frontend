import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { purchaseVendorInvoices } from '../../lib/purchases-vendor-invoices'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../components/ui/RequestState'
import { formatCurrencyINR, formatDateIN } from '../../lib/purchases-format'

export default function VendorInvoiceDetails() {
  const { id } = useParams<{ id: string }>()
  const [invoice, setInvoice] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown | null>(null)

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!id) return
      setLoading(true)
      setError(null)
      try {
        const res = await purchaseVendorInvoices.get(id)
        setInvoice(res.data.data?.invoice || res.data.data)
      } catch (e) {
        console.error('Failed to fetch vendor invoice', e)
        setError(e)
      } finally {
        setLoading(false)
      }
    }
    fetchInvoice()
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

  if (!invoice) {
    return <div className="text-[var(--text-secondary)]">Invoice not found.</div>
  }

  const lines = invoice.lines || invoice.items || []

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <Link to="/purchases/vendor-invoices" className="p-2 hover:bg-gray-100 rounded" title="Back">
            <ArrowLeft size={18} className="text-[var(--secondary)]" />
          </Link>
          <h1 className="text-2xl font-semibold">Vendor Invoice</h1>
        </div>
        <p className="text-[var(--text-secondary)]">{invoice.invoice_no || invoice.bill_no || invoice.code || invoice.id}</p>
      </div>

      <div className="bg-white rounded-lg border border-[var(--border-strong)] p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-[var(--text-secondary)]">Vendor</div>
            <div className="font-medium">{invoice.vendor?.name || invoice.vendor_name || '—'}</div>
          </div>
          <div>
            <div className="text-sm text-[var(--text-secondary)]">Invoice date</div>
            <div className="font-medium">{formatDateIN(invoice.invoice_date || invoice.date)}</div>
          </div>
          <div>
            <div className="text-sm text-[var(--text-secondary)]">Amount</div>
            <div className="font-medium">{formatCurrencyINR(invoice.total_minor || invoice.amount_minor)}</div>
          </div>
          <div>
            <div className="text-sm text-[var(--text-secondary)]">Status</div>
            <div className="font-medium capitalize">{invoice.status || '—'}</div>
          </div>
        </div>

        {invoice.notes && (
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <div className="text-sm text-[var(--text-secondary)]">Notes</div>
            <div className="font-medium whitespace-pre-wrap">{invoice.notes}</div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-[var(--border-strong)] overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border-strong)] bg-gray-50">
          <div className="text-sm font-medium">Line items</div>
        </div>
        <table className="w-full">
          <thead className="bg-white border-b border-[var(--border)]">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Item</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Qty</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Rate</th>
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
                  <td className="px-4 py-3 text-right text-[var(--text-secondary)]">
                    {formatCurrencyINR(ln.rate_minor || ln.price_minor)}
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
