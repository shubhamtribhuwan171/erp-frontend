import { useState, useEffect } from 'react';
import { User, Building, Save, Loader2 } from 'lucide-react';
import { settings, auth } from '../../lib/api';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [company, setCompany] = useState<any>({});
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companyRes, userRes] = await Promise.all([
          settings.getCompany(),
          auth.me(),
        ]);
        setCompany(companyRes.data.data || {});
        setUser(userRes.data.data?.user || null);
      } catch (error) {
        console.error('Failed to fetch settings');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await settings.updateCompany(company);
      setMessage('Settings saved successfully!');
    } catch (error) {
      setMessage('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[--secondary]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-[--text-secondary]">Manage your company and account settings</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message}
        </div>
      )}

      {/* Company Settings */}
      <div className="bg-white rounded-lg border border-[--border] p-6">
        <div className="flex items-center gap-3 mb-6">
          <Building className="text-[--primary]" size={24} />
          <h2 className="text-lg font-semibold">Company Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Company Name</label>
            <input
              type="text"
              value={company.name || ''}
              onChange={(e) => setCompany({ ...company, name: e.target.value })}
              className="w-full px-3 py-2 border border-[--border] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--primary]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Legal Name</label>
            <input
              type="text"
              value={company.legal_name || ''}
              onChange={(e) => setCompany({ ...company, legal_name: e.target.value })}
              className="w-full px-3 py-2 border border-[--border] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--primary]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">GSTIN</label>
            <input
              type="text"
              value={company.gstin || ''}
              onChange={(e) => setCompany({ ...company, gstin: e.target.value })}
              className="w-full px-3 py-2 border border-[--border] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--primary]"
              placeholder="29AABCU9603R1ZM"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Currency</label>
            <select
              value={company.base_currency_code || 'INR'}
              onChange={(e) => setCompany({ ...company, base_currency_code: e.target.value })}
              className="w-full px-3 py-2 border border-[--border] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--primary]"
            >
              <option value="INR">INR - Indian Rupee</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Timezone</label>
            <select
              value={company.timezone || 'Asia/Kolkata'}
              onChange={(e) => setCompany({ ...company, timezone: e.target.value })}
              className="w-full px-3 py-2 border border-[--border] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--primary]"
            >
              <option value="Asia/Kolkata">Asia/Kolkata (GMT+5:30)</option>
              <option value="UTC">UTC (GMT+0)</option>
              <option value="America/New_York">America/New_York (GMT-5)</option>
              <option value="Europe/London">Europe/London (GMT+0)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Account Settings */}
      <div className="bg-white rounded-lg border border-[--border] p-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="text-[--primary]" size={24} />
          <h2 className="text-lg font-semibold">Your Account</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-3 py-2 border border-[--border] rounded-lg bg-gray-50 text-[--secondary]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <input
              type="text"
              value={user?.role || ''}
              disabled
              className="w-full px-3 py-2 border border-[--border] rounded-lg bg-gray-50 text-[--secondary] capitalize"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[--primary] hover:bg-[--primary-hover] text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
