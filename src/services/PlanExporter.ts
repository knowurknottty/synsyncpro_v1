/**
 * Plan Exporter Service
 *
 * Exports plan data in JSON, CSV formats
 */

import type { ExportOptions } from '../types/plan';
import {
  getPlan,
  getSessionsByPlan,
  getMetricsByPlan,
  getCheckInsByPlan,
} from './PlanDatabase';

/**
 * Export plan data as JSON
 */
export async function exportJSON(
  planId: string,
  options: ExportOptions
): Promise<string> {
  const plan = await getPlan(planId);
  const sessions = await getSessionsByPlan(planId);
  const metrics = await getMetricsByPlan(planId);
  const checkIns = await getCheckInsByPlan(planId);

  // Filter by date range
  let filteredSessions = sessions;
  let filteredMetrics = metrics;
  let filteredCheckIns = checkIns;

  if (options.date_range) {
    const { start, end } = options.date_range;
    filteredSessions = sessions.filter(
      (s) => s.scheduled_time >= start && s.scheduled_time <= end
    );
    filteredMetrics = metrics.filter(
      (m) => m.timestamp >= start && m.timestamp <= end
    );
    filteredCheckIns = checkIns.filter(
      (c) => c.completed_at >= start && c.completed_at <= end
    );
  }

  // Remove personal info if requested
  if (options.anonymize) {
    if (plan) {
      plan.meta.practitioner.name = 'Practitioner';
      plan.meta.practitioner.contact_email = undefined;
      plan.meta.practitioner.license_number = undefined;
    }
  }

  // Remove notes if requested
  if (!options.include_subjective_notes) {
    filteredSessions.forEach((s) => {
      s.notes = undefined;
    });
  }

  const exportData = {
    plan,
    sessions: filteredSessions,
    metrics: filteredMetrics,
    check_ins: filteredCheckIns,
    exported_at: new Date().toISOString(),
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Export session data as CSV
 */
export async function exportCSV(
  planId: string,
  options: ExportOptions
): Promise<string> {
  const sessions = await getSessionsByPlan(planId);

  // Filter by date range
  let filteredSessions = sessions;
  if (options.date_range) {
    const { start, end } = options.date_range;
    filteredSessions = sessions.filter(
      (s) => s.scheduled_time >= start && s.scheduled_time <= end
    );
  }

  // CSV header
  const headers = [
    'Date',
    'Time',
    'Protocol ID',
    'Status',
    'Duration (min)',
    'Notes',
  ];

  const rows = filteredSessions.map((session) => {
    const date = new Date(session.scheduled_time);
    const duration = session.duration_seconds
      ? Math.round(session.duration_seconds / 60)
      : '';
    const notes =
      options.include_subjective_notes && session.notes
        ? `"${session.notes.replace(/"/g, '""')}"`
        : '';

    return [
      date.toLocaleDateString(),
      date.toLocaleTimeString(),
      session.protocol_id,
      session.status,
      duration,
      notes,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Download exported data
 */
export function downloadExport(
  data: string,
  filename: string,
  mimeType: string
): void {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export as JSON file
 */
export async function exportJSONFile(
  planId: string,
  options: ExportOptions
): Promise<void> {
  const json = await exportJSON(planId, options);
  const filename = `plan-${planId}-${Date.now()}.json`;
  downloadExport(json, filename, 'application/json');
}

/**
 * Export as CSV file
 */
export async function exportCSVFile(
  planId: string,
  options: ExportOptions
): Promise<void> {
  const csv = await exportCSV(planId, options);
  const filename = `plan-${planId}-${Date.now()}.csv`;
  downloadExport(csv, filename, 'text/csv');
}
