import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText } from 'lucide-react'
import { purchaseVendorInvoices } from '../../lib/purchases-vendor-invoices'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../components/ui/RequestState'
import { DataTable, PageHeader } from '../../components/ui'

export default function VendorInvoicesList() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown | null>(null)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const res = await purchaseVendorInvoices.list()
        setInvoices(res.data.data || [])
      } catch (e) { setError(e) }
      finally { setLoading(false) }
    }
    fetch()
  }, [])

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format((amount || 0) / 100)
  const formatDate = (date: string) => date ? new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'

  if (error) {
    if (isModuleDisabledError(error)) return <ModuleDisabledState moduleName="Purchases" />
    if (isForbidden(error)) return <ForbiddenState />
    return <ErrorState message={getApiErrorMessage(error)} />
  }

  const columns = [
    { key: 'invoice_no', header: 'Invoice #', render: (i: any) => <Link to={`/purchases/vendor-invoices/${i.id}`} className="font-mono text-sm text-gray-700 hover:text-gray-900">{i.invoice_no}</Link> },
    { key: 'vendor', header: 'Vendor', render: (i: any) => i.vendor?.name || '-' },
    { key: 'invoice_date', header: 'Date', render: (i: any) => formatDate(i.invoice_date) },
    { key: 'amount', header: 'Amount', align: 'right' as const, render: (i: any) => formatCurrency(i.amount_minor) },
    { key: 'status', header: 'Status', render: (i: any) => <span className={`px-2 py-1 rounded-md text-xs ${i.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{i.status}</span> },
  ]

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <PageHeader icon={FileText} title="Vendor Invoices" subtitle="Purchase vendor invoices" />
        <DataTable columns={columns} data={invoices} loading={loading} emptyTitle="No invoices found" />
      </div>
    </div>
  )
}
