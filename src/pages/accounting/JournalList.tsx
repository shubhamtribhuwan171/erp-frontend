import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, FileText } from 'lucide-react'
import { accounting } from '../../lib/api'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../components/ui/RequestState'
import { DataTable, PageHeader, SearchInput, StatusBadge } from '../../components/ui'

export default function JournalList() {
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchEntries = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await accounting.journal.list()
        setEntries(res.data.data?.entries || [])
      } catch (e) {
        setError(e)
      } finally {
        setLoading(false)
      }
    }
    fetchEntries()
  }, [])

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  if (error) {
    if (isModuleDisabledError(error)) return <ModuleDisabledState moduleName="Accounting" />
    if (isForbidden(error)) return <ForbiddenState />
    return <ErrorState message={getApiErrorMessage(error)} />
  }

  const columns = [
    { key: 'entry_no', header: 'Entry #', render: (e: any) => (
      <Link to={`/accounting/journal/${e.id}`} className="font-mono text-sm text-gray-700 hover:text-gray-900">{e.entry_no}</Link>
    )},
    { key: 'entry_date', header: 'Date', render: (e: any) => formatDate(e.entry_date) },
    { key: 'memo', header: 'Description', render: (e: any) => e.memo || '-' },
    { key: 'status', header: 'Status', align: 'center' as const, render: (e: any) => (
      <StatusBadge status={e.status} map={{
        draft: { bg: 'bg-gray-100 text-gray-700', label: 'Draft' },
        posted: { bg: 'bg-green-100 text-green-700', label: 'Posted' },
        void: { bg: 'bg-red-100 text-red-700', label: 'Void' },
      }} />
    )},
  ]

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <PageHeader icon={FileText} title="Journal" subtitle="General journal entries" />
        <div className="bg-white rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <SearchInput value={search} onChange={setSearch} placeholder="Search entries..." />
        </div>
        <DataTable columns={columns} data={entries} loading={loading} emptyTitle="No entries found" actions={[{ icon: 'view' as const, path: (e: any) => `/accounting/journal/${e.id}` }]} />
      </div>
    </div>
  )
}
