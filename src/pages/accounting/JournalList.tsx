import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { accounting } from '../../lib/api'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../components/ui/RequestState'

export default function JournalList() {
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown | null>(null)

  useEffect(() => {
    fetchEntries()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    posted: 'bg-green-100 text-green-700',
    void: 'bg-red-100 text-red-700',
  }

  if (error) {
    if (isModuleDisabledError(error)) return <ModuleDisabledState moduleName="Accounting" />
    if (isForbidden(error)) return <ForbiddenState />
    return <ErrorState message={getApiErrorMessage(error)} />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Journal Entries</h1>
          <p className="text-[var(--text-secondary)]">View journal entries</p>
        </div>
        <button className="bg-[var(--primary)] text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus size={18} /> New Entry
        </button>
      </div>

      <div className="bg-white rounded-lg border border-[var(--border-strong)] overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-[var(--border-strong)]">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--secondary)]">Entry #</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--secondary)]">Date</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--secondary)]">Description</th>
              <th className="text-center px-4 py-3 text-sm font-medium text-[var(--secondary)]">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-strong)]">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-[var(--text-secondary)]">
                  Loading…
                </td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-[var(--secondary)]">
                  No journal entries
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link to={`/accounting/journal/${entry.id}`} className="font-mono text-sm hover:text-[var(--primary)]">
                      {entry.entry_no}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/accounting/journal/${entry.id}`} className="hover:text-[var(--primary)]">
                      {new Date(entry.entry_date).toLocaleDateString('en-IN')}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{entry.memo || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs ${statusColors[entry.status] || 'bg-gray-100'}`}>
                      {entry.status}
                    </span>
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
