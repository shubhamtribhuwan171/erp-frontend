import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Edit, Trash2, Eye, Phone, Mail, Users } from 'lucide-react'
import { sales } from '../../lib/api'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../components/ui/RequestState'
import { DataTable, PageHeader, SearchInput, StatusBadge } from '../../components/ui'

export default function CustomersList() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await sales.customers.list({ search })
        setCustomers(response.data.data?.customers || [])
      } catch (e) {
        console.error('Failed to fetch customers', e)
        setError(e)
      } finally {
        setLoading(false)
      }
    }
    fetchCustomers()
  }, [search])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return
    try {
      await sales.customers.delete(id)
      setCustomers(customers.filter((c) => c.id !== id))
    } catch (e) {
      setError(e)
      alert(getApiErrorMessage(e))
    }
  }

  if (error) {
    if (isModuleDisabledError(error)) return <ModuleDisabledState moduleName="Sales" />
    if (isForbidden(error)) return <ForbiddenState />
    return <ErrorState message={getApiErrorMessage(error)} />
  }

  const columns = [
    {
      key: 'name',
      header: 'Customer',
      render: (customer: any) => (
        <Link to={`/sales/customers/${customer.id}`} className="font-medium text-gray-900 hover:text-gray-700">
          {customer.name}
        </Link>
      ),
    },
    {
      key: 'code',
      header: 'Code',
      render: (customer: any) => <span className="font-mono text-sm text-gray-500">{customer.code || '-'}</span>,
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (customer: any) => (
        <div className="flex items-center gap-2">
          {customer.email && (
            <a href={`mailto:${customer.email}`} className="p-1.5 hover:bg-gray-100 rounded-lg">
              <Mail size={14} className="text-gray-400" />
            </a>
          )}
          {customer.phone && (
            <a href={`tel:${customer.phone}`} className="p-1.5 hover:bg-gray-100 rounded-lg">
              <Phone size={14} className="text-gray-400" />
            </a>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center' as const,
      render: (customer: any) => (
        <StatusBadge
          status={customer.status ?? 'active'}
          map={{
            active: { bg: 'bg-green-50 text-green-600', label: 'Active' },
            inactive: { bg: 'bg-gray-100 text-gray-600', label: 'Inactive' },
          }}
        />
      ),
    },
  ]

  const actions = [
    { icon: 'view' as const, path: (c: any) => `/sales/customers/${c.id}` },
    { icon: 'edit' as const, path: (c: any) => `/sales/customers/${c.id}/edit` },
    { icon: 'delete' as const, onClick: (c: any) => handleDelete(c.id) },
  ]

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <PageHeader
          icon={Users}
          title="Customers"
          subtitle="Manage your customers"
          actions={
            <Link
              to="/sales/customers/new"
              className="px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              Add Customer
            </Link>
          }
        />

        <div className="bg-white rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search customers..."
          />
        </div>

        <DataTable
          columns={columns}
          data={customers}
          loading={loading}
          emptyTitle="No customers found"
          emptyDescription="Add your first customer to get started"
          emptyActionLabel="Add Customer"
          emptyActionPath="/sales/customers/new"
          actions={actions}
        />

      </div>
    </div>
  )
}
