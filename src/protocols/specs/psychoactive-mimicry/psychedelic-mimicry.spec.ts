/**
 * SynSync Pro — Psychedelic Mimicry Protocol Specs
 * ==================================================
 * Category: psychedelic_mimicry
 * Protocols mimicking psychedelic phenomenology through brainwave entrainment.
 * Targets DMN decoupling, visual cortex disinhibition, and serotonergic modulation.
 *
 * @version 2.0.0
 */

import type { ProtocolSpec } from '../../../audio/dsp/types';
import { phase } from '../../../audio/dsp/phase-builder';
import { CARRIERS, SOLFEGGIO, SCHUMANN } from '../../../audio/dsp/constants';

// ─── 1. Ego Boundary Softening (Psychedelic Mimic) ─────────────────
export const psychedelicMimic: ProtocolSpec = {
  id: 'ego_boundary_softener',
  name: 'Ego Boundary Softening',
  category: 'psychedelic_mimicry',
  version: '2.0.0',
  durationSeconds: 1200,
  evidenceLevel: 'III',
  citations: [
    'Carhart-Harris, R.L. et al. (2012) "Neural correlates of the psychedelic state as determined by fMRI studies with psilocybin." PNAS',
    'Carhart-Harris, R.L. & Friston, K.J. (2019) "REBUS and the anarchic brain: toward a unified model of the brain action of psychedelics." Pharmacological Reviews',
  ],
  usageGoal: 'Sense of self softens; boundaries between self and world blur. Mimics psychedelic ego dissolution via DMN decoupling.',
  algorithmDescription: '7Hz theta base coupled with 40Hz gamma overlay targeting the default mode network self-circuit. Spatial rotation at increasing rate creates progressive dissolution of spatial self-reference. Stochastic jitter disrupts the predictive processing loops that maintain ego boundaries.',
  researchContext: 'Mimics psychedelic ego dissolution via DMN decoupling. Psilocybin fMRI studies show decreased DMN connectivity correlating with ego dissolution. This protocol uses theta-gamma coupling to disrupt the same self-referential processing network without pharmacological intervention.',
  targetBands: ['theta', 'gamma'],
  neurochemistryTargets: ['serotonin', 'DMT', 'glutamate'],
  phases: [
    phase(0, 'Intention Setting')
      .duration(180)
      .beat(10)
      .carrier(CARRIERS.warm)
      .noise('pink', 0.10)
      .noCarrierOctaves()
      .purpose('Alpha settling with clear intention — set container before ego work')
      .build(),

    phase(1, 'DMN Loosening')
      .duration(240)
      .beat([10, 7])
      .carrier(CARRIERS.warm)
      .noise('pink', 0.08)
      .gentleCarrierOctaves()
      .overlays([40], 0.15)
      .spatial('rotate', 0.03)
      .purpose('Theta descent with gamma onset to begin loosening DMN coherence')
      .build(),

    phase(2, 'Ego Dissolution')
      .duration(480)
      .beat(7)
      .carrier(CARRIERS.warm)
      .noise('pink', 0.06)
      .deepCarrierOctaves()
      .overlays([40], 0.30)
      .deepOverlayOctaves()
      .spatial('rotate', 0.06)
      .stochasticJitter(18)
      .harmonics()
      .purpose('Full theta-gamma coupling with high stochastic disruption for DMN decoupling')
      .build(),

    phase(3, 'Boundary Reconstitution')
      .duration(180)
      .beat(7)
      .carrier(CARRIERS.warm)
      .noise('pink', 0.08)
      .gentleCarrierOctaves()
      .overlays([40], 0.12)
      .spatial('rotate', 0.02)
      .purpose('Maintain theta while gradually reducing dissolution intensity')
      .build(),

    phase(4, 'Grounded Return')
      .duration(120)
      .beat([7, 10])
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.12)
      .noCarrierOctaves()
      .purpose('Alpha return to re-establish healthy ego boundaries with expanded perspective')
      .build(),
  ],
  breathwork: {
    name: 'Dissolve Breath',
    ratio: [6, 0, 6, 0],
    description: 'Slow equal breathing. Intention: "I am boundless." Let identity soften.',
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'ALL',
    pronunciation: 'awl (expansive, dissolving)',
    tonality: 'vast, borderless',
    meaning: 'Universal connection — the boundary between self and world is a construct',
    repeatInterval: 60,
    delivery: 'internal',
  },
  contraindications: {
    absolute: ['Active psychosis', 'Schizophrenia spectrum', 'Severe dissociative disorders', 'Borderline personality — ego instability'],
    relative: ['Trauma history — ego dissolution may surface material', 'Anxiety — loss of self-reference may trigger panic', 'First-time users — start with lighter protocols'],
    drugInteractions: ['Psychedelics — do NOT combine', 'Cannabis — unpredictable amplification', 'Dissociatives — dangerous synergy'],
    specialPopulations: ['Not for minors', 'Requires psychological stability'],
  },
  expectedTimeline: '1 session: Subtle boundary softening. 4 weeks: Deeper ego flexibility.',
  frequencyOfUse: 'Once per week maximum. Allow full integration between sessions.',
  masterGain: 0.78,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─── 2. Geometric Visual Gateway ───────────────────────────────────
