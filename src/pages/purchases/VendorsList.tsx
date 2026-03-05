import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Edit, Trash2, Eye, Phone, Mail, Truck } from 'lucide-react'
import { purchases } from '../../lib/api'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../components/ui/RequestState'
import { DataTable, PageHeader, SearchInput, StatusBadge } from '../../components/ui'

export default function VendorsList() {
  const [vendors, setVendors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchVendors = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await purchases.vendors.list({ search })
        setVendors(response.data.data?.vendors || [])
      } catch (e) {
        console.error('Failed to fetch vendors', e)
        setError(e)
      } finally {
        setLoading(false)
      }
    }
    fetchVendors()
  }, [search])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this vendor?')) return
    try {
      await purchases.vendors.delete(id)
      setVendors(vendors.filter((v) => v.id !== id))
    } catch (e) {
      setError(e)
      alert(getApiErrorMessage(e))
    }
  }

  if (error) {
    if (isModuleDisabledError(error)) return <ModuleDisabledState moduleName="Purchases" />
    if (isForbidden(error)) return <ForbiddenState />
    return <ErrorState message={getApiErrorMessage(error)} />
  }

  const columns = [
    {
      key: 'name',
      header: 'Vendor',
      render: (vendor: any) => (
        <Link to={`/purchases/vendors/${vendor.id}`} className="font-medium text-gray-900 hover:text-gray-700">
          {vendor.name}
        </Link>
      ),
    },
    {
      key: 'code',
      header: 'Code',
      render: (vendor: any) => <span className="font-mono text-sm text-gray-500">{vendor.code || '-'}</span>,
    },
    {
      key: 'email',
      header: 'Email',
      render: (vendor: any) => vendor.email || '-',
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (vendor: any) => vendor.phone || '-',
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center' as const,
      render: (vendor: any) => (
        <StatusBadge
          status={vendor.status ?? 'active'}
          map={{
            active: { bg: 'bg-green-50 text-green-600', label: 'Active' },
            inactive: { bg: 'bg-gray-100 text-gray-600', label: 'Inactive' },
          }}
        />
      ),
    },
  ]

  const actions = [
    { icon: 'view' as const, path: (v: any) => `/purchases/vendors/${v.id}` },
    { icon: 'edit' as const, path: (v: any) => `/purchases/vendors/${v.id}/edit` },
    { icon: 'delete' as const, onClick: (v: any) => handleDelete(v.id) },
  ]

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <PageHeader
          icon={Truck}
          title="Vendors"
          subtitle="Manage your vendors"
          actions={
            <Link
              to="/purchases/vendors/new"
              className="px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              Add Vendor
            </Link>
          }
        />

        <div className="bg-white rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search vendors..."
          />
        </div>

        <DataTable
          columns={columns}
          data={vendors}
          loading={loading}
          emptyTitle="No vendors found"
          emptyDescription="Add your first vendor to get started"
          emptyActionLabel="Add Vendor"
          emptyActionPath="/purchases/vendors/new"
          actions={actions}
        />

      </div>
    </div>
  )
}
