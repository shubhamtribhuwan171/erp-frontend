import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2, Mail, Phone, RefreshCw, UserCheck, FileText, ShoppingCart, Calendar, TrendingUp, CheckCircle } from 'lucide-react'
import api from '../../lib/api'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../components/ui/RequestState'

function formatCurrency(minor?: number | null) {
  if (minor === null || minor === undefined) return '-'
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(minor / 100)
}

function formatDate(date?: string | null) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    lead: 'bg-yellow-100 text-yellow-800',
    active: 'bg-green-100 text-green-700',
    converted: 'bg-blue-100 text-blue-700',
    lost: 'bg-red-100 text-red-700',
    draft: 'bg-gray-100 text-gray-700',
    confirmed: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    invoiced: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    quotation: 'bg-orange-100 text-orange-700',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs capitalize ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  )
}

export default function LeadDetails() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [loading, setLoading] = useState(true)
  const [lead, setLead] = useState<any>(null)
  const [error, setError] = useState<unknown | null>(null)

  const [converting, setConverting] = useState(false)

  const fetchLead = async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(`/crm/leads/${id}`)
      setLead(res.data.data)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLead()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const statusBadge = useMemo(() => {
    const s = String(lead?.status ?? 'lead').toLowerCase()
    if (s === 'lead') return 'bg-yellow-100 text-yellow-800'
    if (s === 'active') return 'bg-green-100 text-green-700'
    return 'bg-gray-100 text-gray-700'
  }, [lead?.status])

  const handleConvert = async () => {
    if (!id) return
    if (converting) return

    const ok = window.confirm('Convert this lead to a customer?')
    if (!ok) return

    setConverting(true)
    try {
      await api.post(`/crm/leads/${id}/convert`)
      navigate(`/sales/customers/${id}`)
    } catch (e) {
      alert(getApiErrorMessage(e))
    } finally {
      setConverting(false)
    }
  }

  if (error) {
    if (isModuleDisabledError(error)) return <ModuleDisabledState moduleName="CRM" />
    if (isForbidden(error)) return <ForbiddenState />
    return <ErrorState message={getApiErrorMessage(error)} />
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Link to="/crm/leads" className="p-2 hover:bg-gray-100 rounded" title="Back">
            <ArrowLeft size={18} className="text-[var(--secondary)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Lead</h1>
            <p className="text-[var(--text-secondary)]">Lead details</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-[var(--border)] p-8 text-center text-[var(--secondary)]">
          Loading...
        </div>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Link to="/crm/leads" className="p-2 hover:bg-gray-100 rounded" title="Back">
            <ArrowLeft size={18} className="text-[var(--secondary)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Lead</h1>
            <p className="text-[var(--text-secondary)]">Lead details</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-[var(--border)] p-8 text-center text-[var(--secondary)]">
          Lead not found
        </div>
      </div>
    )
  }

  const { quotations = [], orders = [] } = lead
  const isLead = String(lead.status).toLowerCase() === 'lead'
  const quotationCount = quotations.length
  const totalQuotationValue = quotations.reduce((sum: number, q: any) => sum + (q.total_minor || 0), 0)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/crm/leads" className="p-2 hover:bg-gray-100 rounded" title="Back">
            <ArrowLeft size={18} className="text-[var(--secondary)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Lead</h1>
            <p className="text-[var(--text-secondary)]">Lead details</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchLead}
            className="px-3 py-2 border border-[var(--border)] rounded-lg hover:bg-gray-50 inline-flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>

          {isLead && (
            <button
              type="button"
              onClick={handleConvert}
              disabled={converting || loading}
              className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 disabled:opacity-50"
            >
              {converting ? <Loader2 size={18} className="animate-spin" /> : <UserCheck size={18} />}
              {converting ? 'Converting…' : 'Convert'}
            </button>
          )}
        </div>
      </div>

      {/* Basic Info Card */}
      <div className="bg-white rounded-lg border border-[var(--border)] p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm text-[var(--text-secondary)]">Name</div>
            <div className="text-lg font-semibold">{lead.name ?? '-'}</div>
            <div className="text-sm text-[var(--text-secondary)] font-mono">{lead.code ?? ''}</div>
          </div>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs capitalize ${statusBadge}`}>
            {lead.status ?? 'lead'}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="border border-[var(--border)] rounded-lg p-3">
            <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
              <Mail size={14} /> Email
            </div>
            <div className="mt-1 font-medium">{lead.email ?? '-'}</div>
          </div>
          <div className="border border-[var(--border)] rounded-lg p-3">
            <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
              <Phone size={14} /> Phone
            </div>
            <div className="mt-1 font-medium">{lead.phone ?? '-'}</div>
          </div>
        </div>

        {/* Created date */}
        <div className="mt-4 pt-4 border-t border-[var(--border)]">
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <Calendar size={14} />
            Created: {formatDate(lead.created_at)}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg border border-[var(--border)] p-3">
          <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
            <FileText size={14} className="text-orange-500" /> Quotations
          </div>
          <div className="text-lg font-semibold mt-1">{quotationCount}</div>
        </div>
        <div className="bg-white rounded-lg border border-[var(--border)] p-3">
          <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
            <TrendingUp size={14} className="text-orange-500" /> Quoted Value
          </div>
          <div className="text-lg font-semibold mt-1">{formatCurrency(totalQuotationValue)}</div>
        </div>
        <div className="bg-white rounded-lg border border-[var(--border)] p-3">
          <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
            <ShoppingCart size={14} /> Orders
          </div>
          <div className="text-lg font-semibold mt-1">{orders.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-[var(--border)] p-3">
          <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
            <CheckCircle size={14} className="text-green-500" /> Converted
          </div>
          <div className="text-lg font-semibold mt-1">{isLead ? 'No' : 'Yes'}</div>
        </div>
      </div>

      {/* Quotations */}
      {quotations.length > 0 && (
        <div className="bg-white rounded-lg border border-[var(--border)] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-orange-500" />
              <h2 className="font-semibold">Quotations</h2>
            </div>
            <Link to="/sales/quotations" className="text-sm text-[var(--primary)] hover:underline">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-[var(--text-secondary)]">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Quotation #</th>
                  <th className="text-left px-4 py-2 font-medium">Date</th>
                  <th className="text-right px-4 py-2 font-medium">Amount</th>
                  <th className="text-center px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {quotations.map((quo: any) => (
                  <tr key={quo.id} className="border-t border-[var(--border)] hover:bg-gray-50">
                    <td className="px-4 py-2 font-mono">{quo.order_no}</td>
                    <td className="px-4 py-2">{formatDate(quo.order_date)}</td>
                    <td className="px-4 py-2 text-right font-medium">{formatCurrency(quo.total_minor)}</td>
                    <td className="px-4 py-2 text-center"><StatusBadge status={quo.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Orders (if converted) */}
      {!isLead && orders.length > 0 && (
        <div className="bg-white rounded-lg border border-[var(--border)] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <ShoppingCart size={18} className="text-green-500" />
              <h2 className="font-semibold">Orders</h2>
            </div>
            <Link to="/sales/orders" className="text-sm text-[var(--primary)] hover:underline">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-[var(--text-secondary)]">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Order #</th>
                  <th className="text-left px-4 py-2 font-medium">Date</th>
                  <th className="text-right px-4 py-2 font-medium">Amount</th>
                  <th className="text-center px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order: any) => (
                  <tr key={order.id} className="border-t border-[var(--border)] hover:bg-gray-50">
                    <td className="px-4 py-2 font-mono">{order.order_no}</td>
                    <td className="px-4 py-2">{formatDate(order.order_date)}</td>
                    <td className="px-4 py-2 text-right font-medium">{formatCurrency(order.total_minor)}</td>
                    <td className="px-4 py-2 text-center"><StatusBadge status={order.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {quotations.length === 0 && orders.length === 0 && (
        <div className="bg-white rounded-lg border border-[var(--border)] p-8 text-center text-[var(--text-secondary)]">
          <FileText size={32} className="mx-auto mb-2 opacity-50" />
          <p>No quotations or orders yet</p>
        </div>
      )}
    </div>
  )
}
