import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { auth, settings } from './api'

export type ModuleKey =
  | 'inventory'
  | 'sales'
  | 'purchases'
  | 'accounting'
  | 'crm'
  | 'hr'
  | 'manufacturing'
  | 'logistics'

export type Company = {
  id: string
  name: string
  legal_name?: string
  industry_type?: string
  profile_version?: string
  features?: any
}

export type SessionUser = {
  id: string
  email: string
  role: string
  companyId: string
  isAdmin?: boolean
}

type AppContextValue = {
  user: SessionUser | null
  company: Company | null
  modules: Record<ModuleKey, boolean>
  loading: boolean
  refresh: () => Promise<void>
}

const AppContext = createContext<AppContextValue | null>(null)

function coerceModules(features: any): Record<ModuleKey, boolean> {
  const declared = (features?.modules ?? {}) as Record<string, any>
  const keys: ModuleKey[] = ['inventory', 'sales', 'purchases', 'accounting', 'crm', 'hr', 'manufacturing', 'logistics']

  const out = {} as Record<ModuleKey, boolean>
  for (const k of keys) {
    const v = declared?.[k]
    out[k] = v === undefined ? true : Boolean(v)
  }
  return out
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    setLoading(true)
    try {
      const meRes = await auth.me()
      setUser(meRes.data?.data?.user ?? null)

      const companyRes = await settings.getCompany()
      setCompany(companyRes.data?.data ?? null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh().catch((e) => {
      // If token is invalid, the api interceptor will redirect to /login.
      console.error('Failed to bootstrap app context:', e)
      setLoading(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const modules = useMemo(() => coerceModules(company?.features), [company?.features])

  const value: AppContextValue = {
    user,
    company,
    modules,
    loading,
    refresh,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
