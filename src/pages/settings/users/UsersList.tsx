import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Settings } from 'lucide-react'
import api from '../../../lib/api'
import { getApiErrorMessage, isForbidden } from '../../../lib/api-error'
import { ForbiddenState } from '../../../components/ui/RequestState'
import { DataTable, PageHeader, SearchInput } from '../../../components/ui'

export default function UsersList() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try { const res = await api.get('/settings/users'); setUsers(res.data.data || []) }
      catch (e) { setError(e) }
      finally { setLoading(false) }
    }
    fetch()
  }, [])

  if (error) {
    if (isForbidden(error)) return <ForbiddenState />
    return <div className="p-6 text-red-500">{getApiErrorMessage(error)}</div>
  }

  const columns = [
    { key: 'full_name', header: 'Name', render: (u: any) => (
      <Link to={`/settings/users/${u.id}`} className="font-medium text-gray-900 hover:text-gray-700">{u.full_name || u.email}</Link>
    )},
    { key: 'email', header: 'Email', render: (u: any) => <span className="text-gray-600">{u.email}</span> },
    { key: 'role', header: 'Role', render: (u: any) => <span className="capitalize">{u.role || 'User'}</span> },
    { key: 'is_active', header: 'Status', render: (u: any) => (
      <span className={`px-2 py-1 rounded-md text-xs ${u.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
        {u.is_active ? 'Active' : 'Inactive'}
      </span>
    )},
  ]

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <PageHeader icon={Settings} title="Users" subtitle="Manage users" />
        <div className="bg-white rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <SearchInput value={search} onChange={setSearch} placeholder="Search users..." />
        </div>
        <DataTable columns={columns} data={users} loading={loading} emptyTitle="No users found" />
      </div>
    </div>
  )
}
