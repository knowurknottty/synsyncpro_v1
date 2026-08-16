/**
 * Protocol Plan System - Type Definitions
 *
 * Complete TypeScript interfaces matching PROTOCOL_PLAN_SCHEMA.json
 * Used for importing practitioner-created treatment plans
 */

/**
 * Core protocol plan structure
 */
export interface ProtocolPlan {
  schema_version: string;
  type: 'protocol_plan';
  meta: PlanMeta;
  plan: PlanDetails;
  schedule: PlanSchedule;
  protocols: ProtocolConstraints;
  tracking: PlanTracking;
  conditional_logic?: ConditionalRule[];
  instructions: PlanInstructions;
  consent: PlanConsent;
  security: PlanSecurity;

  // Runtime fields (not in JSON)
  _id?: string;
  _imported_at?: number;
  _status?: 'active' | 'paused' | 'completed' | 'expired';
  _tampered?: boolean;
}

/**
 * Practitioner and patient metadata
 */
export interface PlanMeta {
  practitioner: {
    name: string;
    credentials?: string;
    organization?: string;
    contact_email?: string;
    license_number?: string;
  };
  patient: {
    identifier: string; // Anonymous ID (not name)
    age_range?: string;
    relevant_conditions?: string[];
  };
  created_date: string; // ISO 8601
  plan_version: string;
}

/**
 * Plan details and goals
 */
export interface PlanDetails {
  title: string;
  description: string;
  primary_goal: string;
  secondary_goals?: string[];
  expected_outcomes: string[];
  duration_weeks: number;
  contraindications?: string[];
  safety_notes?: string[];
}

/**
 * Schedule structure
 */
export interface PlanSchedule {
  timezone: string; // IANA timezone
  start_date?: string; // ISO 8601, optional (user chooses)
  phases: PlanPhase[];
  maintenance?: MaintenancePhase;
  flexible_scheduling?: boolean;
}

/**
 * Individual phase of treatment
 */
export interface PlanPhase {
  phase_number: number;
  title: string;
  description?: string;
  start_day: number; // 1-indexed
  duration_days: number;
  sessions: PlanSession[];
  rest_days?: number[]; // Day of week (0=Sunday, 6=Saturday)
  notes?: string;
}

/**
 * Individual session within a phase
 */
export interface PlanSession {
  session_id: string;
  protocol_id: string; // Must match PROTOCOLS constant
  frequency: 'daily' | '2x_per_day' | '3x_per_week' | 'weekly' | 'as_needed';
  time_of_day?: 'morning' | 'afternoon' | 'evening' | 'night';
  preferred_time?: string; // HH:MM format
  time_window_minutes?: number;
  duration_override_minutes?: number;
  settings?: {
    volume?: number; // 0.0-1.0
    complexity?: 'low' | 'medium' | 'high';
    [key: string]: any; // Protocol-specific overrides
  };
  required: boolean;
  skip_allowed?: boolean;
  notes?: string;
}

/**
 * Maintenance phase (after main protocol)
 */
export interface MaintenancePhase {
  enabled: boolean;
  sessions_per_week: number;
  duration_weeks?: number;
  protocols: string[];
  notes?: string;
}

/**
 * Protocol restrictions
 */
export interface ProtocolConstraints {
  allowed_protocols: string[];
  restricted_protocols?: string[];
  notes?: string;
}

/**
 * Tracking requirements
 */
export interface PlanTracking {
  required_metrics: PlanMetric[];
  optional_metrics?: PlanMetric[];
  check_ins: CheckIn[];
  milestones: Milestone[];
}

/**
 * Metric definition
 */
export interface PlanMetric {
  metric_id: string;
  label: string;
  type: 'scale' | 'boolean' | 'text' | 'number';
  scale_min?: number;
  scale_max?: number;
  scale_labels?: { [key: number]: string };
  frequency: 'per_session' | 'daily' | 'weekly';
  required: boolean;
  description?: string;
}

/**
 * Check-in definition
 */
