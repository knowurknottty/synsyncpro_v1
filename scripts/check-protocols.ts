// scripts/check-protocols.ts
// Protocol validation runner for CI/CD and local development

import { validateProtocols, ProtocolIssue } from '../services/validateProtocols';
import { PROTOCOLS } from '../constants';

function formatIssue(issue: ProtocolIssue): string {
  const scope = issue.phaseId
    ? `${issue.protocolId}/${issue.phaseId}`
    : issue.protocolId;
  return `[${issue.level.toUpperCase()}] ${scope}: ${issue.message}`;
}

function main(): void {
  
  const issues = validateProtocols(PROTOCOLS);

  if (issues.length === 0) {
    process.exit(0);
  }

  // Separate errors and warnings
  const errors = issues.filter(i => i.level === 'error');
  const warnings = issues.filter(i => i.level === 'warning');

  // Print errors first
  if (errors.length > 0) {
  }

  // Print warnings
  if (warnings.length > 0) {
  }

  // Summary

  // Exit with error code if any errors found
  const hasErrors = errors.length > 0;
  process.exit(hasErrors ? 1 : 0);
}

// Run validation
main();
