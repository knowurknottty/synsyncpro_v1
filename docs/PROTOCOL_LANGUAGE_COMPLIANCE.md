# Protocol Language Compliance Fix

## Principles
1. Keep all protocols - nothing deleted
2. Be honest about evidence level
3. Position as experimental/tunable technology
4. Clear about what's validated vs. needs study
5. Users as co-researchers in validation

## Language Replacement Rules

### REMOVE (Implies Clinical Validation)
- ❌ "Clinical-Grade"
- ❌ "Medical-Grade"
- ❌ "Clinically Proven"
- ❌ "FDA-Approved"
- ❌ "Treats" / "Cures" / "Diagnoses"

### REPLACE WITH (Evidence-Appropriate)
- ✅ "Research-Based" (for protocols with studies)
- ✅ "Experimentally Designed" (for theory-based)
- ✅ "User-Validated" (for crowdsourced data)
- ✅ "Exploratory Protocol" (for speculative)

### SPECIFIC PERCENTAGE CLAIMS

**BEFORE:**
"Fall asleep 50% faster, increase deep sleep by 40%"

**AFTER (with evidence):**
"May support sleep onset and deep sleep duration. One pilot study (n=24) found increased N3 stage. Individual results vary significantly."

**AFTER (without evidence):**
"Designed to support sleep onset. Effects not yet validated in controlled studies. Help us validate - track your results!"

### MECHANISM CLAIMS

**BEFORE:**
"Activates NMDA receptors for LTP"

**AFTER:**
"Targets theta-gamma coupling associated with NMDA receptor activation in animal studies. Human validation pending."

### SOLFEGGIO / SCHUMANN CLAIMS

**BEFORE:**
"528 Hz repairs DNA" / "7.83 Hz Schumann resonance healing"

**AFTER:**
"Includes 528 Hz (solfeggio frequency). Theoretical benefits not scientifically validated. Included based on traditional use and user preference."

## Fixed Protocol Examples

### Deep Sleep Delta - BEFORE
```typescript
description: 'Clinical-Grade Sleep Induction',
usageGoal: 'Fall asleep 50% faster, increase deep sleep (N3) duration, wake feeling restored. Clinical studies show significant improvement in sleep quality.',
```

### Deep Sleep Delta - AFTER
```typescript
description: 'Deep Sleep Induction Protocol',
usageGoal: 'Designed to support sleep onset and N3 deep sleep stage. Based on pilot study (Jirakittayakorn 2018, n=24) showing increased delta activity. Individual results vary. Track your outcomes to help validate.',
evidenceGrade: 'experimental' as EvidenceGrade,
disclaimer: 'Experimental protocol. One small study showed positive results. Not a substitute for medical treatment of sleep disorders.',
```

### LTP Activator - BEFORE
```typescript
usageGoal: 'Activate long-term potentiation (LTP) at synaptic level for permanent circuit strengthening.',
```

### LTP Activator - AFTER
```typescript
usageGoal: 'Targets theta-gamma coupling associated with LTP in animal models (Bikbaev & Manahan-Vaughan 2008). Human efficacy not established. Experimental protocol for learning support.',
evidenceGrade: 'speculative' as EvidenceGrade,
disclaimer: 'Based on neuroscience research but not validated for human brainwave entrainment. Exploratory protocol.',
```

### Schumann Resonance - BEFORE
```typescript
researchContext: '7.83Hz Schumann resonance entrains natural circadian rhythms.',
```

### Schumann Resonance - AFTER
```typescript
researchContext: 'Frequency matches Earth\'s Schumann resonance (~7.83Hz). Proposed circadian benefits lack scientific validation. Included for experimental purposes and user interest.',
evidenceGrade: 'speculative' as EvidenceGrade,
disclaimer: 'Speculative protocol based on frequency coincidence. Limited scientific evidence. User feedback requested.',
```

## Add Universal Disclaimer

Add to EVERY protocol:

```typescript
universalDisclaimer: `⚠️ EXPERIMENTAL TECHNOLOGY

This protocol has not been evaluated by the FDA. Not intended to diagnose, treat, cure, or prevent any disease. Individual results vary significantly.

Evidence Level: [Established/Experimental/Speculative]
Your Role: Help us validate by tracking your results

