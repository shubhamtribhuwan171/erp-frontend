import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Receipt, Truck } from 'lucide-react'
import { purchaseReceipts } from '../../lib/purchases-receipts'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../components/ui/RequestState'
import { DataTable, PageHeader } from '../../components/ui'

export default function ReceiptsList() {
  const [receipts, setReceipts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown | null>(null)

  useEffect(() => {
    const fetchReceipts = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await purchaseReceipts.list()
        setReceipts(res.data.data?.receipts || [])
      } catch (e) { setError(e) }
      finally { setLoading(false) }
    }
    fetchReceipts()
  }, [])

  const formatDate = (date: string) => date ? new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'

  if (error) {
    if (isModuleDisabledError(error)) return <ModuleDisabledState moduleName="Purchases" />
    if (isForbidden(error)) return <ForbiddenState />
    return <ErrorState message={getApiErrorMessage(error)} />
  }

  const columns = [
    { key: 'receipt_no', header: 'Receipt #', render: (r: any) => <Link to={`/purchases/receipts/${r.id}`} className="font-mono text-sm text-gray-700 hover:text-gray-900">{r.receipt_no}</Link> },
    { key: 'po_no', header: 'PO #', render: (r: any) => r.po_no || '-' },
    { key: 'receipt_date', header: 'Date', render: (r: any) => formatDate(r.reipt_date || r.receipt_date) },
    { key: 'status', header: 'Status', render: (r: any) => <span className={`px-2 py-1 rounded-md text-xs ${r.status === 'received' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{r.status}</span> },
  ]

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <PageHeader icon={Truck} title="Goods Receipts" subtitle="Purchase receipts (GRN)" />
        <DataTable columns={columns} data={receipts} loading={loading} emptyTitle="No receipts found" />
      </div>
    </div>
  )
}
