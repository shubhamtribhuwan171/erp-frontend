import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2, Save, Trash2 } from 'lucide-react'
import { settingsUsers, type SettingsUser } from '../../../lib/settings-users'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../../components/ui/RequestState'

export default function UserEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [user, setUser] = useState<Partial<SettingsUser>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState<unknown | null>(null)

  useEffect(() => {
    if (!id) return
    fetchUser(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchUser = async (userId: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await settingsUsers.get(userId)
      setUser(res.data.data || {})
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  const canSave = useMemo(() => {
    return Boolean(user.full_name || user.phone || user.role || user.is_active === false || user.is_active === true)
  }, [user.full_name, user.phone, user.role, user.is_active])

  const handleSave = async () => {
    if (!id) return
    setSaving(true)
    setMessage('')
    setError(null)
    try {
      await settingsUsers.update(id, {
        full_name: user.full_name,
        phone: user.phone,
        role: user.role,
        is_active: user.is_active,
      })
      setMessage('User updated')
    } catch (e) {
      setError(e)
      setMessage(getApiErrorMessage(e))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!id) return
    const ok = confirm('Delete this user?')
    if (!ok) return

    setDeleting(true)
    setMessage('')
    setError(null)
    try {
      await settingsUsers.delete(id)
      navigate('/settings/users')
    } catch (e) {
      setError(e)
      setMessage(getApiErrorMessage(e))
    } finally {
      setDeleting(false)
    }
  }

  if (error) {
    if (isModuleDisabledError(error)) return <ModuleDisabledState moduleName="Settings" />
    if (isForbidden(error)) return <ForbiddenState />
    return <ErrorState message={getApiErrorMessage(error)} />
  }

  if (loading) return <div className="text-[var(--secondary)]">Loading…</div>

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-[var(--secondary)]">
            <Link to="/settings/users" className="inline-flex items-center gap-2 hover:underline">
              <ArrowLeft size={16} /> Users
            </Link>
          </div>
          <h1 className="text-2xl font-semibold">Edit User</h1>
          <p className="text-[var(--secondary)]">Update role and status</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDelete}
            disabled={deleting || saving}
            className="px-4 py-2 rounded-lg border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50 flex items-center gap-2"
          >
            {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            Delete
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave || saving || deleting}
            className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-4 py-2 rounded-lg disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {message ? (
        <div
          className={`p-4 rounded-lg border ${message.toLowerCase().includes('updated') ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}
        >
          {message}
        </div>
      ) : null}

      <div className="bg-white rounded-lg border p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              value={user.email || ''}
              disabled
              className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-[var(--secondary)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Created</label>
            <input
              value={user.created_at ? new Date(user.created_at).toLocaleString() : ''}
              disabled
              className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-[var(--secondary)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Full name</label>
            <input
              value={user.full_name || ''}
              onChange={(e) => setUser((p) => ({ ...p, full_name: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              value={user.phone || ''}
              onChange={(e) => setUser((p) => ({ ...p, phone: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              value={user.role || 'staff'}
              onChange={(e) => setUser((p) => ({ ...p, role: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg bg-white"
            >
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
              <option value="owner">Owner</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Active</label>
            <select
              value={user.is_active === false ? 'inactive' : 'active'}
              onChange={(e) => setUser((p) => ({ ...p, is_active: e.target.value === 'active' }))}
              className="w-full px-3 py-2 border rounded-lg bg-white"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t text-sm text-[var(--secondary)]">
          User ID: <span className="font-mono">{id}</span>
        </div>
      </div>
    </div>
  )
}
