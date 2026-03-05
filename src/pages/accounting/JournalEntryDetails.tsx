import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, FileText, CheckCircle, XCircle, Clock } from 'lucide-react'
import api from '../../lib/api'

function formatCurrency(amount?: number | null) {
  if (amount === null || amount === undefined) return '-'
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)
}

function formatDate(date?: string | null) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string, icon: any }> = {
    draft: { bg: 'bg-gray-100 text-gray-700', icon: Clock },
    posted: { bg: 'bg-green-100 text-green-700', icon: CheckCircle },
    void: { bg: 'bg-red-100 text-red-700', icon: XCircle },
  }
  const cfg = config[status] || config.draft
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs capitalize ${cfg.bg}`}>
      <Icon size={12} /> {status}
    </span>
  )
}

export default function JournalEntryDetails() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [entry, setEntry] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const run = async () => {
      if (!id) return
      setLoading(true)
      setError('')
      try {
        const res = await api.get(`/accounting/journal/${id}`)
        setEntry(res.data.data)
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load entry')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [id])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Link to="/accounting/journal" className="p-2 hover:bg-gray-100 rounded">
            <ArrowLeft size={18} className="text-[var(--secondary)]" />
          </Link>
          <h1 className="text-2xl font-semibold">Journal Entry</h1>
        </div>
        <div className="bg-white rounded-lg border border-[var(--border)] p-8 text-center text-[var(--secondary)]">
          Loading...
        </div>
      </div>
    )
  }

  if (error || !entry) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Link to="/accounting/journal" className="p-2 hover:bg-gray-100 rounded">
            <ArrowLeft size={18} className="text-[var(--secondary)]" />
          </Link>
          <h1 className="text-2xl font-semibold">Journal Entry</h1>
        </div>
        <div className="bg-white rounded-lg border border-[var(--border)] p-8 text-center text-red-600">
          {error || 'Entry not found'}
        </div>
      </div>
    )
  }

  const { lines = [], totals = {} } = entry

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/accounting/journal" className="p-2 hover:bg-gray-100 rounded">
            <ArrowLeft size={18} className="text-[var(--secondary)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Journal Entry</h1>
            <p className="text-[var(--text-secondary)]">Entry details</p>
          </div>
        </div>
        <StatusBadge status={entry.status || 'draft'} />
      </div>

      {/* Entry Info */}
      <div className="bg-white rounded-lg border border-[var(--border)] p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-[var(--text-secondary)]">Entry #</div>
            <div className="font-mono font-semibold">{entry.entry_number}</div>
          </div>
          <div>
            <div className="text-[var(--text-secondary)]">Date</div>
            <div className="font-medium">{formatDate(entry.date)}</div>
          </div>
          <div>
            <div className="text-[var(--text-secondary)]">Reference</div>
            <div className="font-medium">{entry.reference || '-'}</div>
          </div>
          <div>
            <div className="text-[var(--text-secondary)]">Status</div>
            <StatusBadge status={entry.status || 'draft'} />
          </div>
        </div>

        {entry.description && (
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <div className="text-[var(--text-secondary)] text-sm">Description</div>
            <div className="mt-1">{entry.description}</div>
          </div>
        )}

        {/* Balance check */}
        {totals.isBalanced !== undefined && (
          <div className={`mt-4 px-3 py-2 rounded text-sm ${
            totals.isBalanced ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {totals.isBalanced ? '✓ Entry is balanced' : `✗ Entry is unbalanced (diff: ${formatCurrency(totals.totalDebit - totals.totalCredit)})`}
          </div>
        )}
      </div>

      {/* Lines */}
      <div className="bg-white rounded-lg border border-[var(--border)] overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-[var(--border)]">
          <FileText size={18} className="text-[var(--secondary)]" />
          <h2 className="font-semibold">Journal Lines</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-[var(--text-secondary)]">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Account</th>
              <th className="text-left px-4 py-2 font-medium">Description</th>
              <th className="text-right px-4 py-2 font-medium">Debit</th>
              <th className="text-right px-4 py-2 font-medium">Credit</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line: any, idx: number) => (
              <tr key={line.id || idx} className="border-t border-[var(--border)] hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium">{line.account?.name || '-'}</div>
                  <div className="text-xs text-[var(--text-secondary)] font-mono">{line.account?.code || '-'}</div>
                </td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">{line.description || '-'}</td>
                <td className="px-4 py-3 text-right text-red-600">{line.debit ? formatCurrency(line.debit) : '-'}</td>
                <td className="px-4 py-3 text-right text-green-600">{line.credit ? formatCurrency(line.credit) : '-'}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 border-t border-[var(--border)]">
            <tr>
              <td colSpan={2} className="px-4 py-2 text-right font-medium">Totals</td>
              <td className="px-4 py-2 text-right font-semibold">{formatCurrency(totals.totalDebit)}</td>
              <td className="px-4 py-2 text-right font-semibold">{formatCurrency(totals.totalCredit)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
