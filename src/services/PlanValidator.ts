/**
 * JSON Schema Validator for Protocol Plans
 *
 * Validates imported plans against PROTOCOL_PLAN_SCHEMA.json
 * Checks protocol IDs, dates, timezone, and business logic
 */

import Ajv, { ValidateFunction, ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import type { ProtocolPlan, ValidationError, ImportResult } from '../types/plan';
import { PROTOCOLS } from '../audio/constants';
import {
  isValidTimezone,
  isValidISODate,
  isValidHashFormat,
  detectTampering,
} from '../utils/SecurityUtils';

/**
 * Initialize Ajv validator with schema
 */
let validateFunction: ValidateFunction | null = null;
let schemaCache: any = null;

async function loadSchema(): Promise<any> {
  if (schemaCache) return schemaCache;

  try {
    const response = await fetch('/PROTOCOL_PLAN_SCHEMA.json');
    schemaCache = await response.json();
    return schemaCache;
  } catch (err) {
    console.error('Failed to load protocol plan schema:', err);
    throw new Error('Could not load validation schema');
  }
}

async function getValidator(): Promise<ValidateFunction> {
  if (!validateFunction) {
    const schema = await loadSchema();

    const ajv = new Ajv({
      allErrors: true,
      verbose: true,
      strict: false, // Allow additional properties not in schema
    });

    // Add format validators (email, date-time, uuid, etc.)
    addFormats(ajv);

    // Compile schema
    validateFunction = ajv.compile(schema);
  }

  return validateFunction;
}

/**
 * Validate protocol plan against JSON schema
 * Returns validation result with errors and warnings
 */
export async function validateProtocolPlan(plan: any): Promise<ImportResult> {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Step 1: JSON Schema validation
  const validator = await getValidator();
  const valid = validator(plan);

  if (!valid && validator.errors) {
    errors.push(...mapAjvErrors(validator.errors));
  }

  // If schema validation failed catastrophically, return early
  if (errors.some((e) => e.severity === 'error')) {
    return {
      success: false,
      errors,
      warnings,
      tampered: false,
    };
  }

  // Step 2: Protocol ID validation
  validateProtocolIds(plan, errors, warnings);

  // Step 3: Timezone validation
  if (plan.schedule?.timezone) {
    if (!isValidTimezone(plan.schedule.timezone)) {
      errors.push({
        path: 'schedule.timezone',
        message: `Invalid timezone: ${plan.schedule.timezone}`,
        severity: 'error',
      });
    }
  }

  // Step 4: Date validation
  validateDates(plan, errors, warnings);

  // Step 5: Hash format validation
  if (plan.security?.plan_hash) {
    if (!isValidHashFormat(plan.security.plan_hash)) {
      warnings.push({
        path: 'security.plan_hash',
        message: 'Invalid hash format (expected 64 hex characters)',
        severity: 'warning',
      });
    }
  } else {
    warnings.push({
      path: 'security.plan_hash',
      message: 'No hash provided - cannot verify plan integrity',
      severity: 'warning',
    });
  }

  // Step 6: Tamper detection
  let tampered = false;
  try {
    tampered = await detectTampering(plan as ProtocolPlan);
    if (tampered) {
      errors.push({
        path: 'security',
        message: 'Plan has been tampered with - hash verification failed',
        severity: 'error',
      });
    }
  } catch (err) {
    warnings.push({
      path: 'security',
      message: 'Could not verify plan integrity',
      severity: 'warning',
    });
  }

  // Step 7: Business logic validation
  validateBusinessLogic(plan, errors, warnings);

  // Success if no critical errors
  const success = errors.length === 0;

  return {
    success,
    errors,
    warnings,
    tampered,
  };
}

/**
 * Validate that all protocol IDs exist in PROTOCOLS constant
 */
function validateProtocolIds(
  plan: any,
  errors: ValidationError[],
  warnings: ValidationError[]
): void {
  const protocolIds = new Set<string>();

  // Collect protocol IDs from schedule phases
  if (plan.schedule?.phases) {
    plan.schedule.phases.forEach((phase: any, phaseIdx: number) => {
      if (phase.sessions) {
        phase.sessions.forEach((session: any, sessionIdx: number) => {
          if (session.protocol_id) {
            protocolIds.add(session.protocol_id);

            // Check if protocol exists
            if (!PROTOCOLS[session.protocol_id]) {
              errors.push({
                path: `schedule.phases[${phaseIdx}].sessions[${sessionIdx}].protocol_id`,
                message: `Unknown protocol ID: ${session.protocol_id}`,
                severity: 'error',
              });
            }
          }
        });
      }
    });
  }

  // Collect protocol IDs from maintenance
  if (plan.schedule?.maintenance?.protocols) {
    plan.schedule.maintenance.protocols.forEach((protocolId: string, idx: number) => {
      protocolIds.add(protocolId);

      if (!PROTOCOLS[protocolId]) {
        errors.push({
          path: `schedule.maintenance.protocols[${idx}]`,
          message: `Unknown protocol ID: ${protocolId}`,
          severity: 'error',
        });
      }
    });
  }

  // Check allowed/restricted protocols
  if (plan.protocols?.allowed_protocols) {
    plan.protocols.allowed_protocols.forEach((protocolId: string, idx: number) => {
      if (!PROTOCOLS[protocolId]) {
        warnings.push({
          path: `protocols.allowed_protocols[${idx}]`,
          message: `Unknown protocol ID in allowed list: ${protocolId}`,
          severity: 'warning',
        });
      }
    });
  }

  if (plan.protocols?.restricted_protocols) {
    plan.protocols.restricted_protocols.forEach((protocolId: string, idx: number) => {
      if (!PROTOCOLS[protocolId]) {
        warnings.push({
          path: `protocols.restricted_protocols[${idx}]`,
          message: `Unknown protocol ID in restricted list: ${protocolId}`,
          severity: 'warning',
        });
      }
    });
  }

  // Warn if no protocols used
  if (protocolIds.size === 0) {
    warnings.push({
      path: 'schedule',
      message: 'No sessions scheduled - plan contains no protocols',
      severity: 'warning',
    });
  }
}

/**
 * Validate date fields
 */
function validateDates(
  plan: any,
  errors: ValidationError[],
  warnings: ValidationError[]
): void {
  // Check meta.created_date
  if (plan.meta?.created_date && !isValidISODate(plan.meta.created_date)) {
    errors.push({
      path: 'meta.created_date',
      message: 'Invalid ISO 8601 date format',
      severity: 'error',
    });
  }

  // Check schedule.start_date if provided
  if (plan.schedule?.start_date) {
    if (!isValidISODate(plan.schedule.start_date)) {
      errors.push({
        path: 'schedule.start_date',
        message: 'Invalid ISO 8601 date format',
        severity: 'error',
      });
    } else {
      // Check if start date is in the past
      const startDate = new Date(plan.schedule.start_date);
      const now = new Date();
      const daysDiff = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

      if (daysDiff < -7) {
        warnings.push({
          path: 'schedule.start_date',
          message: 'Start date is more than 7 days in the past',
          severity: 'warning',
        });
      }
    }
  }
}

/**
 * Validate business logic rules
 */
function validateBusinessLogic(
  plan: any,
  errors: ValidationError[],
  warnings: ValidationError[]
): void {
  // Check phase continuity (no gaps)
  if (plan.schedule?.phases) {
    const phases = plan.schedule.phases;
    let expectedStartDay = 1;

    phases.forEach((phase: any, idx: number) => {
      if (phase.start_day !== expectedStartDay) {
        warnings.push({
          path: `schedule.phases[${idx}].start_day`,
          message: `Phase gap detected: expected start_day ${expectedStartDay}, got ${phase.start_day}`,
          severity: 'warning',
        });
      }

      expectedStartDay = phase.start_day + phase.duration_days;
    });
  }

  // Check that required metrics have proper frequency
  if (plan.tracking?.required_metrics) {
    plan.tracking.required_metrics.forEach((metric: any, idx: number) => {
      if (metric.type === 'scale') {
        if (
          metric.scale_min === undefined ||
          metric.scale_max === undefined
        ) {
          errors.push({
            path: `tracking.required_metrics[${idx}]`,
            message: 'Scale metrics must define scale_min and scale_max',
            severity: 'error',
          });
        }
      }
    });
  }

  // Check conditional logic references valid metrics
  if (plan.conditional_logic) {
    const metricIds = new Set<string>();
    [...(plan.tracking?.required_metrics || []), ...(plan.tracking?.optional_metrics || [])].forEach(
      (m: any) => {
        if (m.metric_id) metricIds.add(m.metric_id);
      }
    );

    plan.conditional_logic.forEach((rule: any, idx: number) => {
      if (rule.condition?.metric_id && !metricIds.has(rule.condition.metric_id)) {
        warnings.push({
          path: `conditional_logic[${idx}].condition.metric_id`,
          message: `Conditional rule references unknown metric: ${rule.condition.metric_id}`,
          severity: 'warning',
        });
      }

      // Check suggest_extra_session has protocol_id
      if (
        rule.action?.type === 'suggest_extra_session' &&
        !rule.action.protocol_id
      ) {
        errors.push({
          path: `conditional_logic[${idx}].action`,
          message: 'suggest_extra_session action requires protocol_id',
          severity: 'error',
        });
      }

      // Check extend_phase has days_to_add
      if (rule.action?.type === 'extend_phase' && !rule.action.days_to_add) {
        errors.push({
          path: `conditional_logic[${idx}].action`,
          message: 'extend_phase action requires days_to_add',
          severity: 'error',
        });
      }
    });
  }

  // Check duration makes sense
  if (plan.plan?.duration_weeks) {
    const totalDays = plan.schedule?.phases?.reduce(
      (sum: number, phase: any) => sum + (phase.duration_days || 0),
      0
    ) || 0;

    const expectedDays = plan.plan.duration_weeks * 7;
    const daysDiff = Math.abs(totalDays - expectedDays);

    if (daysDiff > 7) {
      warnings.push({
        path: 'plan.duration_weeks',
        message: `Duration mismatch: plan specifies ${plan.plan.duration_weeks} weeks (${expectedDays} days) but phases total ${totalDays} days`,
        severity: 'warning',
      });
    }
  }
}

/**
 * Map Ajv errors to ValidationError format
 */
function mapAjvErrors(ajvErrors: ErrorObject[]): ValidationError[] {
  return ajvErrors.map((error) => {
    let path = error.instancePath || error.schemaPath;
    if (path.startsWith('/')) path = path.slice(1);
    path = path.replace(/\//g, '.');

    let message = error.message || 'Validation failed';

    // Enhance message based on keyword
    if (error.keyword === 'required') {
      message = `Missing required field: ${error.params.missingProperty}`;
    } else if (error.keyword === 'enum') {
      message = `Invalid value. Allowed values: ${error.params.allowedValues.join(', ')}`;
    } else if (error.keyword === 'type') {
      message = `Invalid type: expected ${error.params.type}`;
    } else if (error.keyword === 'pattern') {
      message = `Value does not match required pattern`;
    }

    return {
      path: path || 'root',
      message,
      severity: 'error',
    };
  });
}

/**
 * Quick validation check (returns true/false)
 */
export async function isValidProtocolPlan(plan: any): Promise<boolean> {
  const result = await validateProtocolPlan(plan);
  return result.success;
}

/**
 * Parse JSON file and validate
 */
export async function parseAndValidateJSON(jsonString: string): Promise<ImportResult> {
  try {
    const plan = JSON.parse(jsonString);
    return await validateProtocolPlan(plan);
  } catch (err) {
    return {
      success: false,
      errors: [
        {
          path: 'root',
          message: `Invalid JSON: ${err instanceof Error ? err.message : 'Unknown error'}`,
          severity: 'error',
        },
      ],
      warnings: [],
      tampered: false,
    };
  }
}
