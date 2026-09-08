import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Shield, Lock, Mail, ArrowRight, Film, AlertCircle } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

interface AdminLoginProps {
  navigate: (path: string) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ navigate }) => {
  const { settings } = useSettings();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.adminLogin(email.trim(), password);
      login(res.token, res.user);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Invalid administrator credentials');
    } finally {
      setLoading(false);
    }
  };

  const fillDefaults = () => {
    setEmail('admin@skxmovies.com');
    setPassword('Admin@12345');
  };

  return (
    <div id="admin-login-page" className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-3 shadow-lg shadow-amber-500/10">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Admin Portal
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Enter authorized credentials to manage {settings.siteName || 'SKxMOVIES'}
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl bg-zinc-950 border border-zinc-900 p-6 sm:p-8 shadow-2xl space-y-6">
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <input
                  id="admin-login-email"
                  type="email"
                  required
                  placeholder="admin@skxmovies.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Master Password
              </label>
              <div className="relative">
                <input
                  id="admin-login-password"
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              id="admin-login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm tracking-wide shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Default Credentials Helper */}
          <div className="pt-4 border-t border-zinc-900 text-center">
            <button
              type="button"
              onClick={fillDefaults}
              className="text-xs text-amber-400/80 hover:text-amber-400 underline underline-offset-2"
            >
              Fill Default Demo Admin Credentials (admin@skxmovies.com)
            </button>
          </div>
        </div>

        {/* Back to Site */}
        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            ← Return to Public Website
          </button>
        </div>
      </div>
    </div>
  );
};
