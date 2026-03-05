import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { purchases } from '../../lib/api'
import { purchaseVendorInvoices } from '../../lib/purchases-vendor-invoices'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../components/ui/RequestState'

export default function NewVendorInvoice() {
  const navigate = useNavigate()

  const [vendors, setVendors] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [pageError, setPageError] = useState<unknown | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [form, setForm] = useState({
    vendor_id: '',
    invoice_no: '',
    invoice_date: new Date().toISOString().slice(0, 10),
    amount_minor: 0,
    notes: '',
  })

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await purchases.vendors.list()
        setVendors(res.data.data?.vendors || [])
      } catch (e) {
        console.warn('Failed to load vendors', e)
      }
    }
    fetchVendors()
  }, [])

  const canSubmit = useMemo(() => Boolean(form.vendor_id) && Boolean(form.invoice_no) && !loading, [form, loading])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSubmitError(null)
    try {
      const payload = {
        vendor_id: form.vendor_id,
        invoice_no: form.invoice_no,
        invoice_date: form.invoice_date,
        amount_minor: Number(form.amount_minor) || 0,
        notes: form.notes || undefined,
      }
      const res = await purchaseVendorInvoices.create(payload)
      const id = res.data.data?.invoice?.id || res.data.data?.id
      if (id) navigate(`/purchases/vendor-invoices/${id}`)
      else navigate('/purchases/vendor-invoices')
    } catch (err) {
      console.error('Failed to create vendor invoice', err)
      setSubmitError(getApiErrorMessage(err))
      if (isModuleDisabledError(err) || isForbidden(err)) setPageError(err)
    } finally {
      setLoading(false)
    }
  }

  if (pageError) {
    if (isModuleDisabledError(pageError)) return <ModuleDisabledState moduleName="Purchases" />
    if (isForbidden(pageError)) return <ForbiddenState />
    return <ErrorState message={getApiErrorMessage(pageError)} />
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <Link to="/purchases/vendor-invoices" className="p-2 hover:bg-gray-100 rounded" title="Back">
            <ArrowLeft size={18} className="text-[var(--secondary)]" />
          </Link>
          <h1 className="text-2xl font-semibold">New Vendor Invoice</h1>
        </div>
        <p className="text-[var(--text-secondary)]">Create a vendor bill</p>
      </div>

      <form onSubmit={onSubmit} className="bg-white rounded-lg border border-[var(--border-strong)] p-6 space-y-4">
        {submitError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {submitError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Vendor</label>
            <select
              value={form.vendor_id}
              onChange={(e) => setForm((f) => ({ ...f, vendor_id: e.target.value }))}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              required
            >
              <option value="">Select vendor…</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Invoice #</label>
            <input
              type="text"
              value={form.invoice_no}
              onChange={(e) => setForm((f) => ({ ...f, invoice_no: e.target.value }))}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Invoice date</label>
            <input
              type="date"
              value={form.invoice_date}
              onChange={(e) => setForm((f) => ({ ...f, invoice_date: e.target.value }))}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Amount (₹)</label>
            <input
              type="number"
              min={0}
              value={Math.round((form.amount_minor || 0) / 100)}
              onChange={(e) => {
                const rupees = Number(e.target.value) || 0
                setForm((f) => ({ ...f, amount_minor: Math.round(rupees * 100) }))
              }}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
            <p className="text-xs text-[var(--text-secondary)] mt-1">Stored in minor units (paise).</p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Link
            to="/purchases/vendor-invoices"
            className="px-4 py-2 rounded-lg border border-[var(--border)] hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={!canSubmit}
            className="bg-[var(--primary)] disabled:opacity-50 hover:bg-[var(--primary-hover)] text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Save size={18} />
            {loading ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  )
}
