interface StatusBadgeProps {
  status: string
  map?: Record<string, { bg: string; label?: string }>
}

const defaultMap: Record<string, { bg: string; label?: string }> = {
  draft: { bg: 'bg-gray-100 text-gray-700', label: 'Draft' },
  confirmed: { bg: 'bg-blue-100 text-blue-700', label: 'Confirmed' },
  processing: { bg: 'bg-yellow-100 text-yellow-700', label: 'Processing' },
  shipped: { bg: 'bg-purple-100 text-purple-700', label: 'Shipped' },
  delivered: { bg: 'bg-green-100 text-green-700', label: 'Delivered' },
  invoiced: { bg: 'bg-green-100 text-green-700', label: 'Invoiced' },
  cancelled: { bg: 'bg-red-100 text-red-700', label: 'Cancelled' },
  quotation: { bg: 'bg-orange-100 text-orange-700', label: 'Quotation' },
  active: { bg: 'bg-green-100 text-green-700', label: 'Active' },
  inactive: { bg: 'bg-gray-100 text-gray-700', label: 'Inactive' },
  // HR
  present: { bg: 'bg-green-50 text-green-600 border border-green-100', label: 'Present' },
  absent: { bg: 'bg-red-50 text-red-600 border border-red-100', label: 'Absent' },
  late: { bg: 'bg-yellow-50 text-yellow-600 border border-yellow-100', label: 'Late' },
  leave: { bg: 'bg-blue-50 text-blue-600 border border-blue-100', label: 'Leave' },
  // Purchases
  sent: { bg: 'bg-blue-100 text-blue-700', label: 'Sent' },
  approved: { bg: 'bg-blue-100 text-blue-700', label: 'Approved' },
  partial: { bg: 'bg-yellow-100 text-yellow-700', label: 'Partial' },
  part_received: { bg: 'bg-yellow-100 text-yellow-700', label: 'Part Received' },
  received: { bg: 'bg-green-100 text-green-700', label: 'Received' },
  // Accounting
  posted: { bg: 'bg-green-100 text-green-700', label: 'Posted' },
  void: { bg: 'bg-red-100 text-red-700', label: 'Void' },
}

export default function StatusBadge({ status, map }: StatusBadgeProps) {
  const statusMap = map || defaultMap
  const config = statusMap[status?.toLowerCase()] || { bg: 'bg-gray-100 text-gray-700', label: status }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium capitalize ${config.bg}`}>
      {config.label || status}
    </span>
  )
}
