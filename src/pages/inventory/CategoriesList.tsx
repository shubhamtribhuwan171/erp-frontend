import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Folder } from 'lucide-react'
import { inventory } from '../../lib/api'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../components/ui/RequestState'
import { DataTable, PageHeader, SearchInput } from '../../components/ui'

export default function CategoriesList() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await inventory.categories.list()
        setCategories(res.data.data || [])
      } catch (e) {
        console.error(e)
        setError(e)
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  if (error) {
    if (isModuleDisabledError(error)) return <ModuleDisabledState moduleName="Inventory" />
    if (isForbidden(error)) return <ForbiddenState />
    return <ErrorState message={getApiErrorMessage(error)} />
  }

  const columns = [
    { key: 'name', header: 'Name', render: (c: any) => <span className="font-medium text-gray-900">{c.name}</span> },
    { key: 'code', header: 'Code', render: (c: any) => <span className="font-mono text-sm text-gray-500">{c.code}</span> },
    { key: 'description', header: 'Description', render: (c: any) => c.description || '-' },
  ]

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <PageHeader icon={Folder} title="Categories" subtitle="Manage item categories" />
        <div className="bg-white rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <SearchInput value={search} onChange={setSearch} placeholder="Search categories..." />
        </div>
        <DataTable columns={columns} data={categories.filter(c => !search || c.name?.toLowerCase().includes(search.toLowerCase()))} loading={loading} emptyTitle="No categories found" />
      </div>
    </div>
  )
}
