import { useEffect, useState } from 'react'
import { accounting } from '../../lib/api'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../components/ui/RequestState'

export default function ReportsPage() {
  const [trialBalance, setTrialBalance] = useState<any[]>([])
  const [pnl, setPnl] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown | null>(null)
  const [reportType, setReportType] = useState<'trial-balance' | 'pnl'>('trial-balance')

  useEffect(() => {
    fetchReport()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportType])

  const fetchReport = async () => {
    setLoading(true)
    setError(null)
    try {
      if (reportType === 'trial-balance') {
        const res = await accounting.reports.trialBalance()
        setTrialBalance(res.data.data?.accounts || [])
      } else if (reportType === 'pnl') {
        const res = await accounting.reports.pnl()
        setPnl(res.data.data || {})
      }
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(
      (amount || 0) / 100,
    )

  if (error) {
    if (isModuleDisabledError(error)) return <ModuleDisabledState moduleName="Accounting" />
    if (isForbidden(error)) return <ForbiddenState />
    return <ErrorState message={getApiErrorMessage(error)} />
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Reports</h1>
        <p className="text-[var(--text-secondary)]">Financial reports</p>
      </div>

      <div className="flex gap-2">
        {(['trial-balance', 'pnl'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setReportType(type)}
            className={`px-4 py-2 rounded-lg ${reportType === type ? 'bg-[var(--primary)] text-white' : 'bg-white border'}`}
          >
            {type === 'trial-balance' ? 'Trial Balance' : 'Profit & Loss'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg border p-6">
        {loading ? (
          <div className="text-[var(--text-secondary)]">Loading…</div>
        ) : reportType === 'trial-balance' ? (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">Account</th>
                <th className="text-right p-3">Debit</th>
                <th className="text-right p-3">Credit</th>
              </tr>
            </thead>
            <tbody>
              {trialBalance.map((acc: any, i: number) => (
                <tr key={i} className="border-t">
                  <td className="p-3">{acc.name}</td>
                  <td className="p-3 text-right">{acc.debit ? formatCurrency(acc.debit) : '-'}</td>
                  <td className="p-3 text-right">{acc.credit ? formatCurrency(acc.credit) : '-'}</td>
                </tr>
              ))}
              {trialBalance.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-[var(--secondary)]">
                    No data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600">Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(pnl.totalRevenue || 0)}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-600">Expenses</p>
                <p className="text-2xl font-bold">{formatCurrency(pnl.totalExpenses || 0)}</p>
              </div>
              <div className={`p-4 rounded-lg ${(pnl.netProfit || 0) >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <p className="text-sm">Net Profit</p>
                <p className="text-2xl font-bold">{formatCurrency(pnl.netProfit || 0)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
