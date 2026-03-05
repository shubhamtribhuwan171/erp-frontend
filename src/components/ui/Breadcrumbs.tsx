import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  path?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-1 text-sm">
      <Link 
        to="/" 
        className="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <Home size={16} />
      </Link>
      
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-1">
          <ChevronRight size={14} className="text-gray-300" />
          {item.path ? (
            <Link 
              to={item.path}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}
