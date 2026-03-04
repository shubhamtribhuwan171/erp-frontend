import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Mail, Phone, User } from 'lucide-react'
import { crm } from '../../lib/api'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../components/ui/RequestState'

export default function ContactsList() {
  const [contacts, setContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown | null>(null)

  useEffect(() => {
    fetchContacts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchContacts = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await crm.contacts.list()
      setContacts(res.data.data?.contacts || [])
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    if (isModuleDisabledError(error)) return <ModuleDisabledState moduleName="CRM" />
    if (isForbidden(error)) return <ForbiddenState />
    return <ErrorState message={getApiErrorMessage(error)} />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Contacts</h1>
          <p className="text-[var(--secondary)]">Manage contacts</p>
        </div>
        <Link
          to="/crm/contacts/new"
          className="bg-[var(--primary)] text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} /> Add Contact
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="text-[var(--secondary)]">Loading…</div>
        ) : contacts.length === 0 ? (
          <div className="col-span-full text-center py-8 text-[var(--secondary)]">
            No contacts yet
          </div>
        ) : (
          contacts.map((c) => (
            <div key={c.id} className="bg-white rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                  {c.name?.charAt(0) || 'C'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{c.name}</h3>
                    <User size={16} className="text-[var(--secondary)]" />
                  </div>
                  <p className="text-xs text-[var(--secondary)]">{c.code}</p>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm text-[var(--secondary)]">
                {c.email && (
                  <div className="flex items-center gap-2">
                    <Mail size={14} />
                    {c.email}
                  </div>
                )}
                {c.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={14} />
                    {c.phone}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
