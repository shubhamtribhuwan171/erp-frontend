import { Link } from 'react-router-dom'
import { Eye, Edit, Trash2 } from 'lucide-react'
import LoadingSpinner from './LoadingSpinner'
import EmptyState from './EmptyState'

export interface Column<T> {
  key: string
  header: string
  render?: (item: T) => React.ReactNode
  align?: 'left' | 'center' | 'right'
}

interface Action {
  icon?: 'view' | 'edit' | 'delete'
  path?: (item: any) => string
  onClick?: (item: any) => void
  label?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  emptyTitle?: string
  emptyDescription?: string
  emptyActionLabel?: string
  emptyActionPath?: string
  actions?: Action[]
  onDelete?: (id: string) => void
  keyField?: keyof T
}

export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  emptyTitle = 'No data found',
  emptyDescription,
  emptyActionLabel,
  emptyActionPath,
  actions = [],
  onDelete,
  keyField = 'id' as keyof T,
}: DataTableProps<T>) {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50/50 border-b border-gray-100">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider ${alignClasses[col.align || 'left']}`}
              >
                {col.header}
              </th>
            ))}
            {actions.length > 0 && (
              <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider text-right">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {loading ? (
            <tr>
              <td colSpan={columns.length + (actions.length > 0 ? 1 : 0)} className="px-6 py-12">
                <LoadingSpinner />
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (actions.length > 0 ? 1 : 0)}>
                <EmptyState 
                  title={emptyTitle}
                  description={emptyDescription}
                  actionLabel={emptyActionLabel}
                  actionPath={emptyActionPath}
                />
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={item[keyField]} className="hover:bg-gray-50/50 transition-colors">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-6 py-4 text-sm ${alignClasses[col.align || 'left']} ${
                      col.key === 'id' ? 'font-mono text-gray-500' : 'text-gray-600'
                    }`}
                  >
                    {col.render ? col.render(item) : item[col.key]}
                  </td>
                ))}
                {actions.length > 0 && (
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {actions.map((action, idx) => {
                        if (action.icon === 'view') {
                          return (
                            <Link
                              key={idx}
                              to={action.path ? action.path(item) : '#'}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title={action.label || 'View'}
                            >
                              <Eye size={16} className="text-gray-400" />
                            </Link>
                          )
                        }
                        if (action.icon === 'edit') {
                          return (
                            <Link
                              key={idx}
                              to={action.path ? action.path(item) : '#'}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title={action.label || 'Edit'}
                            >
                              <Edit size={16} className="text-gray-400" />
                            </Link>
                          )
                        }
                        if (action.icon === 'delete') {
                          return (
                            <button
                              key={idx}
                              onClick={() => action.onClick?.(item)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title={action.label || 'Delete'}
                            >
                              <Trash2 size={16} className="text-red-400" />
                            </button>
                          )
                        }
                        return null
                      })}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
