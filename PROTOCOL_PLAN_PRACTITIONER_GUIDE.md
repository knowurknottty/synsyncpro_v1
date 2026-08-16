# Protocol Plan System - Practitioner Guide

## Overview

The Protocol Plan system allows practitioners to create structured, scheduled brainwave entrainment programs for clients using SynSync Pro.

**Key Capabilities**:
- Multi-phase treatment plans with progression
- Flexible scheduling (daily, 2x/day, 3x/week, weekly, as-needed)
- Metrics tracking (scale, boolean, text, number)
- Check-ins at specific timepoints
- Milestone-based motivation
- Conditional logic for dynamic adjustments
- SHA-256 tamper detection

---

## Creating a Protocol Plan

Protocol Plans are JSON files following the schema in `PROTOCOL_PLAN_SCHEMA.json`. See `SAMPLE_PROTOCOL_PLAN.json` for a complete example.

### Minimum Required Structure

```json
{
  "schema_version": "1.0.0",
  "type": "protocol_plan",
  "meta": {
    "practitioner": {
      "name": "Your Name",
      "credentials": "Your Credentials"
    },
    "patient": {
      "identifier": "anonymous-id-123"
    },
    "created_date": "2026-02-23T00:00:00Z",
    "plan_version": "1"
  },
  "plan": {
    "title": "Plan Title",
    "description": "Plan description",
    "primary_goal": "Primary goal",
    "duration_weeks": 8
  },
  "schedule": {
    "timezone": "America/New_York",
    "phases": [/* ... */]
  },
  "protocols": {
    "allowed_protocols": ["acsw", "atb-10"]
  },
  "tracking": {
    "required_metrics": [/* ... */],
    "check_ins": [/* ... */],
    "milestones": [/* ... */]
  },
  "instructions": {
    "before_starting": "...",
    "during_session": "...",
    "after_session": "...",
    "if_missed_session": "..."
  },
  "consent": {
    "text": "Full consent form text",
    "acknowledgments": ["Point 1", "Point 2"],
    "signature_required": true
  },
  "security": {
    "plan_hash": "sha256-hash-here"
  }
}
```

---

## Available Protocols

### Core Protocols
- `acsw` - Alpha-Theta Crossover Stress Relief
- `atb-10` - Alpha-Theta-Beta 10 Hz Creative Flow
- `tg-cfc` - Theta-Gamma Cross-Frequency Coupling
- `ti-pbm` - Theta Integration with Photobiomodulation
- `mgs-40` - Multimodal Gamma Synchronization 40 Hz
- `smr-mu` - SMR-Mu Motor Learning Protocol
- `hci-639` - Heart Coherence Induction 639 Hz
- `gmu-1.5` - Gamma-Mu 1.5 Hz Manifestation
- `rf-hrv` - Respiratory Feedback HRV Protocol

See `src/audio/constants.ts` for the complete list of 80+ protocols.

---

## Phase Structure

Phases are sequential treatment stages:

```json
{
  "phase_number": 1,
  "title": "Foundation Phase",
  "description": "Establishing baseline",
  "start_day": 1,
  "duration_days": 14,
  "sessions": [
    {
      "session_id": "morning-session",
      "protocol_id": "acsw",
      "frequency": "daily",
      "time_of_day": "morning",
      "preferred_time": "08:00",
      "required": true
    }
  ],
  "rest_days": [0, 6]
}
```

### Frequency Options
- `daily`: Every day
- `2x_per_day`: Morning and evening
- `3x_per_week`: Monday, Wednesday, Friday
- `weekly`: Once per week
- `as_needed`: User-initiated (not auto-scheduled)

### Time Windows
- `time_of_day`: morning | afternoon | evening | night
- `preferred_time`: "HH:MM" (24-hour format)
- `time_window_minutes`: Flexibility around preferred time (default: 30)

---

## Metrics Tracking

Define metrics to track progress:

```json
{
  "metric_id": "anxiety_level",
  "label": "Anxiety Level",
  "type": "scale",
  "scale_min": 1,
  "scale_max": 10,
  "scale_labels": {
    "1": "Completely calm",
    "10": "Extreme anxiety"
  },
  "frequency": "per_session",
  "required": true,
  "description": "Rate your current anxiety"
}
```

### Metric Types
- **scale**: Slider input (1-10, 0-100, etc.)
- **boolean**: Yes/No toggle
- **text**: Free-form text area
- **number**: Numeric input

### Frequency Options
- `per_session`: Before/after each session
- `daily`: Once per day
- `weekly`: Once per week

---

## Check-Ins

Structured questionnaires at specific timepoints:

```json
{
  "check_in_id": "week-1-check",
  "title": "Week 1 Check-In",
  "day": 7,
  "questions": [
    {
      "question_id": "q1",
      "question_text": "How has your sleep quality been?",
      "response_type": "scale",
      "scale_range": [1, 10],
      "required": true
    }
  ],
  "required": true
}
```

