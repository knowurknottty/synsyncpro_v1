/**
 * AdminPanel — file generator for the app owner.
 *
 * Accessible at ?admin in the URL.
 * Password protected.
 * Lets you generate .syns access files for any membership duration.
 */

import React, { useState, useEffect } from 'react';
import { Download, Zap, ShieldAlert, Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { MembershipPlan } from '../types.ts';
import { AccessKeyService } from '../services/AccessKeyService.ts';

const ADMIN_PASSWORD = 'Evanroo222@@b';
const SESSION_KEY = 'synsync_admin_session';
const SESSION_DURATION = 60 * 60 * 1000; // 1 hour

const PLANS: { plan: MembershipPlan; label: string; desc: string }[] = [
  { plan: 'day',      label: '1 Day',    desc: 'Trial / preview' },
  { plan: 'week',     label: '1 Week',   desc: 'Short-term access' },
  { plan: 'month',    label: '1 Month',  desc: 'Monthly membership' },
  { plan: 'year',     label: '1 Year',   desc: 'Annual membership' },
  { plan: 'lifetime', label: 'Lifetime', desc: 'Never expires' },
];

export const AdminPanel: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<MembershipPlan>('week');
  const [loading, setLoading]   = useState(false);
  const [generated, setGenerated] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const session = localStorage.getItem(SESSION_KEY);
    if (session) {
      try {
        const { timestamp } = JSON.parse(session);
        if (Date.now() - timestamp < SESSION_DURATION) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem(SESSION_KEY, JSON.stringify({ timestamp: Date.now() }));
      setError(null);
    } else {
      setError('Incorrect password');
      setPassword('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
    setPassword('');
  };

  const handleGenerate = async () => {
    setLoading(true);
    setGenerated(null);
    try {
      const { blob, filename } = await AccessKeyService.generateAccessFile(selected);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      setGenerated(filename);
    } finally {
      setLoading(false);
    }
  };

  // Password gate
  if (!isAuthenticated) {
    return (
      <div className="h-screen w-full bg-neuro-900 text-gray-100 flex flex-col items-center justify-center p-8 bg-cyber-grid relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none scanlines opacity-10 z-0" aria-hidden />

        <div className="relative z-10 flex flex-col gap-6 max-w-md w-full">
          
          {/* Header */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center">
              <Lock className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-black font-mono uppercase tracking-widest text-white">
              Admin Access
            </h2>
            <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mt-2">
              Password Required
            </p>
          </div>

          {/* Password form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password..."
                className="w-full bg-black/40 border border-neuro-700 rounded-xl px-4 py-4 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors font-mono"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-red-500/20 border border-red-500/50 text-red-400 font-bold font-mono uppercase tracking-widest rounded-xl hover:bg-red-500/30 transition-colors"
            >
              Unlock Admin Panel
            </button>
          </form>

          <a
            href={window.location.pathname}
            className="text-[10px] font-mono text-gray-600 hover:text-gray-400 text-center underline"
          >
            ← Back to SynSync
          </a>
        </div>
      </div>
    );
  }

  // Main admin panel
  return (
    <div className="h-screen w-full bg-neuro-900 text-gray-100 flex flex-col items-center justify-center p-8 bg-cyber-grid relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none scanlines opacity-10 z-0" aria-hidden />

      <div className="relative z-10 flex flex-col gap-8 max-w-md w-full">

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-neuro-500" />
            <div>
              <h2 className="text-lg font-black font-mono uppercase tracking-widest text-white">
                SynSync Admin
              </h2>
              <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">
                Access file generator
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-[10px] font-mono text-gray-600 hover:text-red-400 uppercase tracking-widest transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Plan selector */}
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1">
            Membership duration
          </p>
          {PLANS.map(({ plan, label, desc }) => (
            <button
              key={plan}
              onClick={() => setSelected(plan)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left ${
                selected === plan
                  ? 'border-neuro-500 bg-neuro-500/10 text-white'
                  : 'border-neuro-700/50 bg-neuro-800/30 text-gray-400 hover:border-neuro-600'
              }`}
            >
              <span className="font-bold font-mono text-sm">{label}</span>
              <span className="text-[10px] uppercase tracking-widest text-gray-600">{desc}</span>
            </button>
          ))}
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center justify-center gap-2 w-full py-4 bg-neuro-500 text-black font-black font-mono uppercase tracking-widest rounded-xl hover:bg-neuro-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <Zap className="w-4 h-4 animate-pulse" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {loading ? 'Generating…' : `Generate ${PLANS.find(p => p.plan === selected)?.label} Access File`}
        </button>

        {generated && (
          <p className="text-xs text-neuro-400 font-mono text-center">
            ✓ Downloaded: <span className="text-white">{generated}</span>
          </p>
        )}

        <p className="text-[10px] text-gray-700 font-mono leading-relaxed text-center">
          Each generated file is unique and cryptographically signed.
          Share the file directly with your user — they upload it to unlock SynSync.
        </p>

        <a
          href={window.location.pathname}
          className="text-[10px] font-mono text-gray-600 hover:text-gray-400 text-center underline"
        >
          ← Exit admin panel
        </a>
      </div>
    </div>
  );
};
