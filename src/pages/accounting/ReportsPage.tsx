import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { accounting } from '../../lib/api';

export default function ReportsPage() {
  const [trialBalance, setTrialBalance] = useState<any[]>([]);
  const [pnl, setPnl] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('trial-balance');

  useEffect(() => { fetchReport(); }, [reportType]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      if (reportType === 'trial-balance') {
        const res = await accounting.reports.trialBalance();
        setTrialBalance(res.data.data?.accounts || []);
      } else if (reportType === 'pnl') {
        const res = await accounting.reports.pnl();
        setPnl(res.data.data || {});
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount / 100);

  return (
    <div className="space-y-4">
      <div><h1 className="text-2xl font-semibold">Reports</h1><p className="text-[--text-secondary]">Financial reports</p></div>

      <div className="flex gap-2">
        {['trial-balance', 'pnl'].map(type => (
          <button key={type} onClick={() => setReportType(type)} className={`px-4 py-2 rounded-lg ${reportType === type ? 'bg-[--primary] text-white' : 'bg-white border'}`}>
            {type === 'trial-balance' ? 'Trial Balance' : 'Profit & Loss'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg border p-6">
        {loading ? <div>Loading...</div> : (
          reportType === 'trial-balance' ? (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr><th className="text-left p-3">Account</th><th className="text-right p-3">Debit</th><th className="text-right p-3">Credit</th></tr>
              </thead>
              <tbody>
                {trialBalance.map((acc: any, i: number) => (
                  <tr key={i} className="border-t">
                    <td className="p-3">{acc.name}</td>
                    <td className="p-3 text-right">{acc.debit ? formatCurrency(acc.debit) : '-'}</td>
                    <td className="p-3 text-right">{acc.credit ? formatCurrency(acc.credit) : '-'}</td>
                  </tr>
                ))}
                {trialBalance.length === 0 && <tr><td colSpan={3} className="p-8 text-center text-[--secondary]">No data</td></tr>}
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
          )
        )}
      </div>
    </div>
  );
}
