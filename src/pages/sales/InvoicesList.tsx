import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Receipt } from 'lucide-react'
import { salesDocs } from '../../lib/sales-docs'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../components/ui/RequestState'
import { DataTable, PageHeader, SearchInput, StatusBadge } from '../../components/ui'

export default function InvoicesList() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown | null>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true)
      setError(null)
      try {
        const params: Record<string, string> = {}
        if (statusFilter) params.status = statusFilter
        if (search) params.search = search

        const response = await salesDocs.invoices.list(params)
        setInvoices(response.data.data?.invoices || [])
      } catch (e) {
        console.error('Failed to fetch invoices', e)
        setError(e)
      } finally {
        setLoading(false)
      }
    }
    fetchInvoices()
  }, [statusFilter, search])

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format((amount || 0) / 100)

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  if (error) {
    if (isModuleDisabledError(error)) return <ModuleDisabledState moduleName="Sales" />
    if (isForbidden(error)) return <ForbiddenState />
    return <ErrorState message={getApiErrorMessage(error)} />
  }

  const columns = [
    {
      key: 'invoice_no',
      header: 'Invoice #',
      render: (inv: any) => (
        <Link to={`/sales/invoices/${inv.id}`} className="font-mono text-sm text-gray-700 hover:text-gray-900">
          {inv.invoice_no}
        </Link>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (inv: any) => inv.customer?.name || 'N/A',
    },
    {
      key: 'invoice_date',
      header: 'Date',
      render: (inv: any) => formatDate(inv.invoice_date),
    },
    {
      key: 'due_date',
      header: 'Due Date',
      render: (inv: any) => formatDate(inv.due_date),
    },
    {
      key: 'total_minor',
      header: 'Amount',
      align: 'right' as const,
      render: (inv: any) => formatCurrency(inv.total_minor),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center' as const,
      render: (inv: any) => (
        <StatusBadge
          status={inv.status}
          map={{
            draft: { bg: 'bg-gray-100 text-gray-700', label: 'Draft' },
            issued: { bg: 'bg-blue-100 text-blue-700', label: 'Issued' },
            partially_paid: { bg: 'bg-yellow-100 text-yellow-700', label: 'Partially Paid' },
            paid: { bg: 'bg-green-100 text-green-700', label: 'Paid' },
            overdue: { bg: 'bg-red-100 text-red-700', label: 'Overdue' },
            cancelled: { bg: 'bg-red-100 text-red-700', label: 'Cancelled' },
          }}
        />
      ),
    },
  ]

  const actions = [
    { icon: 'view' as const, path: (inv: any) => `/sales/invoices/${inv.id}` },
  ]

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <PageHeader
          icon={Receipt}
          title="Invoices"
          subtitle="Manage your invoices"
        />

        <div className="bg-white rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <SearchInput value={search} onChange={setSearch} placeholder="Search invoices..." />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-gray-50 pl-4 pr-11 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-gray-200 focus:bg-white cursor-pointer"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="issued">Issued</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={invoices}
          loading={loading}
          emptyTitle="No invoices found"
          actions={actions}
        />

      </div>
    </div>
  )
}
