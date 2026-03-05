import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Edit, Trash2, Eye, Phone, Mail, Users } from 'lucide-react'
import { sales } from '../../lib/api'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../components/ui/RequestState'

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

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center justify-center">
              <Users size={24} className="text-gray-300" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Customers</h1>
              <p className="text-sm text-gray-400">Manage your customers</p>
            </div>
          </div>
          <Link
            to="/sales/customers/new"
            className="px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Add Customer
          </Link>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-gray-200 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Customer</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Code</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Contact</th>
                <th className="text-center px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-300">
                      <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin" />
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Users size={40} className="mx-auto mb-3 text-gray-200" />
                    <p className="text-gray-400">No customers found.</p>
                    <Link to="/sales/customers/new" className="text-sm text-gray-900 hover:underline mt-2 inline-block">
                      Add your first customer
                    </Link>
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <Link to={`/sales/customers/${customer.id}`} className="font-medium text-gray-900 hover:text-gray-700">
                        {customer.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400 font-mono">{customer.code || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {customer.email && (
                          <a href={`mailto:${customer.email}`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Mail size={14} className="text-gray-400" />
                          </a>
                        )}
                        {customer.phone && (
                          <a href={`tel:${customer.phone}`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Phone size={14} className="text-gray-400" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium ${
                        String(customer.status ?? 'active').toLowerCase() === 'active' 
                          ? 'bg-green-50 text-green-600' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {customer.status ?? 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/sales/customers/${customer.id}`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="View">
                          <Eye size={16} className="text-gray-400" />
                        </Link>
                        <Link to={`/sales/customers/${customer.id}/edit`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                          <Edit size={16} className="text-gray-400" />
                        </Link>
                        <button onClick={() => handleDelete(customer.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 size={16} className="text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}
