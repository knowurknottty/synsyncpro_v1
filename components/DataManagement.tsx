// src/components/DataManagement.tsx
// Export, import, and delete user data - privacy-first

import React, { useState } from 'react';
import { Download, Upload, Trash2, Shield, AlertTriangle, CheckCircle, HardDrive } from 'lucide-react';
import { LocalStorageManager } from '../src/utils/local-storage-manager';

/**
 * Data management component
 * Export, import, and delete all user data
 * Complete transparency and user control
 */
export const DataManagement: React.FC = () => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  const storageSize = LocalStorageManager.getStorageSize();
  const storageMB = (storageSize / 1024 / 1024).toFixed(2);

  const handleExport = () => {
    try {
      const data = LocalStorageManager.exportAllData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `synsync_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const success = LocalStorageManager.importData(text);

      if (success) {
        setImportSuccess(true);
        setImportError(null);
        setTimeout(() => {
          window.location.reload(); // Refresh to show imported data
        }, 2000);
      } else {
        setImportError('Invalid data format');
        setImportSuccess(false);
      }
    } catch (error) {
      console.error('Import error:', error);
      setImportError('Failed to import data. Please check the file format.');
      setImportSuccess(false);
    }

    // Clear input
    event.target.value = '';
  };

  const handleDeleteAll = () => {
    LocalStorageManager.clearAllData();
    setShowDeleteConfirm(false);
    alert('All data deleted successfully');
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Shield className="w-7 h-7 text-neuro-400" />
          Data Management
        </h2>
        <p className="text-sm text-gray-400">
          Your data, your control. Export, import, or delete anytime.
        </p>
      </div>

      {/* Storage Info */}
      <div className="p-6 rounded-lg bg-neuro-900/40 border border-neuro-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-neuro-500/20">
            <HardDrive className="w-5 h-5 text-neuro-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Storage Usage</h3>
            <p className="text-sm text-gray-400">Local device storage</p>
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-white">{storageMB}</span>
          <span className="text-sm text-gray-400">MB</span>
        </div>

        <p className="text-xs text-gray-500 mt-2">
          All data is stored locally on your device. We never see or access it.
        </p>
      </div>

      {/* Export */}
      <div className="p-6 rounded-lg bg-gradient-to-br from-green-800/20 to-green-800/10 border border-green-700/30">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-green-500/20">
            <Download className="w-6 h-6 text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">Export Your Data</h3>
            <p className="text-sm text-gray-400 mb-4">
              Download all your routines, sessions, and progress data as a JSON file.
              Use this to backup your data or transfer to another device.
            </p>
            <button
              onClick={handleExport}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export All Data
            </button>
          </div>
        </div>
      </div>

      {/* Import */}
      <div className="p-6 rounded-lg bg-gradient-to-br from-blue-800/20 to-blue-800/10 border border-blue-700/30">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-blue-500/20">
            <Upload className="w-6 h-6 text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">Import Data</h3>
            <p className="text-sm text-gray-400 mb-4">
              Restore from a previous export or transfer data from another device.
              This will merge with your existing data.
            </p>

            {importSuccess && (
              <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <p className="text-sm text-green-300">
                  Data imported successfully! Refreshing...
                </p>
              </div>
            )}

            {importError && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <p className="text-sm text-red-300">{importError}</p>
              </div>
            )}

            <label className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors cursor-pointer">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <span className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Choose File to Import
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Delete */}
      <div className="p-6 rounded-lg bg-gradient-to-br from-red-800/20 to-red-800/10 border border-red-700/30">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-red-500/20">
            <Trash2 className="w-6 h-6 text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">Delete All Data</h3>
            <p className="text-sm text-gray-400 mb-4">
              Permanently delete all your routines, sessions, and progress data from this device.
              This cannot be undone unless you have an export.
            </p>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete All Data
              </button>
            ) : (
              <div className="space-y-3">
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                  <div className="flex items-start gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-300 mb-1">
                        Are you absolutely sure?
                      </p>
                      <p className="text-xs text-red-200">
                        This will permanently delete all your data. This action cannot be undone.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDeleteAll}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors"
                    >
                      Yes, Delete Everything
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="p-6 rounded-lg bg-purple-500/10 border border-purple-500/30">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-2 text-sm text-purple-200 leading-relaxed">
            <p className="font-semibold text-purple-300">🔒 Privacy Guarantee</p>
            <ul className="space-y-1 text-xs">
              <li>• All data stored locally on your device</li>
              <li>• Never transmitted to our servers</li>
              <li>• No tracking, no analytics, no surveillance</li>
              <li>• You can export and delete anytime</li>
              <li>• Open source - verify the code yourself</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Technical Details */}
      <details className="p-4 rounded-lg bg-neuro-800/30 border border-neuro-700">
        <summary className="text-sm font-medium text-white cursor-pointer hover:text-neuro-400 transition-colors">
          Technical Details
        </summary>
        <div className="mt-3 space-y-2 text-xs text-gray-400">
          <p><strong className="text-gray-300">Storage Method:</strong> Browser localStorage API</p>
          <p><strong className="text-gray-300">Data Format:</strong> JSON (human-readable)</p>
          <p><strong className="text-gray-300">Encryption:</strong> None (data never leaves your device)</p>
          <p><strong className="text-gray-300">Persistence:</strong> Until you clear browser data or delete manually</p>
          <p><strong className="text-gray-300">Backup:</strong> Not automatic - you must export manually</p>
        </div>
      </details>
    </div>
  );
};
