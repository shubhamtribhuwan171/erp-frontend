import { Link } from 'react-router-dom'
import { LucideIcon, ArrowLeft } from 'lucide-react'

interface PageHeaderProps {
  icon?: LucideIcon
  title: string
  subtitle?: string
  backPath?: string
  actions?: React.ReactNode
}

export default function PageHeader({ icon: Icon, title, subtitle, backPath, actions }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {backPath && (
          <Link 
            to={backPath} 
            className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl transition-all duration-200"
          >
            <ArrowLeft size={20} className="text-gray-400" />
          </Link>
        )}
        {!backPath && Icon && (
          <div className="w-12 h-12 bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center justify-center">
            <Icon size={24} className="text-gray-300" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
