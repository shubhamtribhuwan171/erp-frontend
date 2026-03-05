import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  actionPath?: string
  onAction?: () => void
}

export default function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  actionPath,
  onAction 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {Icon && (
        <Icon size={40} className="text-gray-200 mb-3" />
      )}
      <p className="text-gray-400 text-center">{title}</p>
      {description && (
        <p className="text-gray-300 text-sm mt-1 text-center">{description}</p>
      )}
      {actionLabel && (
        <div className="mt-4">
          {actionPath ? (
            <Link 
              to={actionPath} 
              className="text-sm text-gray-900 hover:underline"
            >
              {actionLabel}
            </Link>
          ) : onAction ? (
            <button 
              onClick={onAction}
              className="text-sm text-gray-900 hover:underline"
            >
              {actionLabel}
            </button>
          ) : null}
        </div>
      )}
    </div>
  )
}
