import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { auth } from '../../lib/api';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await auth.login(email, password);
      if (response.data.success) {
        localStorage.setItem('token', response.data.data.session.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        navigate('/');
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[--background] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[--primary]">ERP</h1>
          <p className="text-[--text-secondary] mt-1">Business Management</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-sm border border-[--border] p-8">
          <h2 className="text-xl font-semibold mb-6">Sign in to your account</h2>
          
          {error && (
            <div className="bg-red-50 text-[--danger] p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-[--border] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--primary] focus:border-transparent"
                placeholder="you@company.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-[--border] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--primary] focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[--secondary]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-[--border]" />
                <span className="text-sm text-[--text-secondary]">Remember me</span>
              </label>
              <a href="#" className="text-sm text-[--primary] hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[--text-secondary]">
            Don't have an account?{' '}
            <a href="/register" className="text-[--primary] hover:underline font-medium">
              Register
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
