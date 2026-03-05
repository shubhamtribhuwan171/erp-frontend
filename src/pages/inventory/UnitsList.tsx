import { useEffect, useState } from 'react'
import { Scale } from 'lucide-react'
import { inventory } from '../../lib/api'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../components/ui/RequestState'
import { DataTable, PageHeader } from '../../components/ui'

export default function UnitsList() {
  const [units, setUnits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown | null>(null)

  useEffect(() => {
    const fetchUnits = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await inventory.units.list()
        setUnits(res.data.data || [])
      } catch (e) {
        console.error(e)
        setError(e)
      } finally {
        setLoading(false)
      }
    }
    fetchUnits()
  }, [])

  if (error) {
    if (isModuleDisabledError(error)) return <ModuleDisabledState moduleName="Inventory" />
    if (isForbidden(error)) return <ForbiddenState />
    return <ErrorState message={getApiErrorMessage(error)} />
  }

  const columns = [
    { key: 'name', header: 'Name', render: (u: any) => <span className="font-medium text-gray-900">{u.name}</span> },
    { key: 'code', header: 'Code', render: (u: any) => <span className="font-mono text-sm text-gray-500">{u.code}</span> },
  ]

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <PageHeader icon={Scale} title="Units" subtitle="Manage units of measure" />
        <DataTable columns={columns} data={units} loading={loading} emptyTitle="No units found" />
      </div>
    </div>
  )
}
