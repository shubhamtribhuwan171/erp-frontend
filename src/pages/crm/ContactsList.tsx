import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users } from 'lucide-react'
import { crm } from '../../lib/api'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../components/ui/RequestState'
import { DataTable, PageHeader, SearchInput } from '../../components/ui'

export default function ContactsList() {
  const [contacts, setContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try { const res = await crm.contacts.list(); setContacts(res.data.data?.contacts || []) }
      catch (e) { setError(e) }
      finally { setLoading(false) }
    }
    fetch()
  }, [])

  if (error) {
    if (isModuleDisabledError(error)) return <ModuleDisabledState moduleName="CRM" />
    if (isForbidden(error)) return <ForbiddenState />
    return <ErrorState message={getApiErrorMessage(error)} />
  }

  const columns = [
    { key: 'name', header: 'Name', render: (c: any) => <span className="font-medium text-gray-900">{c.name}</span> },
    { key: 'email', header: 'Email', render: (c: any) => c.email || '-' },
    { key: 'phone', header: 'Phone', render: (c: any) => c.phone || '-' },
    { key: 'company', header: 'Company', render: (c: any) => c.company_name || '-' },
  ]

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <PageHeader icon={Users} title="Contacts" subtitle="CRM contacts" />
        <div className="bg-white rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <SearchInput value={search} onChange={setSearch} placeholder="Search contacts..." />
        </div>
        <DataTable columns={columns} data={contacts} loading={loading} emptyTitle="No contacts found" />
      </div>
    </div>
  )
}
