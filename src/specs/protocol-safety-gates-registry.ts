/**
 * Safety gate specifications for protocols.
 * 
 * Based on:
 * - Epilepsy Foundation + epilepsy.org photosensitivity guidelines [web:140][web:143][web:146][web:149]
 * - CDC NIOSH noise exposure limits (cdc.gov/niosh/topics/noise)
 * - Web Audio API best practices (developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
 * - Internal SynSync 12+ years safety data (no serious adverse events), source file 69.
 * 
 * CRITICAL SAFETY CONSTRAINTS:
 * - Photosensitivity: 3-60 Hz flicker is risk range; 16-25 Hz peak risk [web:140][web:143]
 * - Volume: Never exceed comfortable listening levels; provide calibration
 * - Session limits: Progressive loading to avoid nervous system overload, source file 62.
 */

import type { ProtocolSafetyGateSpec } from '../types/spec-safety-gates';

export const PROTOCOL_SAFETY_GATES_REGISTRY: ProtocolSafetyGateSpec[] = [
  {
    protocolId: 'deep_sleep_delta',
    minAgeYears: 13, // Sleep architecture stabilizes post-puberty
    overallRiskSeverity: 'mild',
    contraindications: [
      {
        id: 'active-psychosis',
        description:
          'Active psychosis or severe dissociative disorder. Deep theta/delta states may intensify dissociation.',
        severity: 'severe',
        hardBlock: true,
        rationale:
          'Altered states during deep relaxation may exacerbate symptoms in actively psychotic or dissociative individuals.',
      },
    ],
    volumeCalibration: {
      required: true,
      referenceToneHz: 1000,
      targetSPLdBMin: 50,
      targetSPLdBMax: 70,
      instructions:
        'Adjust volume so the reference tone is clearly audible but comfortable. You should still hear room sounds. Never use at loud or uncomfortable levels.',
    },
    photosensitivity: {
      required: false, // Audio-only protocol
      questionText: '',
      blockOnPositive: false,
      showEpilepsyWarning: false,
    },
    sessionLimits: {
      maxMinutesPerSession: 60,
      maxMinutesPerDay: 90,
      maxSessionsPerDay: 2,
      minCoolDownMinutes: 120,
    },
    emergencyCopy:
      'If you experience chest pain, difficulty breathing, confusion, or suicidal thoughts, stop immediately and call emergency services (911 in US). This protocol is not a substitute for medical care.',
  },

  {
    protocolId: 'anxiety_relief_v4',
    minAgeYears: 13,
    overallRiskSeverity: 'mild',
    contraindications: [
      {
        id: 'bipolar-mania',
        description:
          'Currently experiencing manic or hypomanic episode. Alpha-theta protocols may destabilize mood.',
        severity: 'moderate',
        hardBlock: false, // Warn but allow override in consultation with provider
        rationale:
          'Relaxation protocols can occasionally trigger mood shifts in bipolar disorder during manic phases.',
      },
    ],
    volumeCalibration: {
      required: true,
      referenceToneHz: 440,
      targetSPLdBMin: 50,
      targetSPLdBMax: 65,
      instructions:
        'Adjust to comfortable, clearly audible level. Should not be loud. You should hear background sounds.',
    },
    photosensitivity: {
      required: false,
      questionText: '',
      blockOnPositive: false,
      showEpilepsyWarning: false,
    },
    sessionLimits: {
      maxMinutesPerSession: 30,
      maxMinutesPerDay: 60,
      maxSessionsPerDay: 3,
      minCoolDownMinutes: 60,
    },
    emergencyCopy:
      'If you experience panic attacks, chest pain, or suicidal ideation, stop and contact emergency services immediately. This is NOT a replacement for therapy or medication.',
  },

  {
    protocolId: 'focus_v5_professional',
    minAgeYears: 13,
    overallRiskSeverity: 'mild',
    contraindications: [
      {
        id: 'epilepsy-photosensitive',
        description:
          'Photosensitive epilepsy or history of seizures triggered by flashing lights or rhythmic sounds.',
        severity: 'severe',
        hardBlock: true,
        rationale:
          '40 Hz gamma protocols involve rhythmic stimulation that may trigger seizures in photosensitive individuals. Absolute contraindication.',
      },
    ],
    volumeCalibration: {
      required: true,
      referenceToneHz: 1000,
      targetSPLdBMin: 55,
      targetSPLdBMax: 70,
      instructions:
        'Adjust so you can clearly hear the beats but volume is comfortable. Should not be loud.',
    },
    photosensitivity: {
      required: true, // 40 Hz gamma content
      questionText:
        'Have you ever had a seizure triggered by flashing lights, rhythmic sounds, or visual patterns? Or do you have a diagnosed seizure disorder?',
      blockOnPositive: true,
      showEpilepsyWarning: true,
    },
    sessionLimits: {
      maxMinutesPerSession: 25,
      maxMinutesPerDay: 75,
      maxSessionsPerDay: 3,
      minCoolDownMinutes: 30,
    },
    emergencyCopy:
      'If you experience visual disturbances, confusion, muscle twitching, or any seizure-like symptoms, stop immediately and contact emergency services. Do not use if you have photosensitive epilepsy.',
  },

  {
    protocolId: 'neuroshiver_gamma',
    minAgeYears: 18, // More intense gamma content; adult use only
    overallRiskSeverity: 'moderate',
    contraindications: [
      {
        id: 'epilepsy-any',
        description:
          'Any history of epilepsy or seizure disorder. High-intensity 40 Hz gamma is absolute contraindication.',
        severity: 'severe',
        hardBlock: true,
        rationale:
          'Intense gamma-range stimulation may lower seizure threshold in susceptible individuals.',
      },
      {
        id: 'migraine-aura',
        description:
          'Frequent migraines with aura. Rhythmic stimulation may trigger migraine in sensitive individuals.',
        severity: 'moderate',
        hardBlock: false,
        rationale:
          'Some migraine sufferers report sensitivity to rhythmic visual or auditory stimuli.',
      },
    ],
    volumeCalibration: {
      required: true,
      referenceToneHz: 1000,
      targetSPLdBMin: 55,
      targetSPLdBMax: 70,
      instructions:
        'Adjust to comfortable level. High-frequency content should be clear but NOT loud. Start lower and increase gradually.',
    },
    photosensitivity: {
      required: true,
      questionText:
        'Have you ever experienced a seizure, migraine with aura, or unusual visual/neurological symptoms in response to flashing lights or rhythmic sounds?',
      blockOnPositive: true,
      showEpilepsyWarning: true,
    },
    sessionLimits: {
      maxMinutesPerSession: 20,
      maxMinutesPerDay: 40,
      maxSessionsPerDay: 2,
      minCoolDownMinutes: 120,
    },
    emergencyCopy:
      'STOP IMMEDIATELY if you experience: visual disturbances, confusion, muscle twitching, severe headache, nausea, or any seizure-like symptoms. Call 911. Do not use if you have epilepsy or migraine with aura.',
  },

  // 🔬 Experimental: Alpha-theta addiction recovery protocol
  // RVP: Adjunct to professional treatment only; audio ≠ neurofeedback
  {
    protocolId: 'neurorecovery_peniston',
    minAgeYears: 18,
    overallRiskSeverity: 'moderate',
    contraindications: [
      {
        id: 'acute-detox',
        description:
          'Currently in acute alcohol or substance withdrawal / detox without medical supervision.',
        severity: 'severe',
        hardBlock: true,
        rationale:
          'Acute withdrawal requires medical care. Alpha-theta style protocols are adjunctive, not standalone treatment.',
      },
      {
        id: 'active-psychosis-trauma',
        description:
          'Active psychosis or severe untreated trauma where altered states may destabilize functioning.',
        severity: 'severe',
        hardBlock: true,
        rationale:
          'Deep alpha-theta states may intensify dissociation, flashbacks, or psychosis in unstable individuals.',
      },
      {
        id: 'bipolar-mania-history',
        description:
          'History of manic episodes where deep relaxation practices have previously triggered mood swings.',
        severity: 'moderate',
        hardBlock: false,
        rationale:
          'Some individuals with bipolar spectrum conditions can destabilize with intense relaxation or trauma-processing states.',
      },
    ],
    volumeCalibration: {
      required: true,
      referenceToneHz: 440,
      targetSPLdBMin: 50,
      targetSPLdBMax: 65,
      instructions:
        'Set volume so the audio is clearly audible but not loud. You should be able to hear your surroundings.',
    },
    photosensitivity: {
      required: false,
      questionText: '',
      blockOnPositive: false,
      showEpilepsyWarning: false,
    },
    sessionLimits: {
      maxMinutesPerSession: 45,
      maxMinutesPerDay: 60,
      maxSessionsPerDay: 1,
      minCoolDownMinutes: 240,
    },
    emergencyCopy:
      'This protocol is designed to support recovery as an adjunct to professional addiction treatment. If you experience intense cravings, suicidal thoughts, or risk of relapse, stop immediately and contact your treatment team or emergency services (911 in the US). Do not use this as a replacement for detox, rehab, or medical care.',
  },

  // ⚠️ Speculative: Schumann resonance protocol (exploratory)
  // RVP: No clinical validation; traditional wellness concept only
  {
    protocolId: 'schumann_resonance_7_83',
    minAgeYears: 13,
    overallRiskSeverity: 'mild',
    contraindications: [
      {
        id: 'severe-insomnia-untreated',
        description:
          'Severe, persistent insomnia or mood symptoms without medical evaluation.',
        severity: 'moderate',
        hardBlock: false,
        rationale:
          'Exploratory protocol only. Severe, persistent symptoms warrant medical workup rather than relying on speculative interventions.',
      },
    ],
    volumeCalibration: {
      required: true,
      referenceToneHz: 440,
      targetSPLdBMin: 45,
      targetSPLdBMax: 60,
      instructions:
        'Keep volume low and comfortable, more like background ambience than active listening. You should still hear room sounds.',
    },
    photosensitivity: {
      required: false,
      questionText: '',
      blockOnPositive: false,
      showEpilepsyWarning: false,
    },
    sessionLimits: {
      maxMinutesPerSession: 30,
      maxMinutesPerDay: 60,
      maxSessionsPerDay: 2,
      minCoolDownMinutes: 60,
    },
    emergencyCopy:
      'This is an exploratory protocol inspired by traditional wellness concepts, not a clinically validated treatment. If you notice worsening mood, anxiety, or sleep, stop use and consult a qualified health professional. For chest pain, suicidal thoughts, or medical emergencies, call 911 immediately.',
  },
];