---

## Milestones

Celebrate achievements:

```json
{
  "milestone_id": "first-week",
  "title": "Week 1 Complete",
  "description": "You've completed your first week!",
  "day": 7,
  "reward_message": "Keep up the great work!",
  "badge_icon": "star"
}
```

Milestone triggers:
- `day`: Specific day number
- `required_sessions`: Number of sessions completed

---

## Conditional Logic

Dynamic plan adjustments based on metrics:

```json
{
  "rule_id": "high-anxiety-rule",
  "condition": {
    "metric_id": "anxiety_level",
    "operator": ">=",
    "value": 8,
    "duration_days": 3
  },
  "action": {
    "type": "suggest_extra_session",
    "message": "Your anxiety has been elevated. Consider an extra calming session.",
    "protocol_id": "acsw"
  },
  "priority": "high"
}
```

### Action Types
- `show_reminder`: Display notification
- `show_warning`: Display warning modal
- `suggest_extra_session`: Suggest additional session
- `extend_phase`: Add days to current phase

---

## Security

### SHA-256 Hash

Generate hash of plan JSON (excluding security section):

```bash
# Using Node.js
node -e "
const crypto = require('crypto');
const fs = require('fs');
const plan = JSON.parse(fs.readFileSync('plan.json'));
delete plan.security;
const hash = crypto.createHash('sha256')
  .update(JSON.stringify(plan))
  .digest('hex');
console.log(hash);
"
```

Add the hash to your plan:

```json
{
  "security": {
    "plan_hash": "abc123..."
  }
}
```

---

## Best Practices

### 1. Start Simple
- Begin with single-phase plans
- Use daily frequency for consistency
- Add complexity gradually

### 2. Progressive Overload
- Increase protocol complexity in later phases
- Start with alpha-theta, progress to gamma
- Allow adaptation time between phases

### 3. Track Meaningfully
- Limit required metrics (3-5 max)
- Use scales for subjective measures
- Make daily metrics quick (< 1 minute)

### 4. Motivate with Milestones
- Set milestones at 7, 14, 30, 60 days
- Provide encouraging messages
- Celebrate small wins

### 5. Plan for Non-Adherence
- Provide clear "if missed session" guidance
- Use conditional logic to detect patterns
- Build in flexibility where appropriate

---

## Common Patterns

### Sleep Improvement (4 weeks)
- **Phase 1 (Week 1-2)**: Delta protocols, nightly
- **Phase 2 (Week 3-4)**: Theta-Delta blend, nightly
- **Metrics**: Sleep quality, time to fall asleep
- **Check-ins**: Weekly sleep diary

### Anxiety Reduction (8 weeks)
- **Phase 1 (Week 1-3)**: Alpha protocols, daily
- **Phase 2 (Week 4-6)**: Alpha-Theta, daily
- **Phase 3 (Week 7-8)**: Maintenance, 3x/week
- **Metrics**: Daily anxiety scale (1-10)
- **Conditional**: Suggest extra session if anxiety > 7

### Focus Enhancement (6 weeks)
- **Phase 1 (Week 1-2)**: SMR training, daily
- **Phase 2 (Week 3-4)**: Beta protocols, 2x/day
- **Phase 3 (Week 5-6)**: Gamma protocols, daily
- **Metrics**: Focus rating, productivity hours
- **Milestones**: 7, 14, 30, 42 days

---

## Validation Checklist

Before sharing a plan:

- [ ] All protocol IDs exist in SynSync Pro
- [ ] Timezone is valid (IANA format)
- [ ] Dates are ISO 8601 format
- [ ] Phase days are continuous (no gaps)
- [ ] Session frequencies are realistic
- [ ] Required metrics are manageable
- [ ] Consent text is comprehensive
- [ ] SHA-256 hash is correct
- [ ] Test import in SynSync Pro
- [ ] Review all validation warnings

---

## Legal Considerations

**Critical**: Protocol Plans are NOT medical prescriptions.

Required disclaimers:
1. Plans are wellness recommendations
2. Not a substitute for medical care
3. User can modify/pause/stop at any time
4. No practitioner-patient relationship created
5. Consult doctor for medical conditions

See `PRESCRIPTION_SYSTEM_ANALYSIS.md` for complete legal considerations.

---

## Support

For technical questions about plan creation:
- Review `PROTOCOL_PLAN_SCHEMA.json` for schema details
- See `SAMPLE_PROTOCOL_PLAN.json` for complete example
- Check validation errors carefully
- Test plans before distributing

For protocol selection guidance:
- Review protocol evidence levels in app
- Check contraindications carefully
- Start conservative, progress gradually
