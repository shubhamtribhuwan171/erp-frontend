import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { purchases } from '../../lib/api'
import { purchaseReturns } from '../../lib/purchases-returns'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../components/ui/RequestState'

export default function NewPurchaseReturn() {
  const navigate = useNavigate()

  const [vendors, setVendors] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [pageError, setPageError] = useState<unknown | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [form, setForm] = useState({
    vendor_id: '',
    return_date: new Date().toISOString().slice(0, 10),
    reason: '',
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

  const canSubmit = useMemo(() => Boolean(form.vendor_id) && !loading, [form.vendor_id, loading])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSubmitError(null)
    try {
      const payload = {
        vendor_id: form.vendor_id,
        return_date: form.return_date,
        reason: form.reason || undefined,
        notes: form.notes || undefined,
      }
      await purchaseReturns.create(payload)
      navigate('/purchases/returns')
    } catch (err) {
      console.error('Failed to create purchase return', err)
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
          <Link to="/purchases/returns" className="p-2 hover:bg-gray-100 rounded" title="Back">
            <ArrowLeft size={18} className="text-[var(--secondary)]" />
          </Link>
          <h1 className="text-2xl font-semibold">New Purchase Return</h1>
        </div>
        <p className="text-[var(--text-secondary)]">Return goods to a vendor</p>
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
            <label className="block text-sm font-medium mb-1">Return date</label>
            <input
              type="date"
              value={form.return_date}
              onChange={(e) => setForm((f) => ({ ...f, return_date: e.target.value }))}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Reason (optional)</label>
            <input
              type="text"
              value={form.reason}
              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
              placeholder="Damaged, wrong item, expired…"
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
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
          <Link to="/purchases/returns" className="px-4 py-2 rounded-lg border border-[var(--border)] hover:bg-gray-50">
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
