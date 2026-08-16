/**
 * DataExportPanel — Selective data export with anonymization
 * 
 * Features:
 * - Select which data fields to export
 * - Preview before export
 * - Anonymization options
 * - Multiple export formats (JSON, CSV)
 * - Research-ready anonymized dataset generation
 */

import React, { useState, useMemo } from 'react';
import { 
  Download, 
  Eye, 
  EyeOff, 
  Shield, 
  FileJson, 
  FileSpreadsheet,
  Check,
  AlertTriangle,
  User,
  Clock,
  Activity,
  FileText,
  X
} from 'lucide-react';
import { UserData, SessionRecord, AccessSession } from '../types';

interface DataField {
  key: keyof UserData | 'sessions';
  label: string;
  description: string;
  icon: React.ReactNode;
  sensitive: boolean;
  researchRelevant: boolean;
}

const DATA_FIELDS: DataField[] = [
  { 
    key: 'displayName', 
    label: 'Display Name', 
    description: 'Your chosen username/pseudonym',
    icon: <User className="w-4 h-4" />,
    sensitive: true,
    researchRelevant: false
  },
  { 
    key: 'sessionsCompleted', 
    label: 'Session Count', 
    description: 'Total number of completed sessions',
    icon: <Activity className="w-4 h-4" />,
    sensitive: false,
    researchRelevant: true
  },
  { 
    key: 'totalMinutes', 
    label: 'Total Duration', 
    description: 'Cumulative time using SynSync',
    icon: <Clock className="w-4 h-4" />,
    sensitive: false,
    researchRelevant: true
  },
  { 
    key: 'favoriteProtocols', 
    label: 'Favorite Protocols', 
    description: 'Your bookmarked protocols',
    icon: <FileText className="w-4 h-4" />,
    sensitive: false,
    researchRelevant: true
  },
  { 
    key: 'sessions', 
    label: 'Session History', 
    description: 'Detailed log of all sessions',
    icon: <Activity className="w-4 h-4" />,
    sensitive: false,
    researchRelevant: true
  },
  { 
    key: 'notes', 
    label: 'Personal Notes', 
    description: 'Your private notes and reflections',
    icon: <FileText className="w-4 h-4" />,
    sensitive: true,
    researchRelevant: false
  },
  { 
    key: 'preferences', 
    label: 'Preferences', 
    description: 'App settings and preferences',
    icon: <FileText className="w-4 h-4" />,
    sensitive: false,
    researchRelevant: false
  },
];

interface DataExportPanelProps {
  isOpen: boolean;
  onClose: () => void;
  accessSession: AccessSession;
}

interface ExportOptions {
  fields: Set<string>;
  anonymize: boolean;
  format: 'json' | 'csv';
  includeTimestamp: boolean;
}

