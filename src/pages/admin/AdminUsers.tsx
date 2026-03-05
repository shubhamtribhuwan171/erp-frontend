import { useEffect, useState } from 'react'
import { adminUsers, adminOrgs } from '../../lib/admin-api'
import { getAdminErrorMessage } from '../../lib/admin-error'
import { Card, Button, Input, Badge, EmptyState } from '../../components/ui'
import { ErrorState } from '../../components/ui/RequestState'

const roles = ['owner', 'admin', 'manager', 'staff']

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([])
  const [organizations, setOrganizations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
    company_id: '',
    role: 'staff',
  })

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [usersRes, orgsRes] = await Promise.all([adminUsers.list(), adminOrgs.list({ limit: 100 })])
      if (usersRes?.success) setUsers(usersRes.data.users)
      if (orgsRes?.success) setOrganizations(orgsRes.data.organizations)
    } catch (e) {
      console.error('Failed to load:', e)
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await adminUsers.create(form)
      setShowModal(false)
      setForm({ email: '', password: '', full_name: '', company_id: '', role: 'staff' })
      loadData()
    } catch (e) {
      setError(e)
      alert(getAdminErrorMessage(e))
    }
  }

  const toggleActive = async (user: any) => {
    setError(null)
    try {
      await adminUsers.update(user.id, { is_active: !user.is_active })
      loadData()
    } catch (e) {
      setError(e)
      alert(getAdminErrorMessage(e))
    }
  }

  const updateRole = async (user: any, role: string) => {
    setError(null)
    try {
      await adminUsers.update(user.id, { role })
      loadData()
    } catch (e) {
      setError(e)
      alert(getAdminErrorMessage(e))
    }
  }

  if (error && !showModal) {
    return <ErrorState message={getAdminErrorMessage(error)} />
  }

  if (loading) return <div>Loading…</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <Button onClick={() => setShowModal(true)}>+ Add User</Button>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organization</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <p className="font-medium">{user.full_name || '-'}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </td>
                <td className="px-6 py-4 text-sm">{user.company?.name || '-'}</td>
                <td className="px-6 py-4">
                  <select
                    value={user.role}
                    onChange={(e) => updateRole(user, e.target.value)}
                    className="text-sm border rounded px-2 py-1"
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={user.is_active ? 'success' : 'danger'}>{user.is_active ? 'Active' : 'Inactive'}</Badge>
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => toggleActive(user)} className="text-sm text-[var(--primary)] hover:underline">
                    {user.is_active ? 'Disable' : 'Enable'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!users.length && <EmptyState title="No users" />}
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Add User</h2>

            {error ? (
              <div className="mb-4">
                <ErrorState title="Could not create user" message={getAdminErrorMessage(error)} />
              </div>
            ) : null}

            <form onSubmit={handleCreate} className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <Input
                label="Password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <Input label="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                <select
                  value={form.company_id}
                  onChange={(e) => setForm({ ...form, company_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">Select Organization</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Create
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
