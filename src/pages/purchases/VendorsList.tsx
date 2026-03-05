import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Edit, Trash2, Eye, Phone, Mail, Truck } from 'lucide-react'
import { purchases } from '../../lib/api'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../components/ui/RequestState'

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

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center justify-center">
              <Truck size={24} className="text-gray-300" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Vendors</h1>
              <p className="text-sm text-gray-400">Manage your vendors</p>
            </div>
          </div>
          <Link
            to="/purchases/vendors/new"
            className="px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Add Vendor
          </Link>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              type="text"
              placeholder="Search vendors..."
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
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Vendor</th>
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
              ) : vendors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Truck size={40} className="mx-auto mb-3 text-gray-200" />
                    <p className="text-gray-400">No vendors found.</p>
                    <Link to="/purchases/vendors/new" className="text-sm text-gray-900 hover:underline mt-2 inline-block">
                      Add your first vendor
                    </Link>
                  </td>
                </tr>
              ) : (
                vendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <Link to={`/purchases/vendors/${vendor.id}`} className="font-medium text-gray-900 hover:text-gray-700">
                        {vendor.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400 font-mono">{vendor.code || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {vendor.email && (
                          <a href={`mailto:${vendor.email}`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Mail size={14} className="text-gray-400" />
                          </a>
                        )}
                        {vendor.phone && (
                          <a href={`tel:${vendor.phone}`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Phone size={14} className="text-gray-400" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium ${
                        String(vendor.status ?? 'active').toLowerCase() === 'active' 
                          ? 'bg-green-50 text-green-600' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {vendor.status ?? 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/purchases/vendors/${vendor.id}`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="View">
                          <Eye size={16} className="text-gray-400" />
                        </Link>
                        <Link to={`/purchases/vendors/${vendor.id}/edit`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                          <Edit size={16} className="text-gray-400" />
                        </Link>
                        <button onClick={() => handleDelete(vendor.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
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
