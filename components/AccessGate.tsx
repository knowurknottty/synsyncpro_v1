/**
 * AccessGate — full-screen upload wall shown when no valid session exists.
 *
 * Users drag-and-drop (or file-pick) their .syns access file.
 * On success the parent receives the validated AccessSession.
 */

import React, { useState, useCallback, useRef } from 'react';
import { Upload, ShieldCheck, Zap, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import { AccessSession } from '../types.ts';
import { AccessKeyService } from '../services/AccessKeyService.ts';

interface AccessGateProps {
  onAccess: (session: AccessSession) => void;
}

export const AccessGate: React.FC<AccessGateProps> = ({ onAccess }) => {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    const { session, error: err } = await AccessKeyService.loadAccessFile(file);
    setLoading(false);
    if (!session) {
      setError(err ?? 'Unknown error.');
      return;
    }
    onAccess(session);
  }, [onAccess]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  return (
    <div className="w-full bg-neuro-900 text-gray-100 flex flex-col items-center justify-center p-6 bg-cyber-grid relative overflow-y-auto" style={{ minHeight: '100dvh' }}>
      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none scanlines opacity-15 z-0" aria-hidden />

      {/* Ambient glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-20%', left: '10%', width: '80%', height: '60%',
          background: 'radial-gradient(ellipse, rgba(37,244,226,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8 max-w-md w-full">

        {/* Logo */}
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neuro-500 via-white to-neuro-500 tracking-tighter font-mono italic uppercase select-none">
          SYN<span className="text-white">SYNC</span>
        </h1>
        <p className="text-xs font-mono uppercase tracking-[0.25em] text-neuro-500 -mt-4">
          Neuroacoustic Medicine
        </p>

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`w-full rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-4 p-10 select-none
            ${dragging
              ? 'border-neuro-500 bg-neuro-500/10 scale-[1.02]'
              : 'border-neuro-700/60 bg-neuro-800/30 hover:border-neuro-600 hover:bg-neuro-800/50'
            }`}
          role="button"
          aria-label="Upload your SynSync access file"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
        >
          {loading ? (
            <RefreshCw className="w-10 h-10 text-neuro-500 animate-spin" />
          ) : (
            <Upload className={`w-10 h-10 transition-colors ${dragging ? 'text-neuro-400' : 'text-neuro-700'}`} />
          )}
          <div className="text-center">
            <p className="font-semibold text-white text-sm">
              {loading ? 'Verifying access file…' : 'Upload your access file'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Drag &amp; drop or tap to browse · <span className="font-mono">.syns</span>
            </p>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".syns,application/octet-stream"
          className="hidden"
          onChange={onFileChange}
        />

        {/* Error */}
        {error && (
          <div className="w-full flex items-start gap-3 bg-red-900/30 border border-red-500/40 rounded-xl p-4">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-300 leading-relaxed">{error}</p>
          </div>
        )}

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 text-[10px] font-mono uppercase tracking-widest">
          {[
            { Icon: ShieldCheck, text: 'Encrypted File' },
            { Icon: Zap,         text: 'Instant Access' },
            { Icon: Clock,       text: 'Personal History' },
          ].map(({ Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neuro-800/40 border border-neuro-700/50 rounded-full text-gray-500"
            >
              <Icon className="w-3 h-3" />
              {text}
            </div>
          ))}
        </div>

        <p className="text-[10px] text-gray-600 font-mono text-center leading-relaxed max-w-xs">
          Your access file is your personal passport — it unlocks the app and stores your session history locally. Keep it safe.
        </p>
      </div>
    </div>
  );
};