export const geometricVisualGateway: ProtocolSpec = {
  id: 'geometric_visual_gateway',
  name: 'Geometric Visual Gateway',
  category: 'psychedelic_mimicry',
  version: '2.0.0',
  durationSeconds: 1200,
  evidenceLevel: 'III',
  citations: [
    'Ermentrout, G.B. & Cowan, J.D. (1979) "A mathematical theory of visual hallucination patterns." Biological Cybernetics',
    'Bressloff, P.C. et al. (2002) "What geometric visual hallucinations tell us about the visual cortex." Neural Computation',
  ],
  usageGoal: 'Visual pattern perception and geometric seeing with eyes closed. Mimics early 5-HT2A visual effects via visual cortex disinhibition.',
  algorithmDescription: '40Hz gamma primary designed to disinhibit the lateral geniculate nucleus (LGN) visual relay. Random spatial motion creates chaotic auditory input that translates to visual cortex activation. Heavy stochastic jitter disrupts predictive visual processing, allowing endogenous pattern formation.',
  researchContext: 'Mimics early 5-HT2A visual effects via visual cortex disinhibition. Psychedelic geometry arises from the intrinsic architecture of V1 visual cortex when normal sensory gating is relaxed. Gamma entrainment combined with spatial randomization can trigger similar disinhibition through cross-modal cortical excitation.',
  targetBands: ['gamma'],
  neurochemistryTargets: ['serotonin', 'glutamate', 'acetylcholine'],
  phases: [
    phase(0, 'Eyes-Closed Settling')
      .duration(180)
      .beat(10)
      .carrier(CARRIERS.bright)
      .noise('pink', 0.08)
      .noCarrierOctaves()
      .purpose('Alpha settling with eyes closed — establish dark visual field baseline')
      .build(),

    phase(1, 'Visual Cortex Priming')
      .duration(180)
      .beat([10, 40])
      .carrier(CARRIERS.bright)
      .noise('pink', 0.06)
      .gentleCarrierOctaves()
      .spatial('rotate', 0.04)
      .stochasticJitter(12)
      .purpose('Ramp to gamma with increasing spatial chaos to prime visual cortex')
      .build(),

    phase(2, 'LGN Disinhibition')
      .duration(540)
      .beat(40)
      .carrier(CARRIERS.bright)
      .noise('pink', 0.04)
      .deepCarrierOctaves()
      .spatial('rotate', 0.08)
      .stochasticJitter(25)
      .harmonics()
      .purpose('Full 40Hz gamma with maximum stochastic chaos — LGN disinhibition and pattern emergence')
      .build(),

    phase(3, 'Pattern Integration')
      .duration(180)
      .beat(40)
      .carrier(CARRIERS.bright)
      .noise('pink', 0.06)
      .gentleCarrierOctaves()
      .spatial('rotate', 0.04)
      .stochasticJitter(10)
      .purpose('Reduce chaos while maintaining gamma — allow patterns to stabilize and integrate')
      .build(),

    phase(4, 'Return')
      .duration(120)
      .beat([40, 10])
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.10)
      .noCarrierOctaves()
      .purpose('Alpha return — gently close the visual gateway and ground')
      .build(),
  ],
  breathwork: {
    name: 'Visual Breath',
    ratio: [4, 4, 4, 4],
    description: 'Box breathing. Eyes closed. Notice any arising patterns without grasping.',
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'SEE',
    pronunciation: 'see (receptive, open)',
    tonality: 'quiet, observant',
    meaning: 'Filters removed — perception without the usual predictive constraints',
    repeatInterval: 30,
    delivery: 'internal',
  },
  contraindications: {
    absolute: ['Epilepsy — gamma + stochastic = seizure risk', 'Active psychosis', 'HPPD (Hallucinogen Persisting Perception Disorder)'],
    relative: ['Visual anxiety or photophobia', 'Migraine with aura — visual cortex sensitivity', 'First-time users — may be disorienting'],
    drugInteractions: ['Psychedelics — extreme visual amplification', 'Cannabis — unpredictable'],
    specialPopulations: ['Not for minors', 'Not for those with visual processing disorders'],
  },
  expectedTimeline: '1 session: Subtle phosphenes and patterns. Multiple sessions: Richer geometric perception.',
  frequencyOfUse: 'Once per week. Allow visual cortex to normalize between sessions.',
  masterGain: 0.75,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─── 3. Mystical Experience Protocol ───────────────────────────────
