import { useEffect, useState } from 'react'
import { Briefcase } from 'lucide-react'
import { hrApi } from '../../lib/hr-api'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../components/ui/RequestState'
import { DataTable, PageHeader } from '../../components/ui'

export default function DepartmentsList() {
  const [departments, setDepartments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown | null>(null)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try { const res = await hrApi.departments.list(); setDepartments(res.data.data || []) }
      catch (e) { setError(e) }
      finally { setLoading(false) }
    }
    fetch()
  }, [])

  if (error) {
    if (isModuleDisabledError(error)) return <ModuleDisabledState moduleName="HR" />
    if (isForbidden(error)) return <ForbiddenState />
    return <ErrorState message={getApiErrorMessage(error)} />
  }

  const columns = [
    { key: 'name', header: 'Name', render: (d: any) => <span className="font-medium text-gray-900">{d.name}</span> },
    { key: 'code', header: 'Code', render: (d: any) => <span className="font-mono text-sm text-gray-500">{d.code}</span> },
    { key: 'description', header: 'Description', render: (d: any) => d.description || '-' },
  ]

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <PageHeader icon={Briefcase} title="Departments" subtitle="HR departments" />
        <DataTable columns={columns} data={departments} loading={loading} emptyTitle="No departments found" />
      </div>
    </div>
  )
}
