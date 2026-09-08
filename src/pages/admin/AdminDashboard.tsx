import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { api } from '../../lib/api';
import { AdminStats } from '../../types';
import { ContentManager } from '../../components/admin/ContentManager';
import { BackgroundMotionSelector } from '../../components/admin/BackgroundMotionSelector';
import { CategoriesManager } from '../../components/admin/CategoriesManager';
import { PopupsManager } from '../../components/admin/PopupsManager';
import { SettingsManager } from '../../components/admin/SettingsManager';
import { MultiDbStatus } from '../../components/admin/MultiDbStatus';
import {
  Shield,
  Film,
  Sparkles,
  Layers,
  MessageSquare,
  Settings,
  Database,
  Lock,
  LogOut,
  Eye,
  Send,
  Check
} from 'lucide-react';

interface AdminDashboardProps {
  navigate: (path: string) => void;
}

type AdminTab = 'content' | 'motion' | 'categories' | 'popups' | 'settings' | 'multidb' | 'security';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ navigate }) => {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const { settings } = useSettings();
  const [activeTab, setActiveTab] = useState<AdminTab>('content');
  const [stats, setStats] = useState<AdminStats | null>(null);

  // Change password state
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);
  const [changingPass, setChangingPass] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      api.adminStats().then(setStats).catch(console.error);
    }
  }, [isAuthenticated, activeTab]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim() || newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    setChangingPass(true);
    setPasswordMsg(null);
    try {
      const res = await api.adminChangePassword(newPassword.trim());
      setPasswordMsg(res.message || 'Password updated successfully!');
      setNewPassword('');
    } catch (err: any) {
      alert(err.message || 'Failed to update password');
    } finally {
      setChangingPass(false);
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-zinc-500 text-xs">Validating admin session...</p>
      </div>
    );
  }

  return (
    <div id="admin-dashboard-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 p-[1.5px] shadow-lg shadow-amber-500/20">
            <div className="w-full h-full rounded-[9px] bg-black flex items-center justify-center text-amber-400">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">SKxMOVIES Control Center</h1>
            <p className="text-xs text-zinc-400">
              Logged in as <span className="text-white font-semibold">{user?.email}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="admin-public-view-btn"
            onClick={() => navigate('/')}
            className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold transition-colors"
          >
            View Public Site
          </button>
          <button
            id="admin-logout-btn"
            onClick={() => {
              logout();
              navigate('/admin/login');
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-900/50 text-xs font-semibold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 space-y-1">
            <span className="text-[11px] text-zinc-500 font-medium">Total Titles</span>
            <p className="text-xl font-bold text-white">{stats.totalContent}</p>
          </div>
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 space-y-1">
            <span className="text-[11px] text-zinc-500 font-medium">Total Views</span>
            <p className="text-xl font-bold text-amber-400">{stats.totalViews.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 space-y-1">
            <span className="text-[11px] text-zinc-500 font-medium">Categories</span>
            <p className="text-xl font-bold text-white">{stats.totalCategories}</p>
          </div>
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 space-y-1">
            <span className="text-[11px] text-zinc-500 font-medium">Genres</span>
            <p className="text-xl font-bold text-white">{stats.totalGenres}</p>
          </div>
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[11px] text-zinc-500 font-medium">Active Popups</span>
            <p className="text-xl font-bold text-emerald-400">{stats.activePopups}</p>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-900 pb-3">
        <button
          id="tab-content"
          onClick={() => setActiveTab('content')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'content'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
              : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-900'
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          <span>Content Library</span>
        </button>

        <button
          id="tab-motion"
          onClick={() => setActiveTab('motion')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'motion'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
              : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Background Motion Styles</span>
        </button>

        <button
          id="tab-categories"
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'categories'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
              : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Categories & Genres</span>
        </button>

        <button
          id="tab-popups"
          onClick={() => setActiveTab('popups')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'popups'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
              : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-900'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Popups</span>
        </button>

        <button
          id="tab-settings"
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'settings'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
              : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-900'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Site & Telegram Settings</span>
        </button>

        <button
          id="tab-multidb"
          onClick={() => setActiveTab('multidb')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'multidb'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
              : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-900'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Multi-DB Clusters</span>
        </button>

        <button
          id="tab-security"
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'security'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
              : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-900'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Security</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="pt-2">
        {activeTab === 'content' && <ContentManager />}
        {activeTab === 'motion' && <BackgroundMotionSelector />}
        {activeTab === 'categories' && <CategoriesManager />}
        {activeTab === 'popups' && <PopupsManager />}
        {activeTab === 'settings' && <SettingsManager />}
        {activeTab === 'multidb' && <MultiDbStatus />}
        {activeTab === 'security' && (
          <div className="max-w-md space-y-6">
            <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-900 space-y-4">
              <h3 className="text-base font-bold text-white">Change Admin Master Password</h3>
              {passwordMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{passwordMsg}</span>
                </div>
              )}
              <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    New Master Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={changingPass}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold shadow-md shadow-amber-500/20"
                >
                  {changingPass ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
