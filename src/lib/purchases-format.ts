export const formatCurrencyINR = (amountMinor?: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(((amountMinor || 0) as number) / 100)

export const formatDateIN = (date?: string) => {
  if (!date) return '—'
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
