// CSV Export utility

type DataRecord = Record<string, any>

// Convert array of objects to CSV string
export function toCSV<T extends DataRecord>(data: T[], columns?: { key: keyof T; header: string }[]): string {
  if (!data.length) return ''
  
  // If no columns specified, use all keys from first record
  const cols = columns || Object.keys(data[0]).map(key => ({ key, header: key }))
  
  // Header row
  const headerRow = cols.map(c => c.header).join(',')
  
  // Data rows
  const dataRows = data.map(row => 
    cols.map(col => {
      const value = row[col.key]
      
      // Handle null/undefined
      if (value === null || value === undefined) return ''
      
      // Handle arrays/objects - JSON stringify
      if (typeof value === 'object') {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`
      }
      
      // Handle strings - escape quotes and wrap in quotes
      const strValue = String(value)
      if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
        return `"${strValue.replace(/"/g, '""')}"`
      }
      
      return strValue
    }).join(',')
  )
  
  return [headerRow, ...dataRows].join('\n')
}

// Download CSV as file
export function downloadCSV<T extends DataRecord>(
  data: T[], 
  filename: string,
  columns?: { key: keyof T; header: string }[]
): void {
  const csv = toCSV(data, columns)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Format currency for display
export function formatCurrency(amount: number | null | undefined, currency = 'INR'): string {
  if (amount === null || amount === undefined) return '-'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
  }).format(amount / 100)
}

// Format date for display
export function formatDate(date: string | null | undefined): string {
  if (!date) return '-'
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}
