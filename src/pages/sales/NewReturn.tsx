import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { sales } from '../../lib/api'
import { salesDocs } from '../../lib/sales-docs'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../components/ui/RequestState'

export default function NewReturn() {
  const navigate = useNavigate()

  const [customers, setCustomers] = useState<any[]>([])
  const [loadingCustomers, setLoadingCustomers] = useState(true)

  const [customerId, setCustomerId] = useState('')
  const [returnDate, setReturnDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [reason, setReason] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<unknown | null>(null)

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoadingCustomers(true)
      try {
        const res = await sales.customers.list({ limit: 200 })
        setCustomers(res.data.data?.customers || [])
      } catch (e) {
        console.error('Failed to fetch customers', e)
      } finally {
        setLoadingCustomers(false)
      }
    }

    fetchCustomers()
  }, [])

  const canSubmit = useMemo(() => Boolean(customerId) && Boolean(returnDate) && !submitting, [customerId, returnDate, submitting])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const payload = {
        customer_id: customerId,
        return_date: returnDate,
        reason: reason || undefined,
        items: [],
      }

      const res = await salesDocs.returns.create(payload)
      const createdId = res.data.data?.return?.id || res.data.data?.id
      navigate(createdId ? `/sales/returns/${createdId}` : '/sales/returns')
    } catch (e) {
      console.error('Failed to create return', e)
      setError(e)
    } finally {
      setSubmitting(false)
    }
  }

  if (error) {
    if (isModuleDisabledError(error)) return <ModuleDisabledState moduleName="Sales" />
    if (isForbidden(error)) return <ForbiddenState />
    return <ErrorState message={getApiErrorMessage(error)} />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/sales/returns" className="p-2 hover:bg-gray-100 rounded" title="Back">
            <ArrowLeft size={18} className="text-[var(--secondary)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">New Return</h1>
            <p className="text-[var(--text-secondary)]">Minimal return creation</p>
          </div>
        </div>

        <button
          type="submit"
          form="new-return-form"
          disabled={!canSubmit}
          className="bg-[var(--primary)] disabled:opacity-50 hover:bg-[var(--primary-hover)] text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Save size={18} />
          {submitting ? 'Saving…' : 'Save'}
        </button>
      </div>

      <form id="new-return-form" onSubmit={handleSubmit} className="bg-white rounded-lg border border-[var(--border)] p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Customer</label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              disabled={loadingCustomers}
              required
            >
              <option value="">Select a customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {loadingCustomers && <p className="mt-1 text-xs text-[var(--text-secondary)]">Loading customers…</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Return date</label>
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Reason</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Optional reason / notes for this return…"
            rows={4}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            This page is intentionally minimal. Line items and linkage to invoice/order can be added later.
          </p>
        </div>
      </form>
    </div>
  )
}
