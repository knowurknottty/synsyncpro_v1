/**
 * UserProfile — Comprehensive user dashboard
 * 
 * Features:
 * - User stats & progress visualization
 * - Session history timeline
 * - Prescription upload/paste
 * - Re-upload .syns file
 * - Favorite protocols management
 * - Personal notes editor
 */

import React, { useState, useMemo } from 'react';
import {
  User,
  FileText,
  Upload,
  Clock,
  Activity,
  Calendar,
  Target,
  Heart,
  FileUp,
  X,
  ChevronRight,
  Trophy,
  TrendingUp,
  Stethoscope,
  Pill,
  Edit3,
  Save,
  Trash2,
  AlertCircle,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { AccessSession, UserData, SessionRecord, Protocol, Prescription } from '../types';
import { AccessKeyService } from '../services/AccessKeyService.ts';
import { PROTOCOLS } from '../constants.ts';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
  accessSession: AccessSession;
  onUpdateSession: (session: AccessSession) => void;
  onRequestNewFile: () => void;
}

type Tab = 'overview' | 'history' | 'prescriptions' | 'notes' | 'file';

export const UserProfile: React.FC<UserProfileProps> = ({
  isOpen,
  onClose,
  accessSession,
  onUpdateSession,
  onRequestNewFile,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState(accessSession.userData.notes || '');
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [prescriptionText, setPrescriptionText] = useState('');
  const [prescriptionTitle, setPrescriptionTitle] = useState('');
  const [prescriptionDoctor, setPrescriptionDoctor] = useState('');
  const [fileDragOver, setFileDragOver] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { userData, token } = accessSession;
  const intention =
    typeof userData.preferences?.intention === 'string'
      ? userData.preferences.intention
      : '';

  // Calculate stats
  const stats = useMemo(() => {
    const history = userData.history || [];
    const totalSessions = history.length;
    const totalMinutes = userData.totalMinutes || 0;
    const totalHours = Math.round(totalMinutes / 60 * 10) / 10;
    const favoriteProtocols = userData.favoriteProtocols || [];
    
    // Most used protocol
    const protocolCounts: Record<string, number> = {};
    history.forEach(h => {
      protocolCounts[h.protocolId] = (protocolCounts[h.protocolId] || 0) + 1;
    });
    const mostUsedProtocolId = Object.entries(protocolCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0];
    const mostUsedProtocol = mostUsedProtocolId ? PROTOCOLS[mostUsedProtocolId] : undefined;

    // Streak calculation (simplified - consecutive days with sessions)
    const uniqueDays = new Set(history.map(h => 
      new Date(h.timestamp).toDateString()
    )).size;

    // Recent activity (last 7 days)
    const lastWeek = history.filter(h => 
      h.timestamp > Date.now() - 7 * 24 * 60 * 60 * 1000
    );

    return {
      totalSessions,
      totalHours,
      favoriteCount: favoriteProtocols.length,
      mostUsedProtocol,
      uniqueDays,
      lastWeekSessions: lastWeek.length,
      lastWeekMinutes: Math.round(lastWeek.reduce((sum, h) => sum + (h.durationMs || 0), 0) / 60000),
    };
  }, [userData]);

  // Get prescriptions from userData
  const prescriptions: Prescription[] = userData.preferences?.prescriptions || [];

  const handleSaveNotes = () => {
    const updatedUserData: UserData = {
      ...userData,
      notes: notesDraft,
    };
    AccessKeyService.setLocalUserData(token.uid, updatedUserData);
    onUpdateSession({
      ...accessSession,
      userData: updatedUserData,
    });
    setIsEditingNotes(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleAddPrescription = () => {
    if (!prescriptionText.trim() || !prescriptionTitle.trim()) return;

    const newPrescription: Prescription = {
      id: `rx_${Date.now()}`,
      title: prescriptionTitle,
      prescribedBy: prescriptionDoctor || undefined,
      date: Date.now(),
      content: prescriptionText,
      source: 'paste',
    };

    const currentPrescriptions: Prescription[] = userData.preferences?.prescriptions || [];
    const updatedUserData: UserData = {
      ...userData,
      preferences: {
        ...userData.preferences,
        prescriptions: [...currentPrescriptions, newPrescription],
      },
    };

    AccessKeyService.setLocalUserData(token.uid, updatedUserData);
    onUpdateSession({
      ...accessSession,
      userData: updatedUserData,
    });

    setPrescriptionText('');
    setPrescriptionTitle('');
    setPrescriptionDoctor('');
    setShowPrescriptionModal(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleDeletePrescription = (id: string) => {
    const currentPrescriptions: Prescription[] = userData.preferences?.prescriptions || [];
    const updatedUserData: UserData = {
      ...userData,
      preferences: {
        ...userData.preferences,
        prescriptions: currentPrescriptions.filter(p => p.id !== id),
      },
    };

    AccessKeyService.setLocalUserData(token.uid, updatedUserData);
    onUpdateSession({
      ...accessSession,
      userData: updatedUserData,
    });
  };

  const handleFileDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setFileDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.syns')) {
      const { session, error } = await AccessKeyService.loadAccessFile(file);
      if (session) {
        onUpdateSession(session);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
  };

  if (!isOpen) return null;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
    { id: 'history', label: 'History', icon: <Clock className="w-4 h-4" /> },
    { id: 'prescriptions', label: 'Prescriptions', icon: <Stethoscope className="w-4 h-4" /> },
    { id: 'notes', label: 'Notes', icon: <FileText className="w-4 h-4" /> },
    { id: 'file', label: 'File', icon: <FileUp className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-neuro-900 border border-neuro-700 w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-neuro-700/50 bg-neuro-900/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neuro-500 to-cyan-400 flex items-center justify-center text-black font-bold text-lg">
              {(userData.displayName || 'U')[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{userData.displayName || 'Explorer'}</h2>
              <p className="text-xs text-gray-500">
                {token.plan === 'lifetime' ? 'Lifetime Member' : `${token.plan} Plan`} • 
                Member since {formatDate(userData.createdAt || Date.now())}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {saveSuccess && (
              <div className="flex items-center gap-1 text-green-400 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                Saved
              </div>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neuro-700/50 bg-neuro-900/50 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2 -mb-px
                ${activeTab === tab.id
                  ? 'text-neuro-400 border-neuro-500'
                  : 'text-gray-500 border-transparent hover:text-gray-300'
                }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-neuro-800/40 border border-neuro-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-neuro-400 mb-2">
                    <Activity className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wider">Sessions</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.totalSessions}</p>
                  <p className="text-xs text-gray-500">All time</p>
                </div>

                <div className="bg-neuro-800/40 border border-neuro-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-neuro-400 mb-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wider">Time</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.totalHours}h</p>
                  <p className="text-xs text-gray-500">Total duration</p>
                </div>

                <div className="bg-neuro-800/40 border border-neuro-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-neuro-400 mb-2">
                    <Heart className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wider">Favorites</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.favoriteCount}</p>
                  <p className="text-xs text-gray-500">Saved protocols</p>
                </div>

                <div className="bg-neuro-800/40 border border-neuro-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-neuro-400 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wider">Active Days</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.uniqueDays}</p>
                  <p className="text-xs text-gray-500">Days with sessions</p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-neuro-800/40 border border-neuro-700/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-neuro-400" />
                    <h3 className="font-semibold text-white">Last 7 Days</h3>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-3xl font-bold text-white">{stats.lastWeekSessions}</p>
                    <p className="text-sm text-gray-500">Sessions this week</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white">{stats.lastWeekMinutes}m</p>
                    <p className="text-sm text-gray-500">Minutes this week</p>
                  </div>
                </div>
              </div>

              {/* Most Used Protocol */}
              {stats.mostUsedProtocol && (
                <div className="bg-neuro-800/40 border border-neuro-700/50 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    <h3 className="font-semibold text-white">Most Used Protocol</h3>
                  </div>
                  <p className="text-lg font-medium text-neuro-300">{stats.mostUsedProtocol.title}</p>
                  <p className="text-sm text-gray-500 mt-1">{stats.mostUsedProtocol.description}</p>
                </div>
              )}

              {/* Intention */}
              {intention && (
                <div className="bg-neuro-800/40 border border-neuro-700/50 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-5 h-5 text-neuro-400" />
                    <h3 className="font-semibold text-white">Your Intention</h3>
                  </div>
                  <p className="text-gray-300 italic">"{intention}"</p>
                </div>
              )}
            </div>
          )}

          {/* HISTORY TAB */}
          {activeTab === 'history' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-neuro-400" />
                Session History
              </h3>
              
              {(userData.history || []).length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No sessions yet</p>
                  <p className="text-sm">Complete your first session to see it here</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {[...(userData.history || [])].reverse().map((session, idx) => {
                    const protocol = PROTOCOLS[session.protocolId];
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-4 p-4 bg-neuro-800/40 border border-neuro-700/50 rounded-xl"
                      >
                        <div className="w-10 h-10 rounded-lg bg-neuro-700/50 flex items-center justify-center shrink-0">
                          <Activity className="w-5 h-5 text-neuro-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white truncate">
                            {protocol?.title || session.protocolId}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(session.timestamp)} at {formatTime(session.timestamp)}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-medium text-neuro-300">
                            {formatDuration(session.durationMs || 0)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* PRESCRIPTIONS TAB */}
          {activeTab === 'prescriptions' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-neuro-400" />
                  Your Prescriptions
                </h3>
                <button
                  onClick={() => setShowPrescriptionModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-neuro-500 text-black text-sm font-semibold rounded-lg hover:bg-neuro-400 transition-colors"
                >
                  <Pill className="w-4 h-4" />
                  Add Prescription
                </button>
              </div>

              {prescriptions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Stethoscope className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No prescriptions saved</p>
                  <p className="text-sm">Upload or paste a prescription from your practitioner</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {prescriptions.map((rx) => (
                    <div
                      key={rx.id}
                      className="p-4 bg-neuro-800/40 border border-neuro-700/50 rounded-xl"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-white">{rx.title}</h4>
                          {rx.prescribedBy && (
                            <p className="text-sm text-gray-500">By {rx.prescribedBy}</p>
                          )}
                          <p className="text-xs text-gray-600">{formatDate(rx.date)}</p>
                        </div>
                        <button
                          onClick={() => handleDeletePrescription(rx.id)}
                          className="p-2 hover:bg-red-500/20 text-gray-500 hover:text-red-400 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="bg-black/30 rounded-lg p-3 mt-3">
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">{rx.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* NOTES TAB */}
          {activeTab === 'notes' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-neuro-400" />
                  Personal Notes
                </h3>
                {isEditingNotes ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setIsEditingNotes(false);
                        setNotesDraft(userData.notes || '');
                      }}
                      className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveNotes}
                      className="flex items-center gap-1 px-3 py-1.5 bg-neuro-500 text-black text-sm font-semibold rounded-lg hover:bg-neuro-400 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditingNotes(true)}
                    className="flex items-center gap-1 px-3 py-1.5 text-neuro-400 hover:text-neuro-300 text-sm transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </button>
                )}
              </div>

              {isEditingNotes ? (
                <textarea
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  placeholder="Add your personal notes, observations, or insights here..."
                  rows={12}
                  className="w-full bg-black/40 border border-neuro-700 rounded-xl p-4 text-gray-300 placeholder-gray-600 focus:outline-none focus:border-neuro-500 resize-none"
                  autoFocus
                />
              ) : (
                <div className="bg-neuro-800/40 border border-neuro-700/50 rounded-xl p-6 min-h-[300px]">
                  {userData.notes ? (
                    <p className="text-gray-300 whitespace-pre-wrap">{userData.notes}</p>
                  ) : (
                    <p className="text-gray-600 italic">No notes yet. Click Edit to add your thoughts.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* FILE TAB */}
          {activeTab === 'file' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Current File Info */}
              <div className="bg-neuro-800/40 border border-neuro-700/50 rounded-xl p-6">
                <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
                  <FileUp className="w-5 h-5 text-neuro-400" />
                  Current Access File
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">File</span>
                    <span className="text-white font-mono">{accessSession.filename}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Plan</span>
                    <span className="text-white capitalize">{token.plan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">User ID</span>
                    <span className="text-gray-400 font-mono text-xs">{token.uid.slice(0, 8)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Expires</span>
                    <span className="text-white">
                      {token.exp === null || token.exp === 0 ? 'Never' : formatDate(token.exp * 1000)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Re-upload */}
              <div className="bg-neuro-800/40 border border-neuro-700/50 rounded-xl p-6">
                <h3 className="font-semibold text-white flex items-center gap-2 mb-2">
                  <RefreshCw className="w-5 h-5 text-neuro-400" />
                  Update Your File
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Upload a new .syns file to update your subscription or restore from backup.
                </p>
                
                <div
                  onDragOver={(e) => { e.preventDefault(); setFileDragOver(true); }}
                  onDragLeave={() => setFileDragOver(false)}
                  onDrop={handleFileDrop}
                  className={`
                    border-2 border-dashed rounded-xl p-8 text-center transition-colors
                    ${fileDragOver
                      ? 'border-neuro-500 bg-neuro-500/10'
                      : 'border-neuro-700/50 hover:border-neuro-600'
                    }
                  `}
                >
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                  <p className="text-sm text-gray-400">
                    Drag & drop your .syns file here
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    or click to browse
                  </p>
                </div>
              </div>

              {/* Get New File */}
              <div className="bg-neuro-800/40 border border-neuro-700/50 rounded-xl p-6">
                <h3 className="font-semibold text-white flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  Need a New File?
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  If your subscription expired or you lost your file, request a new access file.
                </p>
                <button
                  onClick={onRequestNewFile}
                  className="w-full py-3 border border-neuro-500/50 text-neuro-400 rounded-lg hover:bg-neuro-500/10 transition-colors"
                >
                  Request New Access File
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Prescription Modal */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-neuro-900 border border-neuro-700 w-full max-w-lg rounded-2xl shadow-2xl">
            <div className="px-6 py-4 border-b border-neuro-700/50 flex items-center justify-between">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Pill className="w-5 h-5 text-neuro-400" />
                Add Prescription
              </h3>
              <button
                onClick={() => setShowPrescriptionModal(false)}
                className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Title</label>
                <input
                  type="text"
                  value={prescriptionTitle}
                  onChange={(e) => setPrescriptionTitle(e.target.value)}
                  placeholder="e.g., Sleep Protocol Prescription"
                  className="w-full bg-black/40 border border-neuro-700 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-neuro-500"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Prescribed By (optional)</label>
                <input
                  type="text"
                  value={prescriptionDoctor}
                  onChange={(e) => setPrescriptionDoctor(e.target.value)}
                  placeholder="e.g., Dr. Smith"
                  className="w-full bg-black/40 border border-neuro-700 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-neuro-500"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Prescription Details</label>
                <textarea
                  value={prescriptionText}
                  onChange={(e) => setPrescriptionText(e.target.value)}
                  placeholder="Paste or type the prescription details here..."
                  rows={6}
                  className="w-full bg-black/40 border border-neuro-700 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-neuro-500 resize-none"
                />
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-neuro-700/50 flex justify-end gap-3">
              <button
                onClick={() => setShowPrescriptionModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPrescription}
                disabled={!prescriptionTitle.trim() || !prescriptionText.trim()}
                className="flex items-center gap-2 px-6 py-2 bg-neuro-500 text-black font-semibold rounded-lg hover:bg-neuro-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Prescription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
