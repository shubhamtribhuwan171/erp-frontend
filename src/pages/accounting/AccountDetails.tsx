import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Edit, TrendingUp, TrendingDown, FileText, Calculator } from 'lucide-react'
import { accounting } from '../../lib/api'

function formatCurrency(amount?: number | null) {
  if (amount === null || amount === undefined) return '-'
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)
}

function formatDate(date?: string | null) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AccountDetails() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [account, setAccount] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const run = async () => {
      if (!id) return
      setLoading(true)
      setError('')
      try {
        const res = await accounting.accounts.get(id)
        setAccount(res.data.data)
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load account')
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
          <Link to="/accounting/accounts" className="p-2 hover:bg-gray-100 rounded">
            <ArrowLeft size={18} className="text-[var(--secondary)]" />
          </Link>
          <h1 className="text-2xl font-semibold">Account</h1>
        </div>
        <div className="bg-white rounded-lg border border-[var(--border)] p-8 text-center text-[var(--secondary)]">
          Loading...
        </div>
      </div>
    )
  }

  if (error || !account) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Link to="/accounting/accounts" className="p-2 hover:bg-gray-100 rounded">
            <ArrowLeft size={18} className="text-[var(--secondary)]" />
          </Link>
          <h1 className="text-2xl font-semibold">Account</h1>
        </div>
        <div className="bg-white rounded-lg border border-[var(--border)] p-8 text-center text-red-600">
          {error || 'Account not found'}
        </div>
      </div>
    )
  }

  const { ledgerLines = [], stats = {} } = account

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/accounting/accounts" className="p-2 hover:bg-gray-100 rounded">
            <ArrowLeft size={18} className="text-[var(--secondary)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Account</h1>
            <p className="text-[var(--text-secondary)]">Account details</p>
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-lg border border-[var(--border)] p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-[var(--text-secondary)]">Name</div>
            <div className="text-xl font-semibold">{account.name}</div>
            <div className="text-sm font-mono text-[var(--text-secondary)]">{account.code}</div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm ${
            account.type === 'asset' ? 'bg-blue-100 text-blue-700' :
            account.type === 'liability' ? 'bg-red-100 text-red-700' :
            account.type === 'income' ? 'bg-green-100 text-green-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            {account.type}
          </span>
        </div>

        {account.subtype && (
          <div className="mt-2 text-sm text-[var(--text-secondary)]">
            Subtype: {account.subtype}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg border border-[var(--border)] p-3">
          <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
            <TrendingUp size={14} className="text-red-500" /> Debit
          </div>
          <div className="text-lg font-semibold mt-1">{formatCurrency(stats.totalDebit)}</div>
        </div>
        <div className="bg-white rounded-lg border border-[var(--border)] p-3">
          <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
            <TrendingDown size={14} className="text-green-500" /> Credit
          </div>
          <div className="text-lg font-semibold mt-1">{formatCurrency(stats.totalCredit)}</div>
        </div>
        <div className="bg-white rounded-lg border border-[var(--border)] p-3">
          <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
            <Calculator size={14} /> Balance
          </div>
          <div className="text-lg font-semibold mt-1">{formatCurrency(stats.balance)}</div>
        </div>
        <div className="bg-white rounded-lg border border-[var(--border)] p-3">
          <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
            <FileText size={14} /> Entries
          </div>
          <div className="text-lg font-semibold mt-1">{stats.entryCount}</div>
        </div>
      </div>

      {/* Ledger Entries */}
      <div className="bg-white rounded-lg border border-[var(--border)] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-[var(--secondary)]" />
            <h2 className="font-semibold">Ledger Entries</h2>
          </div>
          <Link to="/accounting/journal" className="text-sm text-[var(--primary)] hover:underline">
            View all
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-[var(--text-secondary)]">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Date</th>
              <th className="text-left px-4 py-2 font-medium">Entry #</th>
              <th className="text-left px-4 py-2 font-medium">Description</th>
              <th className="text-right px-4 py-2 font-medium">Debit</th>
              <th className="text-right px-4 py-2 font-medium">Credit</th>
            </tr>
          </thead>
          <tbody>
            {ledgerLines.slice(0, 20).map((line: any) => (
              <tr key={line.id} className="border-t border-[var(--border)] hover:bg-gray-50">
                <td className="px-4 py-2">{formatDate(line.entry?.date)}</td>
                <td className="px-4 py-2 font-mono">{line.entry?.entry_number || '-'}</td>
                <td className="px-4 py-2">{line.description || line.entry?.description || '-'}</td>
                <td className="px-4 py-2 text-right text-red-600">{line.debit ? formatCurrency(line.debit) : '-'}</td>
                <td className="px-4 py-2 text-right text-green-600">{line.credit ? formatCurrency(line.credit) : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {ledgerLines.length === 0 && (
          <div className="p-8 text-center text-[var(--text-secondary)]">
            No ledger entries yet
          </div>
        )}
      </div>
    </div>
  )
}
