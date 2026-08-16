/**
 * SynSync Pro — Agent Orchestration System
 * ==========================================
 * Multi-agent architecture for protocol rendering pipeline.
 * Each agent is responsible for one domain of the DSP chain.
 * 
 * Architecture:
 *   Orchestrator → dispatches to specialized agents:
 *     ├── SpecValidator     — validates protocol spec integrity
 *     ├── OctaveResolver    — computes octave layers for all frequencies
 *     ├── SafetyChecker     — validates contraindications before render
 *     ├── PhaseSequencer    — orders phases, computes transitions
 *     ├── BreathSync        — aligns breathwork cues to phase timing
 *     ├── SpatialRenderer   — computes spatial panning automation
 *     └── DSPEngine         — renders final audio buffer
 * 
 * @version 2.0.0
 */

import type { ProtocolSpec, PhaseSpec, AgentRole, AgentMessage, OctaveLayer } from '../dsp/types';
import { resolveOctaveLayers, resolvePhaseOctaves } from '../dsp/octave-resolver';

// ─── Agent Base Class ───────────────────────────────────────────────
abstract class Agent {
  abstract role: AgentRole;
  protected log(action: string, data?: unknown): void {
  }

  protected createMessage(
    to: AgentRole,
    type: AgentMessage['type'],
    payload: unknown
  ): AgentMessage {
    return {
      from: this.role,
      to,
      type,
      payload,
      timestamp: Date.now(),
      correlationId: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
    };
  }
}

// ─── Spec Validator Agent ───────────────────────────────────────────
export class SpecValidatorAgent extends Agent {
  role: AgentRole = 'spec_validator';

  validate(spec: ProtocolSpec): { valid: boolean; errors: string[]; warnings: string[] } {
    this.log('Validating', spec.id);
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!spec.id) errors.push('Missing protocol ID');
    if (!spec.name) errors.push('Missing protocol name');
    if (!spec.phases || spec.phases.length === 0) errors.push('No phases defined');

    // Phase validation
    let computedDuration = 0;
    for (const phase of spec.phases) {
      if (phase.durationSeconds <= 0) errors.push(`Phase "${phase.name}" has invalid duration`);
      if (phase.carrierFrequency < 20 || phase.carrierFrequency > 20000) {
        errors.push(`Phase "${phase.name}" carrier ${phase.carrierFrequency}Hz outside audible range`);
      }
      computedDuration += phase.durationSeconds;

      // Beat frequency validation
      const beats = Array.isArray(phase.beatFrequency)
        ? phase.beatFrequency
        : [phase.beatFrequency];
      for (const b of beats) {
        if (b < 0.1 || b > 100) {
          warnings.push(`Phase "${phase.name}" beat ${b}Hz outside typical entrainment range (0.5-50Hz)`);
        }
      }
    }

    // Duration consistency
    if (Math.abs(computedDuration - spec.durationSeconds) > 10) {
      warnings.push(`Sum of phase durations (${computedDuration}s) differs from spec duration (${spec.durationSeconds}s)`);
    }

    // Evidence level checks
    if (spec.evidenceLevel === 'V' && !spec.researchContext.toLowerCase().includes('speculative')) {
      warnings.push('Level V protocol should explicitly mention speculative nature in research context');
    }

    // Contraindication completeness
    if (spec.contraindications.absolute.length === 0 && (spec.targetBands ?? []).includes('gamma')) {
      warnings.push('Gamma-heavy protocol should list epilepsy as absolute contraindication');
    }

    this.log('Validation complete', { valid: errors.length === 0, errors: errors.length, warnings: warnings.length });
    return { valid: errors.length === 0, errors, warnings };
  }
}

// ─── Octave Resolver Agent ──────────────────────────────────────────
export class OctaveResolverAgent extends Agent {
  role: AgentRole = 'octave_resolver';

  resolveForProtocol(spec: ProtocolSpec): Map<number, { carrier: OctaveLayer[]; overlays: Map<number, OctaveLayer[]> }> {
    this.log('Resolving octave layers', spec.id);
    const result = new Map<number, { carrier: OctaveLayer[]; overlays: Map<number, OctaveLayer[]> }>();

    for (const phase of spec.phases) {
      const resolved = resolvePhaseOctaves(
        phase.carrierFrequency,
        phase.carrierOctaves,
        phase.overlays,
        phase.overlayOctaves
      );
      result.set(phase.index, resolved);

      const totalLayers = resolved.carrier.length +
        Array.from(resolved.overlays.values()).reduce((sum, layers) => sum + layers.length, 0);

      this.log(`Phase ${phase.index} "${phase.name}": ${totalLayers} total octave layers`);
    }

    return result;
  }
}

