import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Truck, Package, FileText, User, Calendar, DollarSign } from 'lucide-react'
import { purchaseReceipts } from '../../lib/purchases-receipts'
import { Card, PageHeader, StatusBadge, DataTable } from '../../components/ui'

function formatCurrency(minor?: number) {
  if (!minor) return '-'
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(minor / 100)
}

function formatDate(date?: string) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function ReceiptDetails() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [receipt, setReceipt] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const run = async () => {
      if (!id) return
      setLoading(true)
      setError('')
      try {
        const res = await purchaseReceipts.get(id)
        setReceipt(res.data.data)
      } catch (e: any) {
        setError(e?.message || 'Failed to load receipt')
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

  if (error || !receipt) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] p-6">
        <div className="max-w-5xl mx-auto">
          <Card><p className="text-center text-gray-400">{error || 'Receipt not found'}</p></Card>
        </div>
      </div>
    )
  }

  const { items = [] } = receipt

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <PageHeader
          backPath="/purchases/receipts"
          title={`GRN ${receipt.receipt_no}`}
          subtitle="Goods Receipt Note Details"
        />

        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center">
                <Truck size={28} className="text-gray-300" />
              </div>
              <div>
                <div className="font-mono text-lg text-gray-700">{receipt.receipt_no}</div>
                <StatusBadge status={receipt.status} />
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1"><Package size={14} /> PO Number</div>
              <div className="font-medium">{receipt.po_no || '-'}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1"><User size={14} /> Vendor</div>
              <div className="font-medium">{receipt.vendor?.name || '-'}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1"><Calendar size={14} /> Receipt Date</div>
              <div className="font-medium">{formatDate(receipt.receipt_date)}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1"><Calendar size={14} /> Expected</div>
              <div className="font-medium">{formatDate(receipt.expected_date)}</div>
            </div>
          </div>
        </Card>

        {items.length > 0 && (
          <Card padding="none">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold">Received Items</h3>
            </div>
            <DataTable
              columns={[
                { key: 'item', header: 'Item', render: (i: any) => i.item?.name || '-' },
                { key: 'ordered_qty', header: 'Ordered', align: 'right' as const },
                { key: 'received_qty', header: 'Received', align: 'right' as const },
                { key: 'accepted_qty', header: 'Accepted', align: 'right' as const },
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
