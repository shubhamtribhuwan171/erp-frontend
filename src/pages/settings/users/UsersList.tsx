import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Trash2 } from 'lucide-react'
import { settings } from '../../../lib/api'
import { settingsUsers, type SettingsUser } from '../../../lib/settings-users'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../../components/ui/RequestState'

export default function UsersList() {
  const [users, setUsers] = useState<SettingsUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown | null>(null)

  const [q, setQ] = useState('')

  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createForm, setCreateForm] = useState({ email: '', full_name: '', role: 'staff' })

  useEffect(() => {
    fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await settingsUsers.list()
      setUsers(res.data.data?.users || res.data.data || [])
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return users
    return users.filter((u) => {
      const s = `${u.email || ''} ${u.full_name || ''} ${u.role || ''}`.toLowerCase()
      return s.includes(term)
    })
  }, [users, q])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      await settings.createUser(createForm)
      setShowCreate(false)
      setCreateForm({ email: '', full_name: '', role: 'staff' })
      fetchUsers()
    } catch (e) {
      alert(getApiErrorMessage(e))
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    const ok = confirm('Delete this user?')
    if (!ok) return
    try {
      await settingsUsers.delete(id)
      fetchUsers()
    } catch (e) {
      alert(getApiErrorMessage(e))
    }
  }

  if (error) {
    if (isModuleDisabledError(error)) return <ModuleDisabledState moduleName="Settings" />
    if (isForbidden(error)) return <ForbiddenState />
    return <ErrorState message={getApiErrorMessage(error)} />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Users</h1>
          <p className="text-[var(--secondary)]">Manage users and roles</p>
        </div>
        <button
          onClick={() => setShowCreate((s) => !s)}
          className="bg-[var(--primary)] text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} /> Add User
        </button>
      </div>

      {showCreate ? (
        <div className="bg-white rounded-lg border p-4">
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Full name</label>
              <input
                value={createForm.full_name}
                onChange={(e) => setCreateForm((p) => ({ ...p, full_name: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                value={createForm.role}
                onChange={(e) => setCreateForm((p) => ({ ...p, role: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                <option value="staff">Staff</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
                <option value="owner">Owner</option>
              </select>
            </div>
            <div className="md:col-span-4 flex gap-2">
              <button
                type="submit"
                disabled={creating}
                className="bg-[var(--primary)] text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {creating ? 'Creating…' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 rounded-lg border"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--secondary)]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search users…"
              className="w-full pl-9 pr-3 py-2 border rounded-lg"
            />
          </div>
          <div className="text-sm text-[var(--secondary)]">{loading ? 'Loading…' : `${filtered.length} users`}</div>
        </div>

        {loading ? (
          <div className="p-4 text-[var(--secondary)]">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-[var(--secondary)]">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="p-3 font-medium">User</th>
                  <th className="p-3 font-medium">Role</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium w-[180px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td className="p-3">
                      <Link to={`/settings/users/${u.id}`} className="font-medium hover:text-[var(--primary)]">
                        {u.full_name || u.email}
                      </Link>
                      <div className="text-[var(--secondary)]">{u.email}</div>
                    </td>
                    <td className="p-3 capitalize">{u.role || '-'}</td>
                    <td className="p-3">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs ${u.is_active === false ? 'bg-gray-100 text-gray-700' : 'bg-green-50 text-green-700'}`}
                      >
                        {u.is_active === false ? 'Inactive' : 'Active'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Link
                          to={`/settings/users/${u.id}`}
                          className="px-3 py-2 rounded-lg border hover:bg-gray-50"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="px-3 py-2 rounded-lg border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 flex items-center gap-2"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
