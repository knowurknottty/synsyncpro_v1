/**
 * Plan Importer Component
 *
 * Drag-and-drop interface for importing practitioner-created protocol plans
 * Handles file upload, validation, and import flow
 */

import React, { useState, useCallback, useRef } from 'react';
import { Upload, FileJson, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { parseAndValidateJSON } from '../services/PlanValidator';
import { savePlan } from '../services/PlanDatabase';
import type { ImportResult, ProtocolPlan } from '../types/plan';

interface PlanImporterProps {
  onImportSuccess: (planId: string) => void;
  onCancel?: () => void;
}

export const PlanImporter: React.FC<PlanImporterProps> = ({
  onImportSuccess,
  onCancel,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [validationResult, setValidationResult] = useState<ImportResult | null>(null);
  const [parsedPlan, setParsedPlan] = useState<ProtocolPlan | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handle file selection
   */
  const handleFileSelect = useCallback(async (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.json')) {
      setValidationResult({
        success: false,
        errors: [
          {
            path: 'root',
            message: 'File must be a JSON file (.json)',
            severity: 'error',
          },
        ],
        warnings: [],
        tampered: false,
      });
      return;
    }

    setFile(selectedFile);
    setUploading(true);
    setValidationResult(null);
    setParsedPlan(null);

    try {
      // Read file content
      const content = await selectedFile.text();

      // Validate
      const result = await parseAndValidateJSON(content);
      setValidationResult(result);

      if (result.success || result.errors.length === 0 || hasOnlyWarnings(result)) {
        const plan = JSON.parse(content);
        setParsedPlan(plan);
      }
    } catch (err) {
      setValidationResult({
        success: false,
        errors: [
          {
            path: 'root',
            message: err instanceof Error ? err.message : 'Unknown error',
            severity: 'error',
          },
        ],
        warnings: [],
        tampered: false,
      });
    } finally {
      setUploading(false);
    }
  }, []);

  /**
   * Drag and drop handlers
   */
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  /**
   * File input change handler
   */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  /**
   * Import plan to database
   */
  const handleImport = useCallback(async () => {
    if (!parsedPlan) return;

    setUploading(true);

    try {
      const planId = await savePlan(parsedPlan);
      onImportSuccess(planId);
    } catch (err) {
      setValidationResult({
        ...validationResult!,
        errors: [
          ...validationResult!.errors,
          {
            path: 'database',
            message: `Failed to save plan: ${err instanceof Error ? err.message : 'Unknown error'}`,
            severity: 'error',
          },
        ],
      });
    } finally {
      setUploading(false);
    }
  }, [parsedPlan, validationResult, onImportSuccess]);

  /**
   * Reset state
   */
  const handleReset = useCallback(() => {
    setFile(null);
    setValidationResult(null);
    setParsedPlan(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  /**
   * Check if result has only warnings
   */
  function hasOnlyWarnings(result: ImportResult): boolean {
    return result.errors.length === 0 && result.warnings.length > 0;
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Drop zone */}
      {!file && (
        <div
          className={`
            border-2 border-dashed rounded-xl p-12 text-center transition-all
            ${
              isDragging
                ? 'border-neuro-400 bg-neuro-500/10'
                : 'border-gray-700 hover:border-gray-600'
            }
          `}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <Upload
            className={`w-16 h-16 mx-auto mb-4 ${
              isDragging ? 'text-neuro-400' : 'text-gray-500'
            }`}
          />
          <h3 className="text-lg font-medium text-white mb-2">
            Import Protocol Plan
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Drag and drop a plan JSON file or click to browse
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleInputChange}
            className="hidden"
            id="plan-file-input"
          />
          <label
            htmlFor="plan-file-input"
            className="inline-block px-6 py-2 bg-neuro-500 hover:bg-neuro-600 text-white rounded-lg cursor-pointer transition-colors"
          >
            Browse Files
          </label>
        </div>
      )}

      {/* File info and validation */}
      {file && (
        <div className="space-y-4">
          {/* File info */}
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl">
            <div className="flex items-center space-x-3">
              <FileJson className="w-8 h-8 text-neuro-400" />
              <div>
                <p className="text-sm font-medium text-white">{file.name}</p>
                <p className="text-xs text-gray-400">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Remove file"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Upload progress */}
          {uploading && !validationResult && (
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 border-4 border-neuro-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-400">Validating plan...</p>
              </div>
            </div>
          )}

          {/* Validation results */}
          {validationResult && (
            <div className="space-y-3">
              {/* Errors */}
              {validationResult.errors.length > 0 && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-red-400 mb-2">
                        Validation Errors
                      </h4>
                      <ul className="space-y-1">
                        {validationResult.errors.map((error, idx) => (
                          <li key={idx} className="text-xs text-red-300">
                            <span className="font-medium">{error.path}:</span>{' '}
                            {error.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Warnings */}
              {validationResult.warnings.length > 0 && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-yellow-400 mb-2">
                        Warnings
                      </h4>
                      <ul className="space-y-1">
                        {validationResult.warnings.map((warning, idx) => (
                          <li key={idx} className="text-xs text-yellow-300">
                            <span className="font-medium">{warning.path}:</span>{' '}
                            {warning.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Tamper warning */}
              {validationResult.tampered && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-red-400 mb-1">
                        Security Warning
                      </h4>
                      <p className="text-xs text-red-300">
                        This plan has been tampered with. The security hash does not
                        match the plan content. Do not import plans from untrusted
                        sources.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Success */}
              {validationResult.success && !validationResult.tampered && (
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <div>
                      <h4 className="text-sm font-medium text-green-400">
                        Plan Validated Successfully
                      </h4>
                      <p className="text-xs text-green-300 mt-1">
                        {parsedPlan?.plan.title || 'Unnamed Plan'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            <button
              onClick={onCancel || handleReset}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>

            <div className="flex items-center space-x-3">
              {validationResult && validationResult.warnings.length > 0 && (
                <p className="text-xs text-gray-500">
                  Warnings can be ignored
                </p>
              )}

              <button
                onClick={handleImport}
                disabled={
                  !parsedPlan ||
                  uploading ||
                  (validationResult?.errors?.length ?? 0) > 0 ||
                  validationResult?.tampered
                }
                className="px-6 py-2 bg-neuro-500 hover:bg-neuro-600 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
              >
                {uploading ? 'Importing...' : 'Import Plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
