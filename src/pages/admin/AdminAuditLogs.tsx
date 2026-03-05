import { useEffect, useState } from 'react'
import { adminAudit } from '../../lib/admin-api'
import { getAdminErrorMessage } from '../../lib/admin-error'
import { Card, Badge } from '../../components/ui'
import { ErrorState } from '../../components/ui/RequestState'

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown | null>(null)
  const [filters, setFilters] = useState({
    action: '',
    target_type: '',
    page: 1,
  })

  useEffect(() => {
    loadLogs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const loadLogs = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await adminAudit.list(filters)
      if (res.success) {
        setLogs(res.data.logs)
      }
    } catch (e) {
      console.error('Failed to load:', e)
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  const getActionColor = (action: string) => {
    if (action.includes('delete')) return 'danger'
    if (action.includes('create')) return 'success'
    if (action.includes('update')) return 'warning'
    return 'default'
  }

  if (error) return <ErrorState message={getAdminErrorMessage(error)} />

  if (loading) return <div>Loading…</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Audit Logs</h1>

      <Card className="p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
            <select
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">All Actions</option>
              <option value="create_organization">Create Organization</option>
              <option value="update_organization">Update Organization</option>
              <option value="delete_organization">Delete Organization</option>
              <option value="create_user">Create User</option>
              <option value="update_user">Update User</option>
              <option value="delete_user">Delete User</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Type</label>
            <select
              value={filters.target_type}
              onChange={(e) => setFilters({ ...filters, target_type: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">All Types</option>
              <option value="company">Company</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(log.created_at).toLocaleString()}</td>
                <td className="px-6 py-4 text-sm">{log.admin?.email || 'System'}</td>
                <td className="px-6 py-4">
                  <Badge variant={getActionColor(log.action)}>{log.action.replace(/_/g, ' ')}</Badge>
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className="capitalize">{log.target_type}</span>
                  <span className="text-gray-400 ml-1">{log.target_id?.slice(0, 8)}...</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {log.details ? JSON.stringify(log.details).slice(0, 50) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!logs.length && <div className="p-8 text-center text-gray-500">No audit logs</div>}
      </Card>
    </div>
  )
}
