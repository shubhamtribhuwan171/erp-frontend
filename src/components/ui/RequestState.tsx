import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from './index'

export function ModuleDisabledState({ moduleName }: { moduleName: string }) {
  return (
    <div className="bg-white border border-amber-200 rounded-xl p-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
          !
        </div>
        <div className="flex-1">
          <div className="text-lg font-semibold text-gray-900">{moduleName} module is disabled</div>
          <div className="text-sm text-gray-600 mt-1">
            This feature isn’t enabled for your company. Ask an admin to enable it in Settings.
          </div>
          <div className="mt-4 flex gap-2">
            <Link to="/settings">
              <Button variant="secondary">Go to Settings</Button>
            </Link>
            <Link to="/">
              <Button variant="ghost">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ForbiddenState({ title, message }: { title?: string; message?: string }) {
  return (
    <div className="bg-white border border-red-200 rounded-xl p-6">
      <div className="text-lg font-semibold text-gray-900">{title || 'Access denied'}</div>
      <div className="text-sm text-gray-600 mt-1">
        {message || "You don't have permission to view this."}
      </div>
    </div>
  )
}

export function ErrorState({ title, message, action }: { title?: string; message: string; action?: ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="text-lg font-semibold text-gray-900">{title || 'Something went wrong'}</div>
      <div className="text-sm text-gray-600 mt-1">{message}</div>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