// ─── Safety Checker Agent ───────────────────────────────────────────
export interface UserProfile {
  conditions: string[];
  medications: string[];
  age: number;
  pregnant: boolean;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
}

export class SafetyCheckerAgent extends Agent {
  role: AgentRole = 'safety_checker';

  check(spec: ProtocolSpec, user?: UserProfile): { safe: boolean; warnings: string[]; blocked: string[] } {
    this.log('Safety check', spec.id);
    const warnings: string[] = [];
    const blocked: string[] = [];

    if (!user) {
      warnings.push('No user profile provided — cannot check personal contraindications');
      return { safe: true, warnings, blocked };
    }

    // Check absolute contraindications
    for (const contra of spec.contraindications.absolute) {
      const contraLower = contra.toLowerCase();
      for (const condition of user.conditions) {
        if (contraLower.includes(condition.toLowerCase())) {
          blocked.push(`BLOCKED: "${contra}" matches user condition "${condition}"`);
        }
      }
    }

    // Check unlock criteria
    if (spec.unlockCriteria && spec.unlockCriteria.length > 0) {
      warnings.push(`Protocol requires unlock criteria: ${spec.unlockCriteria.join('; ')}`);
    }

    // Age check for speculative protocols
    if (spec.evidenceLevel === 'V' && user.age < 18) {
      blocked.push('BLOCKED: Speculative protocols not recommended for minors');
    }

    // Experience check
    if (spec.evidenceLevel === 'V' && user.experienceLevel === 'beginner') {
      warnings.push('Advanced protocol — recommend building foundation with core protocols first');
    }

    // Pregnancy check
    if (user.pregnant) {
      for (const note of spec.contraindications.specialPopulations ?? []) {
        if (note.toLowerCase().includes('pregnancy') && note.toLowerCase().includes('not')) {
          blocked.push('BLOCKED: Not recommended during pregnancy');
        }
      }
    }

    this.log('Safety check complete', { safe: blocked.length === 0, blocked: blocked.length });
    return { safe: blocked.length === 0, warnings, blocked };
  }
}

// ─── Phase Sequencer Agent ──────────────────────────────────────────
export interface SequencedPhase extends PhaseSpec {
  startTimeMs: number;
  endTimeMs: number;
  crossfadeStartMs: number;
}

export class PhaseSequencerAgent extends Agent {
  role: AgentRole = 'phase_sequencer';

  sequence(spec: ProtocolSpec): SequencedPhase[] {
    this.log('Sequencing phases', spec.id);
    const sequenced: SequencedPhase[] = [];
    let currentTimeMs = 0;

    for (const phase of spec.phases) {
      const durationMs = phase.durationSeconds * 1000;
      const crossfadeMs = phase.crossfadeDuration * 1000;

      sequenced.push({
        ...phase,
        startTimeMs: currentTimeMs,
        endTimeMs: currentTimeMs + durationMs,
        crossfadeStartMs: currentTimeMs + durationMs - crossfadeMs,
      });

      currentTimeMs += durationMs;
    }

    this.log(`Sequenced ${sequenced.length} phases, total ${currentTimeMs / 1000}s`);
    return sequenced;
  }
}

// ─── Breath Sync Agent ──────────────────────────────────────────────
export interface BreathCue {
  timeMs: number;
  action: 'inhale' | 'hold_in' | 'exhale' | 'hold_out';
  durationMs: number;
}

export class BreathSyncAgent extends Agent {
  role: AgentRole = 'breath_sync';

  generateCues(spec: ProtocolSpec, totalDurationMs: number): BreathCue[] {
    this.log('Generating breath cues', spec.id);
    const { ratio, cycleDuration } = spec.breathwork;
    const [inhale, holdIn, exhale, holdOut] = ratio;
    const totalRatio = inhale + holdIn + exhale + holdOut;

    if (totalRatio === 0) return [];

    const cycleMs = (cycleDuration ?? (totalRatio * 1000)) * 1000;
    const cues: BreathCue[] = [];
    let t = 0;

    while (t < totalDurationMs) {
      const inMs = (inhale / totalRatio) * cycleMs;
      const hiMs = (holdIn / totalRatio) * cycleMs;
      const exMs = (exhale / totalRatio) * cycleMs;
      const hoMs = (holdOut / totalRatio) * cycleMs;

      if (inMs > 0) { cues.push({ timeMs: t, action: 'inhale', durationMs: inMs }); t += inMs; }
      if (hiMs > 0) { cues.push({ timeMs: t, action: 'hold_in', durationMs: hiMs }); t += hiMs; }
      if (exMs > 0) { cues.push({ timeMs: t, action: 'exhale', durationMs: exMs }); t += exMs; }
      if (hoMs > 0) { cues.push({ timeMs: t, action: 'hold_out', durationMs: hoMs }); t += hoMs; }
    }

    this.log(`Generated ${cues.length} breath cues over ${totalDurationMs / 1000}s`);
    return cues;
  }
}

