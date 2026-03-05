import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2, Mail, Phone, RefreshCw, UserCheck } from 'lucide-react'
import api from '../../lib/api'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../components/ui/RequestState'

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

  return (
    <div className="space-y-4">
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

          <button
            type="button"
            onClick={handleConvert}
            disabled={converting || loading || !lead || String(lead?.status).toLowerCase() !== 'lead'}
            className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 disabled:opacity-50"
            title={String(lead?.status).toLowerCase() !== 'lead' ? 'Already a customer' : 'Convert to customer'}
          >
            {converting ? <Loader2 size={18} className="animate-spin" /> : <UserCheck size={18} />}
            {converting ? 'Converting…' : 'Convert'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[var(--border)] p-4">
        {loading ? (
          <div className="py-8 text-center text-[var(--secondary)]">Loading…</div>
        ) : !lead ? (
          <div className="py-8 text-center text-[var(--secondary)]">Lead not found</div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  )
}