export interface CheckIn {
  check_in_id: string;
  title: string;
  day: number; // Plan day when check-in is due
  questions: CheckInQuestion[];
  required: boolean;
}

export interface CheckInQuestion {
  question_id: string;
  question_text: string;
  response_type: 'text' | 'scale' | 'multiple_choice';
  scale_range?: [number, number];
  choices?: string[];
  required: boolean;
}

/**
 * Milestone definition
 */
export interface Milestone {
  milestone_id: string;
  title: string;
  description: string;
  day?: number; // Specific day
  required_sessions?: number; // Or session count
  reward_message?: string;
  badge_icon?: string;
}

/**
 * Conditional rule for dynamic plan adjustment
 */
export interface ConditionalRule {
  rule_id: string;
  condition: {
    metric_id: string;
    operator: '>' | '<' | '==' | '>=' | '<=' | '!=';
    value: number | string | boolean;
    duration_days?: number; // Condition must be true for N days
  };
  action: {
    type: 'show_reminder' | 'show_warning' | 'suggest_extra_session' | 'extend_phase' | 'notify_practitioner';
    message?: string;
    protocol_id?: string; // For suggest_extra_session
    days_to_add?: number; // For extend_phase
  };
  priority: 'low' | 'medium' | 'high';
}

/**
 * User instructions
 */
export interface PlanInstructions {
  before_starting: string;
  during_session: string;
  after_session: string;
  if_missed_session: string;
  general_tips?: string[];
}

/**
 * Consent information
 */
export interface PlanConsent {
  text: string; // Full consent form
  acknowledgments: string[]; // Bullet points user must acknowledge
  signature_required: boolean;
}

/**
 * Security and tamper detection
 */
export interface PlanSecurity {
  plan_hash: string; // SHA-256 of plan JSON (excluding security section)
  signed_by?: string;
  signature?: string; // Future: digital signature
}

/**
 * Database record for completed sessions
 */
export interface SessionRecord {
  id: string;
  plan_id: string;
  session_id: string;
  protocol_id: string;
  scheduled_time: number; // Unix timestamp
  actual_start_time?: number;
  actual_end_time?: number;
  duration_seconds?: number;
  status: 'pending' | 'completed' | 'missed' | 'skipped';
  skip_reason?: string;
  pre_metrics?: { [metric_id: string]: any };
  post_metrics?: { [metric_id: string]: any };
  notes?: string;
  created_at: number;
  updated_at: number;
}

/**
 * Database record for metrics
 */
export interface MetricRecord {
  id: string;
  plan_id: string;
  metric_id: string;
  value: any;
  timestamp: number;
  session_id?: string; // If associated with session
  created_at: number;
}

/**
 * Database record for check-in responses
 */
export interface CheckInRecord {
  id: string;
  plan_id: string;
  check_in_id: string;
  responses: { [question_id: string]: any };
  completed_at: number;
  created_at: number;
}

/**
 * Audit log entry
 */
export interface AuditLogEntry {
  id: string;
  timestamp: number;
  action: string;
  details: any;
  user_agent: string;
}

/**
 * Adherence statistics
 */
export interface AdherenceStats {
  total_scheduled: number;
  total_completed: number;
  total_missed: number;
  total_skipped: number;
  adherence_rate: number; // 0.0-1.0
  current_streak: number; // Days
  longest_streak: number;
  weekly_adherence: number; // Last 7 days
  monthly_adherence: number; // Last 30 days
}

/**
 * Export format options
 */
export interface ExportOptions {
  format: 'json' | 'pdf' | 'csv';
  date_range?: {
    start: number;
    end: number;
  };
  include_personal_info: boolean;
  include_subjective_notes: boolean;
  anonymize: boolean;
}

/**
 * Validation error structure
 */
export interface ValidationError {
  path: string;
  message: string;
  severity: 'error' | 'warning';
}

/**
 * Import result
 */
export interface ImportResult {
  success: boolean;
  plan_id?: string;
  errors: ValidationError[];
  warnings: ValidationError[];
  tampered: boolean;
}
