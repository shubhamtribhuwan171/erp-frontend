import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Mail, Phone, Building, User } from 'lucide-react'
import { crm } from '../../lib/api'
import { Card, PageHeader, Avatar } from '../../components/ui'

function formatDate(date?: string) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function ContactDetails() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [contact, setContact] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const run = async () => {
      if (!id) return
      setLoading(true)
      setError('')
      try {
        const res = await crm.contacts.get(id)
        setContact(res.data.data)
      } catch (e: any) {
        setError(e?.message || 'Failed to load contact')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
      </div>
    )
  }

  if (error || !contact) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] p-6">
        <div className="max-w-5xl mx-auto">
          <Card><p className="text-center text-gray-400">{error || 'Contact not found'}</p></Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <PageHeader
          backPath="/crm/contacts"
          title={contact.name}
          subtitle="Contact Details"
        />

        <Card>
          <div className="flex items-center gap-6">
            <Avatar name={contact.name} size="xl" />
            <div>
              <div className="text-xl font-semibold">{contact.name}</div>
              <div className="text-gray-500">{contact.job_title || '-'}</div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1"><Mail size={14} /> Email</div>
              <div className="font-medium">{contact.email || '-'}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1"><Phone size={14} /> Phone</div>
              <div className="font-medium">{contact.phone || '-'}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1"><Building size={14} /> Company</div>
              <div className="font-medium">{contact.company_name || '-'}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1"><User size={14} /> Created</div>
              <div className="font-medium">{formatDate(contact.created_at)}</div>
            </div>
          </div>

          {contact.notes && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="text-gray-400 text-sm mb-2">Notes</div>
              <div className="text-gray-600">{contact.notes}</div>
            </div>
          )}
        </Card>

      </div>
    </div>
  )
}
