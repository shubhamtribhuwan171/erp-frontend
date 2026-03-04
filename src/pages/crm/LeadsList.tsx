import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Mail, Phone } from 'lucide-react'
import { crm } from '../../lib/api'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../components/ui/RequestState'

export default function LeadsList() {
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown | null>(null)

  useEffect(() => {
    fetchLeads()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchLeads = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await crm.leads.list()
      setLeads(res.data.data?.leads || [])
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700',
    contacted: 'bg-yellow-100 text-yellow-700',
    qualified: 'bg-purple-100 text-purple-700',
    proposal: 'bg-orange-100 text-orange-700',
    won: 'bg-green-100 text-green-700',
    lost: 'bg-red-100 text-red-700',
  }

  if (error) {
    if (isModuleDisabledError(error)) return <ModuleDisabledState moduleName="CRM" />
    if (isForbidden(error)) return <ForbiddenState />
    return <ErrorState message={getApiErrorMessage(error)} />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Leads</h1>
          <p className="text-[var(--secondary)]">Manage leads</p>
        </div>
        <Link
          to="/crm/leads/new"
          className="bg-[var(--primary)] text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} /> Add Lead
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="text-[var(--secondary)]">Loading…</div>
        ) : leads.length === 0 ? (
          <div className="col-span-full text-center py-8 text-[var(--secondary)]">
            No leads yet
          </div>
        ) : (
          leads.map((lead) => (
            <div key={lead.id} className="bg-white rounded-lg border p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 font-semibold">
                    {lead.name?.charAt(0) || 'L'}
                  </div>
                  <div>
                    <h3 className="font-semibold">{lead.name}</h3>
                    <p className="text-xs text-[var(--secondary)]">{lead.code}</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs capitalize ${statusColors[lead.status] || 'bg-gray-100'}`}
                >
                  {lead.status || 'new'}
                </span>
              </div>
              <div className="mt-4 space-y-2 text-sm text-[var(--secondary)]">
                {lead.email && (
                  <div className="flex items-center gap-2">
                    <Mail size={14} />
                    {lead.email}
                  </div>
                )}
                {lead.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={14} />
                    {lead.phone}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
