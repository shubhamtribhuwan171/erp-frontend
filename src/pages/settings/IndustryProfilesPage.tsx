import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Building2, RefreshCw } from 'lucide-react'
import { settings } from '../../lib/api'
import { settingsIndustryProfiles, type IndustryProfile } from '../../lib/settings-industry-profiles'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../components/ui/RequestState'

export default function IndustryProfilesPage() {
  const [profiles, setProfiles] = useState<IndustryProfile[]>([])
  const [company, setCompany] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<unknown | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    setError(null)
    setMessage('')
    try {
      const [pRes, cRes] = await Promise.all([
        settingsIndustryProfiles.list(),
        settings.getCompany(),
      ])
      setProfiles(pRes.data.data?.profiles || [])
      setCompany(cRes.data.data || {})
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  const activeCode = company.industry_type || ''

  const activeProfile = useMemo(() => profiles.find((p) => p.code === activeCode), [profiles, activeCode])

  const handleSelect = async (code: string) => {
    setSaving(true)
    setMessage('')
    setError(null)
    try {
      const next = { ...company, industry_type: code }
      await settings.updateCompany(next)
      setCompany(next)
      setMessage('Industry profile updated')
    } catch (e) {
      setError(e)
      setMessage(getApiErrorMessage(e))
    } finally {
      setSaving(false)
    }
  }

  if (error) {
    if (isModuleDisabledError(error)) return <ModuleDisabledState moduleName="Settings" />
    if (isForbidden(error)) return <ForbiddenState />
    return <ErrorState message={getApiErrorMessage(error)} />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Industry Profiles</h1>
          <p className="text-[var(--secondary)]">Pick a baseline configuration for your company</p>
        </div>
        <button
          onClick={fetchAll}
          disabled={loading || saving}
          className="px-4 py-2 rounded-lg border flex items-center gap-2 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {message ? (
        <div
          className={`p-4 rounded-lg border ${message.toLowerCase().includes('updated') ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}
        >
          {message}
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-lg border">
          <div className="p-4 border-b flex items-center gap-2">
            <Building2 size={18} className="text-[var(--primary)]" />
            <div className="font-medium">Available profiles</div>
            <div className="ml-auto text-sm text-[var(--secondary)]">
              {loading ? 'Loading…' : `${profiles.length} profiles`}
            </div>
          </div>

          {loading ? (
            <div className="p-4 text-[var(--secondary)]">Loading…</div>
          ) : profiles.length === 0 ? (
            <div className="p-8 text-center text-[var(--secondary)]">No profiles available</div>
          ) : (
            <div className="divide-y">
              {profiles.map((p) => {
                const active = p.code === activeCode
                return (
                  <div key={p.code} className="p-4 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {p.name}
                        {active ? <CheckCircle2 size={16} className="text-green-600" /> : null}
                      </div>
                      <div className="text-sm text-[var(--secondary)]">Code: {p.code}</div>
                    </div>
                    <button
                      onClick={() => handleSelect(p.code)}
                      disabled={saving || active}
                      className={`px-4 py-2 rounded-lg border ${
                        active
                          ? 'bg-green-50 border-green-200 text-green-700'
                          : 'hover:bg-gray-50'
                      } disabled:opacity-50`}
                    >
                      {active ? 'Selected' : saving ? 'Selecting…' : 'Select'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="p-4 border-b">
            <div className="font-medium">Selected profile</div>
            <div className="text-sm text-[var(--secondary)]">
              {activeProfile ? `${activeProfile.name} (${activeProfile.code})` : 'None'}
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <div className="text-xs uppercase tracking-wide text-[var(--secondary)]">Default features</div>
              <pre className="mt-1 text-xs bg-gray-50 border rounded-lg p-3 overflow-auto max-h-56">
                {activeProfile?.default_features
                  ? JSON.stringify(activeProfile.default_features, null, 2)
                  : '{}'}
              </pre>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-[var(--secondary)]">Default settings</div>
              <pre className="mt-1 text-xs bg-gray-50 border rounded-lg p-3 overflow-auto max-h-56">
                {activeProfile?.default_settings
                  ? JSON.stringify(activeProfile.default_settings, null, 2)
                  : '{}'}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
