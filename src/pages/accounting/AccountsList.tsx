import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Wallet } from 'lucide-react'
import { accounting } from '../../lib/api'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../components/ui/RequestState'
import { DataTable, PageHeader, SearchInput, StatusBadge } from '../../components/ui'

export default function AccountsList() {
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchAccounts = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await accounting.accounts.list()
        setAccounts(res.data.data || [])
      } catch (e) {
        console.error(e)
        setError(e)
      } finally {
        setLoading(false)
      }
    }
    fetchAccounts()
  }, [])

  if (error) {
    if (isModuleDisabledError(error)) return <ModuleDisabledState moduleName="Accounting" />
    if (isForbidden(error)) return <ForbiddenState />
    return <ErrorState message={getApiErrorMessage(error)} />
  }

  const columns = [
    { key: 'code', header: 'Code', render: (a: any) => (
      <Link to={`/accounting/accounts/${a.id}`} className="font-mono text-sm text-gray-500 hover:text-gray-700">{a.code}</Link>
    )},
    { key: 'name', header: 'Name', render: (a: any) => (
      <Link to={`/accounting/accounts/${a.id}`} className="font-medium text-gray-900 hover:text-gray-700">{a.name}</Link>
    )},
    { key: 'type', header: 'Type', align: 'center' as const, render: (a: any) => (
      <StatusBadge status={a.type} map={{
        asset: { bg: 'bg-blue-50 text-blue-600 border border-blue-100', label: 'Asset' },
        liability: { bg: 'bg-red-50 text-red-600 border border-red-100', label: 'Liability' },
        equity: { bg: 'bg-purple-50 text-purple-600 border border-purple-100', label: 'Equity' },
        revenue: { bg: 'bg-green-50 text-green-600 border border-green-100', label: 'Revenue' },
        expense: { bg: 'bg-orange-50 text-orange-600 border border-orange-100', label: 'Expense' },
      }} />
    )},
  ]

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <PageHeader icon={Wallet} title="Accounts" subtitle="Manage chart of accounts" />
        <div className="bg-white rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <SearchInput value={search} onChange={setSearch} placeholder="Search accounts..." />
        </div>
        <DataTable columns={columns} data={accounts} loading={loading} emptyTitle="No accounts found" />
      </div>
    </div>
  )
}
