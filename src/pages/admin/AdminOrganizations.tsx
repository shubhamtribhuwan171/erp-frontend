import { useEffect, useState } from 'react'
import { adminOrgs } from '../../lib/admin-api'
import { Card, Button, Input, Badge, EmptyState } from '../../components/ui'

export default function AdminOrganizations() {
  const [organizations, setOrganizations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    name: '',
    legal_name: '',
    admin_email: '',
    admin_password: '',
  })

  useEffect(() => {
    loadOrganizations()
  }, [])

  const loadOrganizations = async () => {
    try {
      const res = await adminOrgs.list()
      if (res.success) {
        setOrganizations(res.data.organizations)
      }
    } catch (error) {
      console.error('Failed to load:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await adminOrgs.create(form)
      setShowModal(false)
      setForm({ name: '', legal_name: '', admin_email: '', admin_password: '' })
      loadOrganizations()
    } catch (error) {
      alert('Failed to create organization')
    }
  }

  const toggleActive = async (org: any) => {
    try {
      await adminOrgs.update(org.id, { is_active: !org.is_active })
      loadOrganizations()
    } catch (error) {
      alert('Failed to update')
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Organizations</h1>
        <Button onClick={() => setShowModal(true)}>+ New Organization</Button>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Users</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {organizations.map((org) => (
              <tr key={org.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <p className="font-medium">{org.name}</p>
                  <p className="text-sm text-gray-500">{org.legal_name}</p>
                </td>
                <td className="px-6 py-4 text-sm">
                  {org.users?.[0]?.count || 0}
                </td>
                <td className="px-6 py-4">
                  <Badge variant="info">{org.plan?.plan_name || 'basic'}</Badge>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={org.is_active ? 'success' : 'danger'}>
                    {org.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleActive(org)}
                    className="text-sm text-[--primary] hover:underline mr-3"
                  >
                    {org.is_active ? 'Disable' : 'Enable'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!organizations.length && (
          <EmptyState title="No organizations" />
        )}
      </Card>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">New Organization</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <Input
                label="Company Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <Input
                label="Legal Name"
                value={form.legal_name}
                onChange={(e) => setForm({ ...form, legal_name: e.target.value })}
              />
              <Input
                label="Admin Email"
                type="email"
                value={form.admin_email}
                onChange={(e) => setForm({ ...form, admin_email: e.target.value })}
                required
              />
              <Input
                label="Admin Password"
                type="password"
                value={form.admin_password}
                onChange={(e) => setForm({ ...form, admin_password: e.target.value })}
                required
              />
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
