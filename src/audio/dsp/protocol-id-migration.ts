/**
 * FIX #14: Protocol ID Migration
 * ================================
 * Renames substance-referencing IDs to mechanism-based names.
 * Provides migration utility for localStorage/IndexedDB records.
 *
 * @version 2.0.0
 */

export const PROTOCOL_ID_MIGRATION: Record<string, {
  newId: string;
  publicName: string;
  rationale: string;
}> = {
  'mdma_mimic': {
    newId: 'emotional_openness_portal',
    publicName: 'Emotional Openness Portal',
    rationale: 'Oxytocin/serotonin pathway activation via theta-gamma coupling',
  },
  'stimulant_mimic': {
    newId: 'sustained_focus_activator',
    publicName: 'Sustained Focus',
    rationale: 'Beta-gamma entrainment for dopamine-norepinephrine optimization',
  },
  'psychedelic_mimic': {
    newId: 'ego_boundary_softener',
    publicName: 'Ego Boundary Softening',
    rationale: 'DMN disruption via alpha desynchronization + theta enhancement',
  },
  'cannabis_mimic': {
    newId: 'deep_relaxation_theta',
    publicName: 'Deep Relaxation Flow',
    rationale: 'Theta-dominant relaxation via thalamic gating modification',
  },
  'dopamine_reset': {
    newId: 'reward_circuit_reset',
    publicName: 'Reward Circuit Reset',
    rationale: 'Mesolimbic pathway recalibration via delta-theta entrainment',
  },
};

export function migrateProtocolIds(): { migrated: number; errors: string[] } {
  let migrated = 0;
  const errors: string[] = [];

  try {
    const historyKey = 'synsync_session_history';
    const raw = localStorage.getItem(historyKey);
    if (raw) {
      const sessions = JSON.parse(raw);
      let changed = false;
      for (const session of sessions) {
        const migration = PROTOCOL_ID_MIGRATION[session.protocolId];
        if (migration) {
          session.protocolId = migration.newId;
          if (session.protocolTitle) session.protocolTitle = migration.publicName;
          changed = true;
          migrated++;
        }
      }
      if (changed) localStorage.setItem(historyKey, JSON.stringify(sessions));
    }
  } catch (e) {
    errors.push(`Session history migration failed: ${e}`);
  }

  try {
    const progressKey = 'synsync_progress_data';
    const raw = localStorage.getItem(progressKey);
    if (raw) {
      const progress = JSON.parse(raw);
      if (progress.protocolStats) {
        let changed = false;
        const newStats: Record<string, unknown> = {};
        for (const [id, stats] of Object.entries(progress.protocolStats)) {
          const migration = PROTOCOL_ID_MIGRATION[id];
          if (migration) {
            newStats[migration.newId] = stats;
            changed = true;
            migrated++;
          } else {
            newStats[id] = stats;
          }
        }
        if (changed) {
          progress.protocolStats = newStats;
          localStorage.setItem(progressKey, JSON.stringify(progress));
        }
      }
    }
  } catch (e) {
    errors.push(`Progress data migration failed: ${e}`);
  }

  try {
    const routinesKey = 'synsync_saved_routines';
    const raw = localStorage.getItem(routinesKey);
    if (raw) {
      const routines = JSON.parse(raw);
      let changed = false;
      for (const routine of routines) {
        if (routine.routine?.protocols) {
          for (const p of routine.routine.protocols) {
            const migration = PROTOCOL_ID_MIGRATION[p.id];
            if (migration) {
              p.id = migration.newId;
              changed = true;
              migrated++;
            }
          }
        }
      }
      if (changed) localStorage.setItem(routinesKey, JSON.stringify(routines));
    }
  } catch (e) {
    errors.push(`Routine migration failed: ${e}`);
  }

  if (migrated > 0) {
    console.info(`[SynSync] Migrated ${migrated} protocol ID references.`);
  }

  return { migrated, errors };
}

export function resolveProtocolId(id: string): string {
  return PROTOCOL_ID_MIGRATION[id]?.newId ?? id;
}
