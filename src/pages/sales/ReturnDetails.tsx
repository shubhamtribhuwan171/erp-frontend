import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { salesDocs } from '../../lib/sales-docs'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../components/ui/RequestState'

export default function ReturnDetails() {
  const { id } = useParams<{ id: string }>()

  const [ret, setRet] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown | null>(null)

  useEffect(() => {
    const fetchReturn = async () => {
      if (!id) return
      setLoading(true)
      setError(null)
      try {
        const res = await salesDocs.returns.get(id)
        setRet(res.data.data?.return || res.data.data)
      } catch (e) {
        console.error('Failed to fetch return', e)
        setError(e)
      } finally {
        setLoading(false)
      }
    }

    fetchReturn()
  }, [id])

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format((amount || 0) / 100)

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  const title = useMemo(() => {
    if (!ret) return 'Return'
    return ret.return_no || ret.number || 'Return'
  }, [ret])

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

  if (!ret) {
    return (
      <div className="bg-white rounded-lg border border-[var(--border)] p-8 text-center text-[var(--secondary)]">
        Return not found.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/sales/returns" className="p-2 hover:bg-gray-100 rounded" title="Back">
          <ArrowLeft size={18} className="text-[var(--secondary)]" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-[var(--text-secondary)]">Return details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-lg border border-[var(--border)] p-4">
          <h2 className="font-semibold mb-3">Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-[var(--text-secondary)]">Customer</div>
              <div className="font-medium">{ret.customer?.name || ret.customer_name || 'N/A'}</div>
            </div>
            <div>
              <div className="text-[var(--text-secondary)]">Status</div>
              <div className="font-medium capitalize">{ret.status || '—'}</div>
            </div>
            <div>
              <div className="text-[var(--text-secondary)]">Return date</div>
              <div className="font-medium">{ret.return_date ? formatDate(ret.return_date) : '—'}</div>
            </div>
            <div>
              <div className="text-[var(--text-secondary)]">Total</div>
              <div className="font-medium">{formatCurrency(ret.total_minor ?? ret.total_amount_minor ?? 0)}</div>
            </div>
          </div>

          {ret.reason && (
            <div className="mt-4">
              <div className="text-sm text-[var(--text-secondary)] mb-1">Reason</div>
              <div className="text-sm whitespace-pre-wrap">{ret.reason}</div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-[var(--border)] p-4">
          <h2 className="font-semibold mb-3">Meta</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">ID</span>
              <span className="font-mono">{ret.id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Created</span>
              <span>{ret.created_at ? formatDate(ret.created_at) : '—'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
