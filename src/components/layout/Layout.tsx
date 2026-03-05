import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AppProvider, useApp, type ModuleKey } from '../../lib/app-context'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Receipt,
  TrendingUp,
  Users,
  UserCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Search,
  Bell,
  Shield,
  Sun,
  Moon,
} from 'lucide-react'
import { toggleTheme, type Theme } from '../../lib/theme'

interface LayoutProps {
  children: React.ReactNode
}

type MenuItem =
  | { icon: any; label: string; path: string; module?: ModuleKey }
  | {
      icon: any
      label: string
      path: string
      module?: ModuleKey
      items: { label: string; path: string }[]
    }

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  {
    icon: Package,
    label: 'Inventory',
    path: '/inventory',
    module: 'inventory',
    items: [
      { label: 'Items', path: '/inventory/items' },
      { label: 'Categories', path: '/inventory/categories' },
      { label: 'Units', path: '/inventory/units' },
      { label: 'Warehouses', path: '/inventory/warehouses' },
      { label: 'Transactions', path: '/inventory/transactions' },
      { label: 'Transfers', path: '/inventory/transfers' },
      { label: 'Adjustments', path: '/inventory/adjustments' },
    ],
  },
  {
    icon: ShoppingCart,
    label: 'Sales',
    path: '/sales',
    module: 'sales',
    items: [
      { label: 'Orders', path: '/sales/orders' },
      { label: 'Customers', path: '/sales/customers' },
      { label: 'Quotations', path: '/sales/quotations' },
      { label: 'Invoices', path: '/sales/invoices' },
      { label: 'Returns', path: '/sales/returns' },
    ],
  },
  {
    icon: Receipt,
    label: 'Purchases',
    path: '/purchases',
    module: 'purchases',
    items: [
      { label: 'Orders', path: '/purchases/orders' },
      { label: 'Vendors', path: '/purchases/vendors' },
      { label: 'Receipts (GRN)', path: '/purchases/receipts' },
      { label: 'Vendor Invoices', path: '/purchases/vendor-invoices' },
      { label: 'Returns', path: '/purchases/returns' },
    ],
  },
  {
    icon: TrendingUp,
    label: 'Accounting',
    path: '/accounting',
    module: 'accounting',
    items: [
      { label: 'Accounts', path: '/accounting/accounts' },
      { label: 'Journal', path: '/accounting/journal' },
      { label: 'Reports', path: '/accounting/reports' },
    ],
  },
  {
    icon: Users,
    label: 'HR',
    path: '/hr',
    module: 'hr',
    items: [
      { label: 'Employees', path: '/hr/employees' },
      { label: 'Departments', path: '/hr/departments' },
      { label: 'Attendance', path: '/hr/attendance' },
    ],
  },
  {
    icon: UserCircle,
    label: 'CRM',
    path: '/crm',
    module: 'crm',
    items: [
      { label: 'Leads', path: '/crm/leads' },
      { label: 'Contacts', path: '/crm/contacts' },
    ],
  },
  {
    icon: Settings,
    label: 'Settings',
    path: '/settings',
    items: [
      { label: 'Company', path: '/settings' },
      { label: 'Users', path: '/settings/users' },
      { label: 'Industry Profiles', path: '/settings/industry-profiles' },
    ],
  },
]

export default function Layout({ children }: LayoutProps) {
  return (
    <AppProvider>
      <LayoutInner>{children}</LayoutInner>
    </AppProvider>
  )
}