export const mysticalExperienceGenerator: ProtocolSpec = {
  id: 'mystical_experience_generator',
  name: 'Mystical Experience Protocol',
  category: 'psychedelic_mimicry',
  version: '2.0.0',
  durationSeconds: 1500,
  evidenceLevel: 'III',
  citations: [
    'Griffiths, R.R. et al. (2006) "Psilocybin can occasion mystical-type experiences." Psychopharmacology',
    'Barrett, F.S. & Griffiths, R.R. (2018) "Classic hallucinogens and mystical experiences." Current Psychiatry Reports',
  ],
  usageGoal: 'Overwhelming sense of sacredness and meaning flooding. Mimics the neurochemistry of mystical experience through theta-gamma-solfeggio triad.',
  algorithmDescription: '7Hz theta primary over 200Hz carrier with 40Hz gamma overlay and 528Hz biological resonance harmonic stacking. The theta-gamma coupling with solfeggio enrichment creates a convergent neural state resembling 5-HT2A agonist-mediated mystical experiences. Deep spatial rotation generates immersive sacred-space field.',
  researchContext: 'Mimics the neurochemistry of mystical experience. Griffiths\' psilocybin studies show mystical experiences correlate with specific EEG patterns: theta dominance, gamma bursts, and decreased DMN coherence. This protocol targets the same signatures using entrainment to approximate the "complete" mystical experience (unity, sacredness, noetic quality, transcendence of time/space).',
  targetBands: ['theta', 'gamma'],
  neurochemistryTargets: ['serotonin', 'DMT', 'endorphins', 'oxytocin', 'anandamide'],
  phases: [
    phase(0, 'Sacred Space')
      .duration(180)
      .beat(10)
      .carrier(CARRIERS.warm)
      .noise('pink', 0.08)
      .noCarrierOctaves()
      .overlays([SOLFEGGIO.SOL], 0.08)
      .purpose('Alpha settling with 528Hz — establish sacred intention and reverential mindset')
      .build(),

    phase(1, 'Theta Descent')
      .duration(240)
      .beat([10, 7])
      .carrier(CARRIERS.warm)
      .noise('pink', 0.06)
      .gentleCarrierOctaves()
      .overlays([SOLFEGGIO.SOL, SOLFEGGIO.OM], 0.12)
      .spatial('rotate', 0.02)
      .harmonics()
      .purpose('Descent to theta with solfeggio sacred frequency stack for reverential depth')
      .build(),

    phase(2, 'Mystical Peak')
      .duration(660)
      .beat(7)
      .carrier(CARRIERS.warm)
      .noise('pink', 0.04)
      .deepCarrierOctaves()
      .overlays([40, SOLFEGGIO.SOL], 0.40)
      .deepOverlayOctaves()
      .spatial('rotate', 0.04)
      .stochasticJitter(15)
      .harmonics()
      .purpose('Full theta-gamma-solfeggio triad for mystical experience peak — unity, sacredness, noetic quality')
      .build(),

    phase(3, 'Awe Sustain')
      .duration(240)
      .beat(7)
      .carrier(CARRIERS.warm)
      .noise('pink', 0.06)
      .gentleCarrierOctaves()
      .overlays([SOLFEGGIO.SOL], 0.15)
      .spatial('rotate', 0.02)
      .harmonics()
      .purpose('Sustain mystical state with reduced intensity for meaning consolidation')
      .build(),

    phase(4, 'Sacred Return')
      .duration(180)
      .beat([7, 10])
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.10)
      .noCarrierOctaves()
      .overlays([SOLFEGGIO.SOL], 0.06)
      .purpose('Gentle return carrying sacredness, awe, and meaning into embodied awareness')
      .build(),
  ],
  breathwork: {
    name: 'Sacred Breath',
    ratio: [4, 4, 4, 4],
    description: 'Box breathing with open heart. Each breath is a prayer. Each exhale an offering.',
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'HOLY',
    pronunciation: 'hoh-lee (whispered with reverence)',
    tonality: 'reverent, awestruck',
    meaning: 'Awe and reverence — recognition of the sacred in all things',
    repeatInterval: 20,
    delivery: 'internal',
  },
  contraindications: {
    absolute: ['Active psychosis', 'Schizophrenia spectrum', 'Severe personality disorders'],
    relative: ['Trauma — mystical states may surface deeply buried material', 'Existential anxiety — may intensify', 'Requires psychological stability and intention'],
    drugInteractions: ['Psychedelics — extreme amplification, do NOT combine', 'MAOIs — serotonergic interaction', 'SSRIs — may blunt or alter experience'],
    specialPopulations: ['Not for minors', 'Experienced meditators only recommended', 'Have integration support available'],
  },
  expectedTimeline: '1 session: Subtle awe and meaning. Multiple sessions: Deeper mystical access.',
  frequencyOfUse: 'Once per week maximum. Mystical experiences require extensive integration time.',
  masterGain: 0.78,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─── Category Export ────────────────────────────────────────────────
export const PSYCHEDELIC_MIMICRY_SPECS: ProtocolSpec[] = [
  psychedelicMimic,
  geometricVisualGateway,
  mysticalExperienceGenerator,
];