// ─── Spatial Renderer Agent ─────────────────────────────────────────
export interface SpatialFrame {
  timeMs: number;
  panL: number;
  panR: number;
}

export class SpatialRendererAgent extends Agent {
  role: AgentRole = 'spatial_renderer';

  render(phases: SequencedPhase[], sampleRateHz = 10): SpatialFrame[] {
    this.log('Rendering spatial automation');
    const frames: SpatialFrame[] = [];

    for (const phase of phases) {
      if (!phase.spatialMotion || phase.spatialMotion === 'fixed') continue;

      const rate = phase.spatialRate ?? 0.1;
      const intervalMs = 1000 / sampleRateHz;

      for (let t = phase.startTimeMs; t < phase.endTimeMs; t += intervalMs) {
        const elapsed = (t - phase.startTimeMs) / 1000;
        let pan: number;

        switch (phase.spatialMotion) {
          case 'rotate':
            pan = Math.sin(2 * Math.PI * rate * elapsed);
            break;
          case 'pendulum':
            pan = Math.sin(2 * Math.PI * rate * elapsed) * 0.8;
            break;
          case 'random':
            pan = (Math.random() * 2 - 1) * 0.6;
            break;
          case 'spiral':
            pan = Math.sin(2 * Math.PI * rate * elapsed) * (1 - elapsed / ((phase.endTimeMs - phase.startTimeMs) / 1000));
            break;
          default:
            pan = 0;
        }

        frames.push({
          timeMs: t,
          panL: Math.max(0, -pan),
          panR: Math.max(0, pan),
        });
      }
    }

    this.log(`Rendered ${frames.length} spatial frames`);
    return frames;
  }
}

// ─── Orchestrator ───────────────────────────────────────────────────
export interface RenderPlan {
  spec: ProtocolSpec;
  validation: ReturnType<SpecValidatorAgent['validate']>;
  safety: ReturnType<SafetyCheckerAgent['check']>;
  octaveLayers: ReturnType<OctaveResolverAgent['resolveForProtocol']>;
  sequencedPhases: SequencedPhase[];
  breathCues: BreathCue[];
  spatialFrames: SpatialFrame[];
}

export class Orchestrator extends Agent {
  role: AgentRole = 'orchestrator';

  private validator = new SpecValidatorAgent();
  private octaveResolver = new OctaveResolverAgent();
  private safetyChecker = new SafetyCheckerAgent();
  private phaseSequencer = new PhaseSequencerAgent();
  private breathSync = new BreathSyncAgent();
  private spatialRenderer = new SpatialRendererAgent();

  /**
   * Full pipeline: validate → safety → resolve octaves → sequence → sync → render plan
   */
  plan(spec: ProtocolSpec, user?: UserProfile): RenderPlan {
    this.log('=== ORCHESTRATING ===', spec.id);

    // 1. Validate spec
    const validation = this.validator.validate(spec);
    if (!validation.valid) {
      this.log('VALIDATION FAILED', validation.errors);
      throw new Error(`Spec validation failed for ${spec.id}: ${validation.errors.join(', ')}`);
    }

    // 2. Safety check
    const safety = this.safetyChecker.check(spec, user);
    if (!safety.safe) {
      this.log('SAFETY BLOCKED', safety.blocked);
      throw new Error(`Safety check failed for ${spec.id}: ${safety.blocked.join(', ')}`);
    }

    // 3. Resolve octave layers
    const octaveLayers = this.octaveResolver.resolveForProtocol(spec);

    // 4. Sequence phases
    const sequencedPhases = this.phaseSequencer.sequence(spec);

    // 5. Generate breath cues
    const totalDurationMs = spec.durationSeconds * 1000;
    const breathCues = this.breathSync.generateCues(spec, totalDurationMs);

    // 6. Render spatial automation
    const spatialFrames = this.spatialRenderer.render(sequencedPhases);

    this.log('=== PLAN COMPLETE ===', {
      protocol: spec.id,
      phases: sequencedPhases.length,
      octaveLayerSets: octaveLayers.size,
      breathCues: breathCues.length,
      spatialFrames: spatialFrames.length,
    });

    return {
      spec,
      validation,
      safety,
      octaveLayers,
      sequencedPhases,
      breathCues,
      spatialFrames,
    };
  }

  /**
   * Plan an entire sequence of protocols (e.g., flow state 1-5).
   */
  planSequence(specs: ProtocolSpec[], user?: UserProfile): RenderPlan[] {
    this.log('Planning sequence', specs.map(s => s.id));
    return specs.map(spec => this.plan(spec, user));
  }
}