Not a substitute for professional medical advice. Consult healthcare provider for medical conditions.`,
```

## Evidence Grade Badges

```typescript
export type EvidenceGrade = 'established' | 'experimental' | 'speculative';

// Display in UI as:
established: '✓ Established Evidence'
experimental: '⚡ Experimental'
speculative: '🔬 Exploratory'
```

## Crowdsource Validation Language

Add to protocols needing validation:

```typescript
validationRequest: {
  status: 'seeking-data',
  description: 'We need your help validating this protocol. Track your subjective experience and share results.',
  metrics: ['sleep_quality', 'sleep_latency', 'wake_feeling'],
  targetSampleSize: 100,
  currentSampleSize: 0,
}
```

## Safe Marketing Copy

### Landing Page
**BEFORE:**
"Clinical-grade brainwave entrainment for peak performance"

**AFTER:**
"Open-source brainwave entrainment platform. 100+ experimental protocols based on neuroscience research. Help us validate what works. Your brain, your data, your control."

### Protocol Categories

1. **Evidence-Based (✓)**
   - Pre-operative anxiety reduction (3 RCTs)
   - Alpha-theta for relaxation (multiple studies)
   - Binaural beats for subjective calm (meta-analysis g=0.45)

2. **Experimental (⚡)**
   - Sleep onset protocols (1-2 small studies)
   - Cognitive enhancement (mixed evidence)
   - Pain management (limited trials)

3. **Exploratory (🔬)**
   - LTP activation (animal model basis)
   - Myelination support (theoretical)
   - Solfeggio frequencies (traditional use)

## Implementation Checklist

- [ ] Add EvidenceGrade type to types.ts
- [ ] Add universalDisclaimer field to Protocol interface
- [ ] Add disclaimer property to each protocol
- [ ] Update all "Clinical-Grade" → appropriate replacement
- [ ] Add caveats to specific percentage claims
- [ ] Update researchContext for speculative mechanisms
- [ ] Add validationRequest to exploratory protocols
- [ ] Create evidence badge component for UI
- [ ] Update landing page copy
- [ ] Add "Help Us Validate" section to UI

## Legal Protection Boilerplate

Add to Terms of Service:

```
EXPERIMENTAL TECHNOLOGY ACKNOWLEDGMENT

SynSync Pro is an experimental research platform for brainwave entrainment.
Protocols are categorized by evidence level:

- ESTABLISHED: Supported by peer-reviewed research (may still not work for you)
- EXPERIMENTAL: Limited studies, promising but unproven
- EXPLORATORY: Theoretical basis, human efficacy unknown

By using SynSync Pro, you acknowledge:
1. You are participating in experimental technology validation
2. Individual results vary significantly and unpredictably
3. This is not medical treatment or medical advice
4. You will consult healthcare providers for medical conditions
5. Your anonymized usage data may contribute to research

This platform is for educational and experimental purposes. We make no
guarantees about efficacy for any individual user. Help us learn what works.
```

## README / About Page

```markdown
# SynSync Pro: Open Neuroacoustic Research Platform

## What This Is
An open-source platform for experimenting with brainwave entrainment protocols.
100+ protocols based on neuroscience research, from well-studied to highly exploratory.

## What This Is NOT
- Not FDA-approved medical treatment
- Not a replacement for healthcare
- Not guaranteed to work for you

## Evidence Transparency
We grade every protocol:
- ✓ **Established**: Multiple peer-reviewed studies
- ⚡ **Experimental**: Limited research, promising signals
- 🔬 **Exploratory**: Theoretical basis, needs validation

## Your Role
You're not just a user - you're a co-researcher. Track your results,
share feedback, help us learn what actually works vs. what's theoretical.

## The Vision
A "universal remote control for brains" that's:
- Open source
- Evidence-based (where evidence exists)
- Honest about uncertainty
- Improved by community validation

We don't know which protocols will work best for which people.
Let's figure it out together.
```

---

## Next Steps

1. Run through all protocol files
2. Apply fixes systematically
3. Add evidence grades
4. Create UI components for disclaimers
5. Update marketing copy
6. Launch as "public beta - validation needed"

This positions you as the HONEST alternative to Brain.fm et al who hide
behind vague "clinical studies" without specifics.
