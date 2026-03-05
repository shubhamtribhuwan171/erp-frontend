import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, UserCheck } from 'lucide-react'
import { crm } from '../../lib/api'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../components/ui/RequestState'
import { DataTable, PageHeader, SearchInput, StatusBadge } from '../../components/ui'

export default function LeadsList() {
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
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
    fetchLeads()
  }, [])

  if (error) {
    if (isModuleDisabledError(error)) return <ModuleDisabledState moduleName="CRM" />
    if (isForbidden(error)) return <ForbiddenState />
    return <ErrorState message={getApiErrorMessage(error)} />
  }

  const columns = [
    { key: 'name', header: 'Name', render: (l: any) => (
      <Link to={`/crm/leads/${l.id}`} className="font-medium text-gray-900 hover:text-gray-700">{l.name}</Link>
    )},
    { key: 'email', header: 'Email', render: (l: any) => l.email || '-' },
    { key: 'phone', header: 'Phone', render: (l: any) => l.phone || '-' },
    { key: 'source', header: 'Source', render: (l: any) => l.source || '-' },
    { key: 'status', header: 'Status', align: 'center' as const, render: (l: any) => (
      <StatusBadge status={l.status} map={{
        new: { bg: 'bg-blue-100 text-blue-700', label: 'New' },
        contacted: { bg: 'bg-yellow-100 text-yellow-700', label: 'Contacted' },
        qualified: { bg: 'bg-purple-100 text-purple-700', label: 'Qualified' },
        proposal: { bg: 'bg-orange-100 text-orange-700', label: 'Proposal' },
        won: { bg: 'bg-green-100 text-green-700', label: 'Won' },
        lost: { bg: 'bg-red-100 text-red-700', label: 'Lost' },
      }} />
    )},
  ]

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <PageHeader icon={UserCheck} title="Leads" subtitle="Manage your leads" />
        <div className="bg-white rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <SearchInput value={search} onChange={setSearch} placeholder="Search leads..." />
        </div>
        <DataTable columns={columns} data={leads} loading={loading} emptyTitle="No leads found" actions={[{ icon: 'view' as const, path: (l: any) => `/crm/leads/${l.id}` }]} />
      </div>
    </div>
  )
}
