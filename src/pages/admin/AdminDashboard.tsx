import { useEffect, useState } from 'react'
import { adminStats } from '../../lib/admin-api'
import { getAdminErrorMessage } from '../../lib/admin-error'
import { Card, Badge } from '../../components/ui'
import { ErrorState } from '../../components/ui/RequestState'

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown | null>(null)

  useEffect(() => {
    loadStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadStats = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await adminStats.get()
      if (res.success) {
        setStats(res.data)
      }
    } catch (e) {
      console.error('Failed to load stats:', e)
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  if (error) return <ErrorState message={getAdminErrorMessage(error)} />

  if (loading) return <div className="animate-pulse">Loading…</div>

  const statCards = [
    { label: 'Total Organizations', value: stats?.stats?.totalOrganizations || 0, color: 'blue' },
    { label: 'Active Organizations', value: stats?.stats?.activeOrganizations || 0, color: 'green' },
    { label: 'Total Users', value: stats?.stats?.totalUsers || 0, color: 'purple' },
    { label: 'Logins (24h)', value: stats?.stats?.loginsLast24h || 0, color: 'orange' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.label} className="p-6">
            <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
            <p className="text-3xl font-bold">{stat.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Organizations</h2>
          <div className="space-y-3">
            {stats?.recentOrganizations?.map((org: any) => (
              <div key={org.id} className="flex items-center justify-between py-2 border-b">
                <div>
                  <p className="font-medium">{org.name}</p>
                  <p className="text-sm text-gray-500">Created {new Date(org.created_at).toLocaleDateString()}</p>
                </div>
                <Badge variant={org.is_active ? 'success' : 'danger'}>{org.is_active ? 'Active' : 'Inactive'}</Badge>
              </div>
            ))}
            {!stats?.recentOrganizations?.length && <p className="text-gray-500">No organizations yet</p>}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Admin Actions</h2>
          <div className="space-y-3">
            {stats?.recentActions?.map((action: any) => (
              <div key={action.id} className="py-2 border-b">
                <div className="flex items-center justify-between">
                  <p className="font-medium capitalize">{action.action.replace(/_/g, ' ')}</p>
                  <span className="text-xs text-gray-500">{new Date(action.created_at).toLocaleTimeString()}</span>
                </div>
                <p className="text-sm text-gray-500">
                  {action.target_type} • {action.admin?.email}
                </p>
              </div>
            ))}
            {!stats?.recentActions?.length && <p className="text-gray-500">No recent actions</p>}
          </div>
        </Card>
      </div>
    </div>
  )
}