function LayoutInner({ children }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['Inventory'])
  const location = useLocation()
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light',
  )

  const { company, modules, loading, user, features } = useApp()

  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement | null>(null)

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) =>
      prev.includes(label) ? prev.filter((m) => m !== label) : [...prev, label],
    )
  }

  const isActive = (path: string) => location.pathname === path

  const visibleMenuItems = useMemo(() => {
    const flagForPath = (path: string): boolean => {
      // default allow
      const inv = features?.inventory
      const sales = features?.sales
      const pur = features?.purchases
      const hr = features?.hr
      const acc = features?.accounting
      const crm = features?.crm
      const set = features?.settings

      if (path.startsWith('/inventory/transactions')) return inv?.transactions ?? true
      if (path.startsWith('/inventory/transfers')) return inv?.transfers ?? true
      if (path.startsWith('/inventory/adjustments')) return inv?.adjustments ?? true

      if (path.startsWith('/sales/quotations')) return sales?.quotations ?? true
      if (path.startsWith('/sales/invoices')) return sales?.invoices ?? true
      if (path.startsWith('/sales/returns')) return sales?.returns ?? true

      if (path.startsWith('/purchases/receipts')) return pur?.receipts ?? true
      if (path.startsWith('/purchases/vendor-invoices')) return pur?.vendorInvoices ?? true
      if (path.startsWith('/purchases/returns')) return pur?.returns ?? true

      if (path.startsWith('/hr/attendance')) return hr?.attendance ?? true

      if (path.startsWith('/accounting/accounts')) return acc?.accounts ?? true
      if (path.startsWith('/accounting/journal')) return acc?.journal ?? true
      if (path.startsWith('/accounting/reports')) return acc?.reports ?? true

      if (path.startsWith('/crm/leads')) return crm?.leads ?? true
      if (path.startsWith('/crm/contacts')) return crm?.contacts ?? true

      if (path.startsWith('/settings/users')) return set?.users ?? true
      if (path.startsWith('/settings/industry-profiles')) return set?.industryProfiles ?? true

      return true
    }

    return menuItems
      .filter((item) => {
        if (!('module' in item) || !item.module) return true
        return modules[item.module]
      })
      .map((item) => {
        if (!('items' in item)) return item
        return {
          ...item,
          items: item.items.filter((sub) => flagForPath(sub.path)),
        }
      })
      .filter((item) => {
        if (!('items' in item)) return true
        return item.items.length > 0
      })
  }, [modules, features])

  // If a module is disabled and the user is on that route, gently bounce them to dashboard.
  useEffect(() => {
    const pathname = location.pathname
    const blocked: { prefix: string; module: ModuleKey }[] = [
      { prefix: '/inventory', module: 'inventory' },
      { prefix: '/sales', module: 'sales' },
      { prefix: '/purchases', module: 'purchases' },
      { prefix: '/accounting', module: 'accounting' },
      { prefix: '/hr', module: 'hr' },
      { prefix: '/crm', module: 'crm' },
    ]

    const hit = blocked.find((b) => pathname.startsWith(b.prefix))
    if (hit && !modules[hit.module]) {
      window.location.href = '/'
    }
  }, [location.pathname, modules])

  // Close the user popover when clicking outside.
  useEffect(() => {
    if (!userMenuOpen) return

    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node | null
      if (!target) return
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [userMenuOpen])

  return (
    <div className="min-h-screen bg-[var(--background)] flex">
      <aside
        className={`${collapsed ? 'w-16' : 'w-60'} bg-white border-r border-[var(--border)] flex flex-col transition-all duration-200`}
      >
        <div className="h-14 flex items-center justify-between px-4 border-b border-[var(--border)]">
          {!collapsed && (
            <span className="font-bold text-lg text-[var(--primary)]">ERP</span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {loading && !collapsed && (
            <div className="px-4 py-2 text-xs text-[var(--text-secondary)]">
              Loading company settings…
            </div>
          )}
          {!loading && company && !collapsed && (
            <div className="px-4 pb-2">
              <div className="text-[11px] uppercase tracking-wide text-[var(--text-secondary)]">
                Company
              </div>
              <div className="text-sm font-semibold text-gray-900 truncate">
                {company.name}
              </div>
            </div>
          )}

          {visibleMenuItems.map((item) => (
            <div key={item.path}>
              {'items' in item ? (
                <>
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 ${expandedMenus.includes(item.label) ? 'bg-gray-50' : ''}`}
                  >
                    <item.icon size={20} className="text-[var(--secondary)]" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left text-sm">{item.label}</span>
                        <ChevronRight
                          size={14}
                          className={`transition-transform ${expandedMenus.includes(item.label) ? 'rotate-90' : ''}`}
                        />
                      </>
                    )}
                  </button>
                  {!collapsed && expandedMenus.includes(item.label) && (
                    <div className="bg-gray-50">
                      {item.items.map((sub: any) => (
                        <Link
                          key={sub.path}
                          to={sub.path}
                          className={`block pl-12 pr-4 py-2 text-sm hover:bg-gray-100 ${isActive(sub.path) ? 'text-[var(--primary)] font-medium' : 'text-[var(--text-secondary)]'}`}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 ${isActive(item.path) ? 'bg-blue-50 text-[var(--primary)] border-r-2 border-[var(--primary)]' : ''}`}
                >
                  <item.icon
                    size={20}
                    className={
                      isActive(item.path)
                        ? 'text-[var(--primary)]'
                        : 'text-[var(--secondary)]'
                    }
                  />
                  {!collapsed && <span className="text-sm">{item.label}</span>}
                </Link>
              )}
            </div>
          ))}
        </nav>

        <div className="border-t border-[var(--border)] p-3">
          <div ref={userMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen((v) => !v)}
              className={`w-full flex items-center gap-3 rounded-lg hover:bg-gray-50 px-2 py-2 ${collapsed ? 'justify-center' : ''}`}
              aria-haspopup="menu"
              aria-expanded={userMenuOpen}
            >
              <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {(user?.email?.[0] ?? 'U').toUpperCase()}
              </div>

              {!collapsed && (
                <div className="min-w-0 flex-1 text-left">
                  <div className="text-sm font-semibold text-gray-900 truncate">
                    {user?.email ?? 'User'}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] truncate">
                    {user?.role ? user.role.toUpperCase() : '—'}
                    {company?.name ? ` • ${company.name}` : ''}
                  </div>
                </div>
              )}
            </button>

            {userMenuOpen && (
              <div
                role="menu"
                className={`absolute ${collapsed ? 'left-full ml-2 bottom-0' : 'left-0 right-0 bottom-full mb-2'} bg-white border border-[var(--border)] shadow-lg rounded-lg overflow-hidden`}
              >

                {(user?.isAdmin || user?.role === 'owner' || user?.role === 'admin') && (
                  <Link
                    to="/admin/dashboard"
                    role="menuitem"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Shield size={16} />
                    Admin portal
                  </Link>
                )}

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setUserMenuOpen(false)
                    localStorage.removeItem('token')
                    window.location.href = '/login'
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--danger)] hover:bg-red-50"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-14 bg-white border-b border-[var(--border)] flex items-center justify-between px-6">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <Search size={18} className="text-[var(--secondary)]" />
            <input
              type="text"
              placeholder="Search..."
              className="flex-1 border-none outline-none text-sm bg-transparent"
            />
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="themeToggle"
              data-theme={theme}
              onClick={() => setTheme(toggleTheme(theme))}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              <span className="themeToggleThumb" aria-hidden="true" />
              <span className="themeToggleIcon" aria-hidden="true">
                <Sun size={16} />
              </span>
              <span className="themeToggleIcon" aria-hidden="true">
                <Moon size={16} />
              </span>
            </button>

            <button className="relative p-2 hover:bg-gray-100 rounded-full">
              <Bell size={20} className="text-[var(--secondary)]" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
                T
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
