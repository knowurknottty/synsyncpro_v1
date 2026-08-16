/**
 * IndexedDB Database for Protocol Plan System
 *
 * 5 Object Stores:
 * - plans: Imported protocol plans
 * - sessions: Completed session records
 * - metrics: User metrics (mood, anxiety, etc.)
 * - check_ins: Check-in responses
 * - audit_log: Append-only audit trail
 */

import type {
  ProtocolPlan,
  SessionRecord,
  MetricRecord,
  CheckInRecord,
  AuditLogEntry,
} from '../types/plan';

const DB_NAME = 'SynSyncProtocolPlans';
const DB_VERSION = 1;

/**
 * Initialize IndexedDB with schema
 */
export function initDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Object Store: plans
      if (!db.objectStoreNames.contains('plans')) {
        const planStore = db.createObjectStore('plans', { keyPath: '_id' });
        planStore.createIndex('status', '_status', { unique: false });
        planStore.createIndex('imported_at', '_imported_at', { unique: false });
        planStore.createIndex('practitioner', 'meta.practitioner.name', { unique: false });
      }

      // Object Store: sessions
      if (!db.objectStoreNames.contains('sessions')) {
        const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' });
        sessionStore.createIndex('plan_id', 'plan_id', { unique: false });
        sessionStore.createIndex('status', 'status', { unique: false });
        sessionStore.createIndex('scheduled_time', 'scheduled_time', { unique: false });
        sessionStore.createIndex('plan_status', ['plan_id', 'status'], { unique: false });
      }

      // Object Store: metrics
      if (!db.objectStoreNames.contains('metrics')) {
        const metricStore = db.createObjectStore('metrics', { keyPath: 'id' });
        metricStore.createIndex('plan_id', 'plan_id', { unique: false });
        metricStore.createIndex('metric_id', 'metric_id', { unique: false });
        metricStore.createIndex('timestamp', 'timestamp', { unique: false });
        metricStore.createIndex('plan_metric', ['plan_id', 'metric_id'], { unique: false });
      }

      // Object Store: check_ins
      if (!db.objectStoreNames.contains('check_ins')) {
        const checkInStore = db.createObjectStore('check_ins', { keyPath: 'id' });
        checkInStore.createIndex('plan_id', 'plan_id', { unique: false });
        checkInStore.createIndex('check_in_id', 'check_in_id', { unique: false });
        checkInStore.createIndex('completed_at', 'completed_at', { unique: false });
      }

      // Object Store: audit_log
      if (!db.objectStoreNames.contains('audit_log')) {
        const auditStore = db.createObjectStore('audit_log', { keyPath: 'id', autoIncrement: true });
        auditStore.createIndex('timestamp', 'timestamp', { unique: false });
        auditStore.createIndex('action', 'action', { unique: false });
      }
    };
  });
}

/**
 * Get database connection
 */
async function getDB(): Promise<IDBDatabase> {
  return initDatabase();
}

// ============================================================================
// PLANS CRUD
// ============================================================================

/**
 * Save a protocol plan to database
 */
