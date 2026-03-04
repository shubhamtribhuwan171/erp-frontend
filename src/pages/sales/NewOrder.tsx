import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus } from 'lucide-react'

export default function NewOrder() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/sales/orders" className="p-2 hover:bg-gray-100 rounded" title="Back">
            <ArrowLeft size={18} className="text-[var(--secondary)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">New Sales Order</h1>
            <p className="text-[var(--text-secondary)]">Placeholder create flow</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[var(--border)] p-4">
        <p className="text-sm text-[var(--text-secondary)]">
          We’ll build the full order creation form next. This page exists so the “New Order” links don’t 404.
        </p>

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            disabled={submitting}
            onClick={() => {
              setSubmitting(true)
              setTimeout(() => {
                setSubmitting(false)
                navigate('/sales/orders')
              }, 400)
            }}
            className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 disabled:opacity-50"
          >
            <Plus size={18} />
            Create (placeholder)
          </button>
          <Link to="/sales/orders" className="px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-gray-50">
            Cancel
          </Link>
        </div>
      </div>
    </div>
  )
}
