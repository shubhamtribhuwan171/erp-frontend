import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, Building, Calendar, Shield } from 'lucide-react'
import api from '../../../lib/api'

function formatDate(date?: string | null) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function UserDetails() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const run = async () => {
      if (!id) return
      setLoading(true)
      setError('')
      try {
        const res = await api.get(`/settings/users/${id}`)
        setUser(res.data.data)
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load user')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [id])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Link to="/settings/users" className="p-2 hover:bg-gray-100 rounded">
            <ArrowLeft size={18} className="text-[var(--secondary)]" />
          </Link>
          <h1 className="text-2xl font-semibold">User</h1>
        </div>
        <div className="bg-white rounded-lg border border-[var(--border)] p-8 text-center text-[var(--secondary)]">
          Loading...
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Link to="/settings/users" className="p-2 hover:bg-gray-100 rounded">
            <ArrowLeft size={18} className="text-[var(--secondary)]" />
          </Link>
          <h1 className="text-2xl font-semibold">User</h1>
        </div>
        <div className="bg-white rounded-lg border border-[var(--border)] p-8 text-center text-red-600">
          {error || 'User not found'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/settings/users" className="p-2 hover:bg-gray-100 rounded">
            <ArrowLeft size={18} className="text-[var(--secondary)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">User</h1>
            <p className="text-[var(--text-secondary)]">User details</p>
          </div>
        </div>

        {id && (
          <Link
            to={`/settings/users/${id}/edit`}
            className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
          >
            Edit
          </Link>
        )}
      </div>

      {/* User Info */}
      <div className="bg-white rounded-lg border border-[var(--border)] p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-xl font-semibold">
            {user.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <div className="text-xl font-semibold">{user.full_name || '-'}</div>
            <div className="text-[var(--text-secondary)]">{user.email}</div>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs mt-1 ${
              user.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
            }`}>
              {user.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="border border-[var(--border)] rounded-lg p-3">
            <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
              <Mail size={14} /> Email
            </div>
            <div className="font-medium mt-1">{user.email}</div>
          </div>
          <div className="border border-[var(--border)] rounded-lg p-3">
            <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
              <Building size={14} /> Company
            </div>
            <div className="font-medium mt-1">{user.company_name || '-'}</div>
          </div>
          <div className="border border-[var(--border)] rounded-lg p-3">
            <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
              <Shield size={14} /> Role
            </div>
            <div className="font-medium mt-1 capitalize">{user.role || 'User'}</div>
          </div>
          <div className="border border-[var(--border)] rounded-lg p-3">
            <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
              <Calendar size={14} /> Created
            </div>
            <div className="font-medium mt-1">{formatDate(user.created_at)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
