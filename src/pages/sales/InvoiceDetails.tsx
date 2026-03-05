import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Receipt, FileText, User, Calendar, DollarSign, CreditCard } from 'lucide-react'
import { salesDocs } from '../../lib/sales-docs'
import { Card, PageHeader, StatusBadge, DataTable } from '../../components/ui'

function formatCurrency(minor?: number) {
  if (!minor) return '-'
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(minor / 100)
}

function formatDate(date?: string) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function InvoiceDetails() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [invoice, setInvoice] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const run = async () => {
      if (!id) return
      setLoading(true)
      setError('')
      try {
        const res = await salesDocs.invoices.get(id)
        setInvoice(res.data.data)
      } catch (e: any) {
        setError(e?.message || 'Failed to load invoice')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] p-6">
        <div className="max-w-5xl mx-auto">
          <Card><p className="text-center text-gray-400">{error || 'Invoice not found'}</p></Card>
        </div>
      </div>
    )
  }

  const { items = [] } = invoice
  const statusMap: Record<string, { bg: string, label: string }> = {
    draft: { bg: 'bg-gray-100 text-gray-700', label: 'Draft' },
    issued: { bg: 'bg-blue-100 text-blue-700', label: 'Issued' },
    partially_paid: { bg: 'bg-yellow-100 text-yellow-700', label: 'Partially Paid' },
    paid: { bg: 'bg-green-100 text-green-700', label: 'Paid' },
    overdue: { bg: 'bg-red-100 text-red-700', label: 'Overdue' },
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <PageHeader
          backPath="/sales/invoices"
          title={`Invoice ${invoice.invoice_no}`}
          subtitle="Invoice Details"
        />

        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center">
                <Receipt size={28} className="text-gray-300" />
              </div>
              <div>
                <div className="font-mono text-lg text-gray-700">{invoice.invoice_no}</div>
                <StatusBadge status={invoice.status} map={statusMap} />
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-semibold">{formatCurrency(invoice.total_minor)}</div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1"><User size={14} /> Customer</div>
              <div className="font-medium">{invoice.customer?.name || '-'}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1"><Calendar size={14} /> Invoice Date</div>
              <div className="font-medium">{formatDate(invoice.invoice_date)}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1"><Calendar size={14} /> Due Date</div>
              <div className="font-medium">{formatDate(invoice.due_date)}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1"><DollarSign size={14} /> Balance</div>
              <div className="font-medium">{formatCurrency(invoice.balance_minor)}</div>
            </div>
          </div>
        </Card>

        {items.length > 0 && (
          <Card padding="none">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold">Line Items</h3>
            </div>
            <DataTable
              columns={[
                { key: 'description', header: 'Description', render: (i: any) => i.description || i.item?.name || '-' },
                { key: 'qty', header: 'Qty', align: 'right' as const },
                { key: 'rate_minor', header: 'Rate', align: 'right' as const, render: (i: any) => formatCurrency(i.rate_minor) },
                { key: 'amount_minor', header: 'Amount', align: 'right' as const, render: (i: any) => formatCurrency(i.amount_minor) },
              ]}
              data={items}
              loading={false}
            />
          </Card>
        )}

      </div>
    </div>
  )
}
