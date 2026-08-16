/**
 * FIX #14: Rename Internal Protocol IDs for Open-Source Readiness
 * 
 * PROBLEM: Substance mimicry protocols have public-facing names that are
 * carefully worded ("Emotional Openness Portal", "Sustained Focus",
 * "Ego Boundary Softening") but internal IDs still use explicit substance
 * references (mdma_mimic, stimulant_mimic, psychedelic_mimic, cannabis_mimic).
 * 
 * When the codebase is open-sourced (which the positioning demands),
 * these IDs will be visible in:
 *   - Source code on GitHub
 *   - Browser DevTools (protocol state objects)
 *   - localStorage/IndexedDB session records
 *   - Export files (JSON session data)
 *   - Network requests (if analytics added later)
 * 
 * RISKS:
 * 1. Media/regulatory scrutiny: "App claims to simulate MDMA"
 * 2. App store rejection (if PWA→native conversion pursued)
 * 3. Institutional credibility damage with clinical partners
 * 4. Search engine association with controlled substances
 * 
 * SOLUTION: Rename all substance-referencing IDs to match their
 * public-facing therapeutic descriptions. Provide migration mapping
 * for any stored session data.
 */

// ============================================================
// ID MIGRATION MAP
// ============================================================

/**
 * Maps old internal IDs to new safe IDs.
 * New IDs describe the MECHANISM, not the substance being mimicked.
 */
export const PROTOCOL_ID_MIGRATION: Record<string, {
  newId: string;
  publicName: string;
  rationale: string;
}> = {
  // Substance Mimicry → Neurochemical Optimization
  'mdma_mimic': {
    newId: 'emotional_openness_portal',
    publicName: 'Emotional Openness Portal',
    rationale: 'Describes the therapeutic mechanism (oxytocin/serotonin pathway activation) rather than the substance. Theta-gamma coupling for emotional processing is a valid neuroscience concept independent of any substance.',
  },
  'stimulant_mimic': {
    newId: 'sustained_focus_activator',
    publicName: 'Sustained Focus',
    rationale: 'Describes the cognitive outcome (sustained attention via beta-gamma entrainment) rather than the substance class. Dopamine-norepinephrine optimization through frequency entrainment is well-documented.',
  },
  'psychedelic_mimic': {
    newId: 'ego_boundary_softener',
    publicName: 'Ego Boundary Softening',
    rationale: 'Describes the phenomenological experience (default mode network disruption) rather than the substance class. Alpha desynchronization + theta enhancement is the mechanism.',
  },
  'cannabis_mimic': {
    newId: 'deep_relaxation_theta',
    publicName: 'Deep Relaxation Flow',
    rationale: 'Describes the neurological state (theta-dominant relaxation with mild dissociation) rather than the substance. Theta entrainment for relaxation is established neuroscience.',
  },

  // Also audit these borderline IDs while we're at it:
  'dopamine_reset': {
    newId: 'reward_circuit_reset',
    publicName: 'Reward Circuit Reset',
    rationale: 'More neuroscientifically precise. The protocol targets mesolimbic pathway recalibration, not just dopamine.',
  },
  'gaba_enhancement': {
    newId: 'inhibitory_tone_enhancer',
    publicName: 'Neural Calm Enhancer',
    rationale: 'Avoids implying direct neurotransmitter manipulation. The mechanism is entrainment-induced cortical inhibition.',
  },
};

// ============================================================
// MIGRATION UTILITY
// ============================================================

/**
 * Migrate stored session data from old IDs to new IDs.
 * Run once on app initialization to update any localStorage/IndexedDB records.
 */
export function migrateProtocolIds(): { migrated: number; errors: string[] } {
  let migrated = 0;
  const errors: string[] = [];

  // Migrate session history
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
          if (session.protocolTitle) {
            session.protocolTitle = migration.publicName;
          }
          changed = true;
          migrated++;
        }
      }

      if (changed) {
        localStorage.setItem(historyKey, JSON.stringify(sessions));
      }
    }
  } catch (e) {
    errors.push(`Session history migration failed: ${e}`);
  }

  // Migrate progress data
  try {
    const progressKey = 'synsync_progress_data';
    const raw = localStorage.getItem(progressKey);
    if (raw) {
      const progress = JSON.parse(raw);
      if (progress.protocolStats) {
        let changed = false;
        const newStats: Record<string, any> = {};

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

  // Migrate saved routines
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

      if (changed) {
        localStorage.setItem(routinesKey, JSON.stringify(routines));
      }
    }
  } catch (e) {
    errors.push(`Routine migration failed: ${e}`);
  }

  if (migrated > 0) {
    console.info(`[SynSync] Migrated ${migrated} protocol ID references to new naming convention.`);
  }

  return { migrated, errors };
}

/**
 * Backward-compatible protocol lookup.
 * If someone has a bookmark or deep link with an old ID, resolve it.
 */
export function resolveProtocolId(id: string): string {
  return PROTOCOL_ID_MIGRATION[id]?.newId ?? id;
}

// ============================================================
// ADDITIONAL CODEBASE AUDIT ITEMS
// ============================================================

/**
 * Beyond renaming, search the entire codebase for:
 * 
 * □ Any comments referencing substances by name
 *   grep -rn "mdma\|cocaine\|cannabis\|marijuana\|lsd\|psilocybin\|ketamine" src/
 *   → Rewrite to reference mechanisms: "serotonergic pathway", "theta dominance"
 * 
 * □ Protocol descriptions that could be misquoted
 *   e.g., "Mimics the neurochemical state of MDMA"
 *   → Rewrite: "Promotes serotonin-associated emotional openness through theta-gamma coupling"
 * 
 * □ Research citations that mention recreational use
 *   → Keep citations but frame as: "Informed by research on serotonergic systems"
 * 
 * □ Variable names in DSP code
 *   e.g., mdmaPhase, cannabisRelax, psychedelicPeak
 *   → Rename: opennessPhase, deepRelax, boundaryPeak
 * 
 * □ Test files
 *   e.g., test_mdma_protocol.ts
 *   → Rename: test_emotional_openness_protocol.ts
 * 
 * □ Git history (less critical but worth noting)
 *   Old commit messages will still reference substances.
 *   If doing a clean open-source release, consider:
 *   - Squash history before public repo
 *   - Or accept that history shows the evolution
 */

// ============================================================
// INTEGRATION
// ============================================================
/**
 * 1. Rename IDs in protocol definition files:
 *    - protocols/substance-mimicry.ts (or wherever defined)
 *    - Update all id: 'mdma_mimic' → id: 'emotional_openness_portal'
 * 
 * 2. Update any protocol lookup/routing code:
 *    - Protocol selector components
 *    - URL routing (if protocols have deep links)
 *    - Search/filter functionality
 * 
 * 3. Add migration call to app initialization:
 *    // In App.tsx or main.tsx, before rendering:
 *    import { migrateProtocolIds } from './utils/protocol-id-migration';
 *    migrateProtocolIds();
 * 
 * 4. Add backward-compatible resolution:
 *    // In protocol loader:
 *    import { resolveProtocolId } from './utils/protocol-id-migration';
 *    const protocol = protocolVault.get(resolveProtocolId(requestedId));
 * 
 * 5. Update category name:
 *    "Substance Mimicry" → "Neurochemical Optimization"
 *    or "Altered State Protocols" or "Advanced Consciousness"
 */