export const DataExportPanel: React.FC<DataExportPanelProps> = ({
  isOpen,
  onClose,
  accessSession,
}) => {
  const [options, setOptions] = useState<ExportOptions>({
    fields: new Set(['sessionsCompleted', 'totalMinutes', 'favoriteProtocols', 'sessions']),
    anonymize: true,
    format: 'json',
    includeTimestamp: true,
  });
  const [showPreview, setShowPreview] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const { userData } = accessSession;

  // Generate preview of what will be exported
  const previewData = useMemo(() => {
    const data: Partial<UserData & { sessions?: SessionRecord[] }> = {};
    
    options.fields.forEach(field => {
      if (field === 'sessions') {
        data.sessions = userData.history || [];
      } else {
        (data as any)[field] = userData[field as keyof UserData];
      }
    });

    // Apply anonymization
    if (options.anonymize) {
      delete (data as any).displayName;
      delete (data as any).notes;
      delete (data as any).preferences;
      
      // Anonymize session records - remove precise timestamps
      if (data.sessions) {
        data.sessions = data.sessions.map(session => ({
          ...session,
          // Keep only hour of day, not full timestamp
          timestamp: anonymizeTimestamp(session.timestamp),
        }));
      }
    }

    // Add metadata
    const exportPackage = {
      meta: {
        exportedAt: new Date().toISOString(),
        anonymized: options.anonymize,
        version: '1.0',
        purpose: options.anonymize ? 'research' : 'personal_backup',
      },
      data,
    };

    return exportPackage;
  }, [options, userData]);

  function anonymizeTimestamp(timestamp: number): number {
    const date = new Date(timestamp);
    // Round to nearest hour, keep only day/hour pattern
    date.setMinutes(0, 0, 0);
    return date.getTime();
  }

  const toggleField = (fieldKey: string) => {
    setOptions(prev => {
      const newFields = new Set(prev.fields);
      if (newFields.has(fieldKey)) {
        newFields.delete(fieldKey);
      } else {
        newFields.add(fieldKey);
      }
      return { ...prev, fields: newFields };
    });
  };

  const selectResearchPreset = () => {
    setOptions(prev => ({
      ...prev,
      fields: new Set(DATA_FIELDS.filter(f => f.researchRelevant).map(f => f.key)),
      anonymize: true,
      format: 'json',
    }));
  };

  const selectFullBackup = () => {
    setOptions(prev => ({
      ...prev,
      fields: new Set(DATA_FIELDS.map(f => f.key)),
      anonymize: false,
      format: 'json',
    }));
  };

  const handleExport = () => {
    const filename = `synsync_export_${options.anonymize ? 'anonymized' : 'full'}_${new Date().toISOString().split('T')[0]}.${options.format}`;
    
    let content: string;
    let mimeType: string;

    if (options.format === 'json') {
      content = JSON.stringify(previewData, null, 2);
      mimeType = 'application/json';
    } else {
      // Simple CSV conversion for sessions
      const sessions = previewData.data.sessions || [];
      const headers = ['protocolId', 'timestamp', 'durationMs'];
      const rows = sessions.map(s => [s.protocolId, s.timestamp, s.durationMs].join(','));
      content = [headers.join(','), ...rows].join('\n');
      mimeType = 'text/csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  if (!isOpen) return null;

  const selectedCount = options.fields.size;
  const sensitiveCount = DATA_FIELDS.filter(f => options.fields.has(f.key) && f.sensitive).length;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-neuro-900 border border-neuro-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-neuro-700/50 bg-neuro-900/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-neuro-500/10">
              <Download className="w-5 h-5 text-neuro-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Export Your Data</h2>
              <p className="text-xs text-gray-500">Selective export with privacy controls</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          
          {/* Quick Presets */}
          <div className="flex gap-3">
            <button
              onClick={selectResearchPreset}
              className="flex-1 p-3 bg-purple-900/20 border border-purple-500/30 rounded-xl hover:bg-purple-900/30 transition-colors text-left"
            >
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-purple-400" />
                <span className="font-semibold text-purple-300 text-sm">Research Export</span>
              </div>
              <p className="text-xs text-purple-200/60">
                Anonymized data for science
              </p>
            </button>
            <button
              onClick={selectFullBackup}
              className="flex-1 p-3 bg-blue-900/20 border border-blue-500/30 rounded-xl hover:bg-blue-900/30 transition-colors text-left"
            >
              <div className="flex items-center gap-2 mb-1">
                <FileJson className="w-4 h-4 text-blue-400" />
                <span className="font-semibold text-blue-300 text-sm">Full Backup</span>
              </div>
              <p className="text-xs text-blue-200/60">
                Complete personal archive
              </p>
            </button>
          </div>

          {/* Data Fields */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white text-sm">Select Data Fields</h3>
              <span className="text-xs text-gray-500">{selectedCount} selected</span>
            </div>

            <div className="space-y-2">
              {DATA_FIELDS.map((field) => {
                const isSelected = options.fields.has(field.key);
                const willBeAnonymized = options.anonymize && field.sensitive;

                return (
                  <div
                    key={field.key}
                    className={`
                      flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer
                      ${isSelected 
                        ? 'bg-neuro-800/60 border-neuro-500/50' 
                        : 'bg-neuro-800/20 border-neuro-700/30 hover:bg-neuro-800/40'
                      }
                    `}
                    onClick={() => toggleField(field.key)}
                  >
                    <div className={`
                      w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors
                      ${isSelected ? 'bg-neuro-500 border-neuro-500' : 'border-gray-600'}
                    `}>
                      {isSelected && <Check className="w-3 h-3 text-black" />}
                    </div>

                    <div className="text-neuro-400">{field.icon}</div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium text-sm ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                          {field.label}
                        </span>
                        {field.sensitive && (
                          <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded">
                            Personal
                          </span>
                        )}
                        {field.researchRelevant && (
                          <span className="text-[10px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded">
                            Research
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{field.description}</p>
                    </div>

                    {willBeAnonymized && (
                      <div className="flex items-center gap-1 text-xs text-green-400">
                        <Shield className="w-3 h-3" />
                        <span>Anon</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Anonymization Toggle */}
          {sensitiveCount > 0 && (
            <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-xl">
              <div 
                className="flex items-start gap-3 cursor-pointer"
                onClick={() => setOptions(prev => ({ ...prev, anonymize: !prev.anonymize }))}
              >
                <div className={`
                  w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors
                  ${options.anonymize ? 'bg-green-500 border-green-500' : 'border-gray-600'}
                `}>
                  {options.anonymize && <Check className="w-3 h-3 text-black" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span className="font-semibold text-green-300 text-sm">Anonymize Export</span>
                  </div>
                  <p className="text-xs text-green-200/70 mt-1">
                    Remove {sensitiveCount} personal field{sensitiveCount > 1 ? 's' : ''} 
                    (display name, notes) and generalize timestamps to hour-only.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Format Selection */}
          <div className="space-y-3">
            <h3 className="font-semibold text-white text-sm">Export Format</h3>
            <div className="flex gap-3">
              <button
                onClick={() => setOptions(prev => ({ ...prev, format: 'json' }))}
                className={`
                  flex-1 flex items-center gap-3 p-3 rounded-xl border transition-colors
                  ${options.format === 'json' 
                    ? 'bg-neuro-800/60 border-neuro-500/50' 
                    : 'bg-neuro-800/20 border-neuro-700/30 hover:bg-neuro-800/40'
                  }
                `}
              >
                <FileJson className={`w-5 h-5 ${options.format === 'json' ? 'text-neuro-400' : 'text-gray-500'}`} />
                <div className="text-left">
                  <div className={`font-medium text-sm ${options.format === 'json' ? 'text-white' : 'text-gray-400'}`}>
                    JSON
                  </div>
                  <div className="text-xs text-gray-500">Full structured data</div>
                </div>
              </button>
              <button
                onClick={() => setOptions(prev => ({ ...prev, format: 'csv' }))}
                className={`
                  flex-1 flex items-center gap-3 p-3 rounded-xl border transition-colors
                  ${options.format === 'csv' 
                    ? 'bg-neuro-800/60 border-neuro-500/50' 
                    : 'bg-neuro-800/20 border-neuro-700/30 hover:bg-neuro-800/40'
                  }
                `}
              >
                <FileSpreadsheet className={`w-5 h-5 ${options.format === 'csv' ? 'text-neuro-400' : 'text-gray-500'}`} />
                <div className="text-left">
                  <div className={`font-medium text-sm ${options.format === 'csv' ? 'text-white' : 'text-gray-400'}`}>
                    CSV
                  </div>
                  <div className="text-xs text-gray-500">Sessions only</div>
                </div>
              </button>
            </div>
          </div>

          {/* Preview Toggle */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 text-sm text-neuro-400 hover:text-neuro-300 transition-colors"
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>

          {/* Preview */}
          {showPreview && (
            <div className="bg-black/50 border border-neuro-700/50 rounded-xl p-4 overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">Preview</span>
                <span className="text-xs text-gray-500">
                  ~{JSON.stringify(previewData).length} bytes
                </span>
              </div>
              <pre className="text-xs text-gray-300 overflow-x-auto custom-scrollbar max-h-48">
                {JSON.stringify(previewData, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neuro-700/50 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {options.anonymize ? (
              <span className="flex items-center gap-1 text-green-400">
                <Shield className="w-3 h-3" />
                Privacy-protected export
              </span>
            ) : sensitiveCount > 0 ? (
              <span className="flex items-center gap-1 text-yellow-400">
                <AlertTriangle className="w-3 h-3" />
                Contains personal data
              </span>
            ) : (
              <span>No personal data included</span>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={selectedCount === 0}
              className={`
                flex items-center gap-2 px-6 py-2 font-semibold rounded-lg transition-colors
                ${exportSuccess
                  ? 'bg-green-500 text-black'
                  : 'bg-neuro-500 text-black hover:bg-neuro-400 disabled:opacity-50 disabled:cursor-not-allowed'
                }
              `}
            >
              {exportSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  Exported!
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export {selectedCount} Field{selectedCount !== 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export type { ExportOptions };