export async function savePlan(plan: ProtocolPlan): Promise<string> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('plans', 'readwrite');
    const store = tx.objectStore('plans');

    // Add runtime fields
    if (!plan._id) {
      plan._id = `plan_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    }
    if (!plan._imported_at) {
      plan._imported_at = Date.now();
    }
    if (!plan._status) {
      plan._status = 'active';
    }

    const request = store.put(plan);

    request.onsuccess = () => {
      logAudit('plan_imported', { plan_id: plan._id, title: plan.plan.title });
      resolve(plan._id!);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get plan by ID
 */
export async function getPlan(planId: string): Promise<ProtocolPlan | null> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('plans', 'readonly');
    const store = tx.objectStore('plans');
    const request = store.get(planId);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get all plans
 */
export async function getAllPlans(): Promise<ProtocolPlan[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('plans', 'readonly');
    const store = tx.objectStore('plans');
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get plans by status
 */
export async function getPlansByStatus(
  status: 'active' | 'paused' | 'completed' | 'expired'
): Promise<ProtocolPlan[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('plans', 'readonly');
    const store = tx.objectStore('plans');
    const index = store.index('status');
    const request = index.getAll(status);

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Update plan status
 */
export async function updatePlanStatus(
  planId: string,
  status: 'active' | 'paused' | 'completed' | 'expired'
): Promise<void> {
  const plan = await getPlan(planId);
  if (!plan) throw new Error(`Plan not found: ${planId}`);

  plan._status = status;
  await savePlan(plan);
  logAudit('plan_status_updated', { plan_id: planId, new_status: status });
}

/**
 * Mark plan as tampered
 */
export async function markPlanTampered(planId: string): Promise<void> {
  const plan = await getPlan(planId);
  if (!plan) throw new Error(`Plan not found: ${planId}`);

  plan._tampered = true;
  await savePlan(plan);
  logAudit('plan_tampering_detected', { plan_id: planId });
}

/**
 * Delete plan and all associated data
 */
export async function deletePlan(planId: string): Promise<void> {
  const db = await getDB();

  // Delete plan
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction('plans', 'readwrite');
    const store = tx.objectStore('plans');
    const request = store.delete(planId);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });

  // Delete associated sessions
  await deleteSessionsByPlan(planId);

  // Delete associated metrics
  await deleteMetricsByPlan(planId);

  // Delete associated check-ins
  await deleteCheckInsByPlan(planId);

  logAudit('plan_deleted', { plan_id: planId });
}

// ============================================================================
// SESSIONS CRUD
// ============================================================================

/**
 * Save session record
 */
export async function saveSession(session: SessionRecord): Promise<string> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sessions', 'readwrite');
    const store = tx.objectStore('sessions');

    if (!session.id) {
      session.id = `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    }
    if (!session.created_at) {
      session.created_at = Date.now();
    }
    session.updated_at = Date.now();

    const request = store.put(session);

    request.onsuccess = () => {
      logAudit('session_saved', { session_id: session.id, status: session.status });
      resolve(session.id);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get session by ID
 */
export async function getSession(sessionId: string): Promise<SessionRecord | null> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sessions', 'readonly');
    const store = tx.objectStore('sessions');
    const request = store.get(sessionId);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get sessions for a plan
 */
export async function getSessionsByPlan(planId: string): Promise<SessionRecord[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sessions', 'readonly');
    const store = tx.objectStore('sessions');
    const index = store.index('plan_id');
    const request = index.getAll(planId);

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get sessions by status
 */
export async function getSessionsByStatus(
  planId: string,
  status: 'pending' | 'completed' | 'missed' | 'skipped'
): Promise<SessionRecord[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sessions', 'readonly');
    const store = tx.objectStore('sessions');
    const index = store.index('plan_status');
    const request = index.getAll([planId, status]);

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Delete sessions for a plan
 */
async function deleteSessionsByPlan(planId: string): Promise<void> {
  const sessions = await getSessionsByPlan(planId);
  const db = await getDB();

  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction('sessions', 'readwrite');
    const store = tx.objectStore('sessions');

    let pending = sessions.length;
    if (pending === 0) {
      resolve();
      return;
    }

    sessions.forEach((session) => {
      const request = store.delete(session.id);
      request.onsuccess = () => {
        pending--;
        if (pending === 0) resolve();
      };
      request.onerror = () => reject(request.error);
    });
  });
}

// ============================================================================
// METRICS CRUD
// ============================================================================

/**
 * Save metric record
 */
export async function saveMetric(metric: Omit<MetricRecord, 'id' | 'created_at'>): Promise<string> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('metrics', 'readwrite');
    const store = tx.objectStore('metrics');

    const fullMetric: MetricRecord = {
      ...metric,
      id: `metric_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      created_at: Date.now(),
    };

    const request = store.put(fullMetric);

    request.onsuccess = () => resolve(fullMetric.id);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get metrics for a plan
 */
export async function getMetricsByPlan(planId: string): Promise<MetricRecord[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('metrics', 'readonly');
    const store = tx.objectStore('metrics');
    const index = store.index('plan_id');
    const request = index.getAll(planId);

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get specific metric history for a plan
 */
export async function getMetricHistory(
  planId: string,
  metricId: string
): Promise<MetricRecord[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('metrics', 'readonly');
    const store = tx.objectStore('metrics');
    const index = store.index('plan_metric');
    const request = index.getAll([planId, metricId]);

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Delete metrics for a plan
 */
async function deleteMetricsByPlan(planId: string): Promise<void> {
  const metrics = await getMetricsByPlan(planId);
  const db = await getDB();

  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction('metrics', 'readwrite');
    const store = tx.objectStore('metrics');

    let pending = metrics.length;
    if (pending === 0) {
      resolve();
      return;
    }

    metrics.forEach((metric) => {
      const request = store.delete(metric.id);
      request.onsuccess = () => {
        pending--;
        if (pending === 0) resolve();
      };
      request.onerror = () => reject(request.error);
    });
  });
}

// ============================================================================
// CHECK-INS CRUD
// ============================================================================

/**
 * Save check-in record
 */
export async function saveCheckIn(
  checkIn: Omit<CheckInRecord, 'id' | 'created_at'>
): Promise<string> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('check_ins', 'readwrite');
    const store = tx.objectStore('check_ins');

    const fullCheckIn: CheckInRecord = {
      ...checkIn,
      id: `checkin_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      created_at: Date.now(),
    };

    const request = store.put(fullCheckIn);

    request.onsuccess = () => {
      logAudit('check_in_completed', {
        plan_id: fullCheckIn.plan_id,
        check_in_id: fullCheckIn.check_in_id,
      });
      resolve(fullCheckIn.id);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get check-ins for a plan
 */
export async function getCheckInsByPlan(planId: string): Promise<CheckInRecord[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('check_ins', 'readonly');
    const store = tx.objectStore('check_ins');
    const index = store.index('plan_id');
    const request = index.getAll(planId);

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Delete check-ins for a plan
 */
async function deleteCheckInsByPlan(planId: string): Promise<void> {
  const checkIns = await getCheckInsByPlan(planId);
  const db = await getDB();

  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction('check_ins', 'readwrite');
    const store = tx.objectStore('check_ins');

    let pending = checkIns.length;
    if (pending === 0) {
      resolve();
      return;
    }

    checkIns.forEach((checkIn) => {
      const request = store.delete(checkIn.id);
      request.onsuccess = () => {
        pending--;
        if (pending === 0) resolve();
      };
      request.onerror = () => reject(request.error);
    });
  });
}

// ============================================================================
// AUDIT LOG
// ============================================================================

/**
 * Log action to audit trail
 */
export async function logAudit(action: string, details: any): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('audit_log', 'readwrite');
    const store = tx.objectStore('audit_log');

    const entry: Omit<AuditLogEntry, 'id'> = {
      timestamp: Date.now(),
      action,
      details,
      user_agent: navigator.userAgent,
    };

    const request = store.add(entry);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get audit log entries
 */
export async function getAuditLog(limit = 100): Promise<AuditLogEntry[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('audit_log', 'readonly');
    const store = tx.objectStore('audit_log');
    const index = store.index('timestamp');
    const request = index.openCursor(null, 'prev'); // Newest first

    const results: AuditLogEntry[] = [];
    let count = 0;

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor && count < limit) {
        results.push(cursor.value);
        count++;
        cursor.continue();
      } else {
        resolve(results);
      }
    };

    request.onerror = () => reject(request.error);
  });
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Clear all data (for testing or user reset)
 */
