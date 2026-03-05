import { useEffect, useState } from 'react'
import { MapPin } from 'lucide-react'
import { inventory } from '../../lib/api'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../components/ui/RequestState'
import { DataTable, PageHeader } from '../../components/ui'

export default function WarehousesList() {
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown | null>(null)

  useEffect(() => {
    const fetchWarehouses = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await inventory.warehouses.list()
        setWarehouses(res.data.data || [])
      } catch (e) {
        console.error(e)
        setError(e)
      } finally {
        setLoading(false)
      }
    }
    fetchWarehouses()
  }, [])

  if (error) {
    if (isModuleDisabledError(error)) return <ModuleDisabledState moduleName="Inventory" />
    if (isForbidden(error)) return <ForbiddenState />
    return <ErrorState message={getApiErrorMessage(error)} />
  }

  const columns = [
    { key: 'name', header: 'Name', render: (w: any) => <span className="font-medium text-gray-900">{w.name}</span> },
    { key: 'code', header: 'Code', render: (w: any) => <span className="font-mono text-sm text-gray-500">{w.code}</span> },
    { key: 'address', header: 'Address', render: (w: any) => w.address || '-' },
    { key: 'is_default', header: 'Default', render: (w: any) => w.is_default ? <span className="text-green-600">Yes</span> : '-' },
  ]

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <PageHeader icon={MapPin} title="Warehouses" subtitle="Manage warehouses" />
        <DataTable columns={columns} data={warehouses} loading={loading} emptyTitle="No warehouses found" />
      </div>
    </div>
  )
}