export async function clearAllData(): Promise<void> {
  const db = await getDB();
  const stores = ['plans', 'sessions', 'metrics', 'check_ins', 'audit_log'];

  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(stores, 'readwrite');

    stores.forEach((storeName) => {
      tx.objectStore(storeName).clear();
    });

    tx.oncomplete = () => {
      logAudit('database_cleared', {});
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Get database size estimate
 */
export async function getDatabaseSize(): Promise<number> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return estimate.usage || 0;
  }
  return 0;
}

/**
 * Export all data for backup
 */
export async function exportAllData(): Promise<{
  plans: ProtocolPlan[];
  sessions: SessionRecord[];
  metrics: MetricRecord[];
  check_ins: CheckInRecord[];
  audit_log: AuditLogEntry[];
}> {
  const db = await getDB();

  const plans = await getAllPlans();
  const sessions: SessionRecord[] = [];
  const metrics: MetricRecord[] = [];
  const check_ins: CheckInRecord[] = [];
  const audit_log = await getAuditLog(1000);

  // Get all sessions and metrics for all plans
  for (const plan of plans) {
    if (plan._id) {
      sessions.push(...(await getSessionsByPlan(plan._id)));
      metrics.push(...(await getMetricsByPlan(plan._id)));
      check_ins.push(...(await getCheckInsByPlan(plan._id)));
    }
  }

  return { plans, sessions, metrics, check_ins, audit_log };
}
