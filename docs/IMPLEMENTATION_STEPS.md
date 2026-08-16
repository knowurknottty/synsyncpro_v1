# 🚀 Goal-Based Routine Builder - Implementation Guide

## Prerequisites

✅ You have:
- React app with TypeScript
- Tailwind CSS configured
- Protocol data in `types.ts` with `evidenceGradeNew` field
- Access to all protocols via `getAllProtocols()` function

## Step 1: Copy Core Files

### 1.1 Copy Constants
```bash
# Copy goal mapping
cp goal-mapping.ts src/constants/
```

Verify the file imports your Protocol type:
```typescript
import type { Protocol, EvidenceGrade } from '../../types';
```

### 1.2 Copy Utils
```bash
# Copy matching algorithm
cp protocol-matcher.ts src/utils/
```

Verify imports:
```typescript
import { GOAL_TAXONOMY, TIME_OF_DAY_MAPPING, EXPERIENCE_REQUIREMENTS, CONTRAINDICATION_SCREENING } from '../constants/goal-mapping';
import type { Protocol, EvidenceGrade } from '../../types';
```

### 1.3 Copy Components
```bash
# Copy UI components
cp GoalQuestionnaire.tsx src/components/
cp RoutineDisplay.tsx src/components/
```

## Step 2: Verify Type Compatibility

### 2.1 Check Protocol Interface
Your `types.ts` should have:
```typescript
export type EvidenceGrade = 'established' | 'experimental' | 'speculative';

export interface Protocol {
  id: string;
  title: string;
  description: string;
  duration: number; // in seconds
  evidenceGradeNew?: EvidenceGrade;
  disclaimer?: string;
  contraindications?: string[];
  contraindicationsSeverity?: 'mild' | 'moderate' | 'severe';
  validationStatus?: 'validated' | 'pilot-data' | 'needs-validation';
  optimalTimeOfDay?: string;
  cumulativeEffect?: boolean;
  requiredSessions?: number;
  // ... other fields
}
```

### 2.2 Add Missing Fields (if needed)
If your Protocol interface is missing any fields, add them:
```typescript
// In types.ts
export interface Protocol {
  // ... existing fields
  evidenceGradeNew?: EvidenceGrade;
  disclaimer?: string;
  contraindications?: string[];
  contraindicationsSeverity?: 'mild' | 'moderate' | 'severe';
  validationStatus?: 'validated' | 'pilot-data' | 'needs-validation';
}
```

## Step 3: Create Wrapper Component

Create a new file: `src/components/RoutineBuilder.tsx`

```typescript
// src/components/RoutineBuilder.tsx
import React, { useState } from 'react';
import { GoalQuestionnaire } from './GoalQuestionnaire';
import { RoutineDisplay } from './RoutineDisplay';
import { matchProtocols, buildDailyRoutine } from '../utils/protocol-matcher';
import type { UserPreferences, DailyRoutine } from '../utils/protocol-matcher';

interface RoutineBuilderProps {
  allProtocols: Protocol[];
  onProtocolSelect: (protocolId: string) => void;
  onRoutineStart: (routine: DailyRoutine) => void;
  onClose?: () => void;
}

export const RoutineBuilder: React.FC<RoutineBuilderProps> = ({
  allProtocols,
  onProtocolSelect,
  onRoutineStart,
  onClose
}) => {
  const [routine, setRoutine] = useState<DailyRoutine | null>(null);
  const [showQuestionnaire, setShowQuestionnaire] = useState(true);

  const handleQuestionnaireComplete = (preferences: UserPreferences) => {
    // Match protocols to user preferences
    const recommendations = matchProtocols(allProtocols, preferences);

    // Build optimized daily routine
    const dailyRoutine = buildDailyRoutine(recommendations, preferences.timeBudget);

    // Save to state
    setRoutine(dailyRoutine);
    setShowQuestionnaire(false);

    // Optional: Save to localStorage
    try {
      localStorage.setItem('synsync_last_routine', JSON.stringify(dailyRoutine));
      localStorage.setItem('synsync_last_preferences', JSON.stringify(preferences));
    } catch (e) {
      console.error('Failed to save routine:', e);
    }
  };

  const handleStartRoutine = () => {
    if (routine) {
      onRoutineStart(routine);
    }
  };

  const handleSaveRoutine = () => {
    if (!routine) return;

    // Save to backend or localStorage
    const savedRoutines = JSON.parse(localStorage.getItem('synsync_saved_routines') || '[]');
    savedRoutines.push({
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      routine
    });
    localStorage.setItem('synsync_saved_routines', JSON.stringify(savedRoutines));

    alert('Routine saved!');
  };

  const handleModify = () => {
    setShowQuestionnaire(true);
  };

  if (showQuestionnaire) {
    return (
      <GoalQuestionnaire
        onComplete={handleQuestionnaireComplete}
        onCancel={onClose || (() => setShowQuestionnaire(false))}
      />
    );
  }

  if (routine) {
    return (
      <RoutineDisplay
        routine={routine}
        onProtocolSelect={onProtocolSelect}
        onStartRoutine={handleStartRoutine}
        onModify={handleModify}
        onSave={handleSaveRoutine}
      />
    );
  }

  return null;
};
```

## Step 4: Integrate Into Your App

### 4.1 Add Button to Trigger
In your main UI (e.g., `App.tsx` or `Dashboard.tsx`):

```tsx
import { useState } from 'react';
import { RoutineBuilder } from './components/RoutineBuilder';
import { getAllProtocols } from './specs';

function YourMainComponent() {
  const [showRoutineBuilder, setShowRoutineBuilder] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState(null);

  const handleProtocolSelect = (protocolId: string) => {
    // Navigate to protocol detail view
    const protocol = getAllProtocols().find(p => p.id === protocolId);
    setSelectedProtocol(protocol);
    setShowRoutineBuilder(false);
  };

  const handleRoutineStart = (routine) => {
    // Start the first protocol in the routine
    console.log('Starting routine:', routine);

    // Get first protocol from morning/afternoon/evening
    const firstProtocol = routine.morning[0] || routine.afternoon[0] || routine.evening[0];
    if (firstProtocol) {
      handleProtocolSelect(firstProtocol.protocol.id);
    }
  };

  return (
    <div>
      {/* Your existing UI */}
      <button
        onClick={() => setShowRoutineBuilder(true)}
        className="px-6 py-3 bg-neuro-500 hover:bg-neuro-600 text-white font-bold rounded-lg"
      >
        🎯 Build My Routine
      </button>

      {/* Routine Builder Modal */}
      {showRoutineBuilder && (
        <RoutineBuilder
          allProtocols={getAllProtocols()}
          onProtocolSelect={handleProtocolSelect}
          onRoutineStart={handleRoutineStart}
          onClose={() => setShowRoutineBuilder(false)}
        />
      )}
    </div>
  );
}
```

### 4.2 Alternative: Add to Navigation
```tsx
// In your navigation/sidebar
<nav>
  <NavItem href="/" icon={Home}>Dashboard</NavItem>
  <NavItem href="/protocols" icon={List}>All Protocols</NavItem>
  <NavItem href="/routine-builder" icon={Target}>Build Routine</NavItem>
  <NavItem href="/my-routines" icon={BookMarked}>My Routines</NavItem>
</nav>
```

## Step 5: Test Integration

### 5.1 Basic Functionality Test
```typescript
// Test in browser console
import { matchProtocols } from './utils/protocol-matcher';

const testPreferences = {
  primaryGoal: 'sleep',
  subGoals: ['sleep-onset'],
  timeBudget: 30,
  daysPerWeek: 5,
  timeOfDay: 'evening',
  experienceLevel: 'beginner',
  evidencePreference: 'experimental-ok',
  contraindications: []
};

const protocols = getAllProtocols();
const recommendations = matchProtocols(protocols, testPreferences);

console.log('Recommendations:', recommendations);
// Should show protocols with scores, reasons, warnings
```

### 5.2 Edge Cases Test
```typescript
// Test 1: No matching protocols
const impossible = {
  primaryGoal: 'sleep',
  subGoals: ['sleep-onset'],
  timeBudget: 5, // Too short
  daysPerWeek: 1,
  timeOfDay: 'morning', // Wrong time
  experienceLevel: 'beginner',
  evidencePreference: 'established-only', // Too strict
  contraindications: ['epilepsy']
};

// Test 2: All contraindications
const maxContraindications = {
  primaryGoal: 'consciousness-exploration',
  subGoals: ['mystical-states'],
  timeBudget: 60,
  daysPerWeek: 7,
  timeOfDay: 'evening',
  experienceLevel: 'advanced',
  evidencePreference: 'all',
  contraindications: ['epilepsy', 'psychosis', 'dissociative']
};
// Should exclude dangerous protocols

// Test 3: Perfect match
const perfectMatch = {
  primaryGoal: 'sleep',
  subGoals: ['power-nap'],
  timeBudget: 20,
  daysPerWeek: 5,
  timeOfDay: 'afternoon',
  experienceLevel: 'beginner',
  evidencePreference: 'established-only',
  contraindications: []
};
// Should return nap_optimizer_20min with high score
```

## Step 6: Customize Protocol Mappings

### 6.1 Add Missing Protocols to Taxonomy
Edit `src/constants/goal-mapping.ts`:

```typescript
// If you have pain protocols:
pain: {
  label: 'Pain Management',
  icon: '💊',
  subGoals: {
    'acute-pain': {
      label: 'Acute pain relief',
      protocols: ['your_pain_protocol_id'], // Add your protocol ID
      evidenceLevels: ['experimental']
    }
  }
}
```

### 6.2 Adjust Scoring Weights
Edit `src/utils/protocol-matcher.ts`:

```typescript
// In calculateMatchScore function
function calculateMatchScore(protocol, relevantProtocolIds, preferences) {
  let score = 0;

  // Customize these weights based on what matters most
  if (relevantProtocolIds.has(protocol.id)) {
    score += 50; // Increase from 40 if goal match is most important
  }

  // Adjust evidence scoring
  if (grade === 'established') {
    score += 40; // Increase from 30 if evidence is critical
  }

  // ... rest of scoring
}
```

### 6.3 Add Custom Time Mappings
```typescript
// In goal-mapping.ts
export const TIME_OF_DAY_MAPPING = {
  morning: [
    'focus_v5_professional',
    'your_morning_protocol', // Add custom protocols
  ],
  // ...
};
```

## Step 7: Style Customization

### 7.1 Match Your Color Scheme
Global search/replace in components:

```typescript
// Current colors:
'neuro-500' → 'your-primary-500'
'neuro-700' → 'your-primary-700'
'neuro-900' → 'your-primary-900'

// Evidence colors (keep these semantic):
'green-500' // Established
'yellow-500' // Experimental
'blue-500' // Exploratory
```

### 7.2 Adjust Spacing
```typescript
// In GoalQuestionnaire.tsx
className="p-6" // Change padding
className="space-y-4" // Change vertical spacing
className="gap-3" // Change grid gaps
```

## Step 8: Add Analytics

### 8.1 Track User Flow
```typescript
// In GoalQuestionnaire.tsx
const handleNext = () => {
  // Track step completion
  analytics.track('Routine Builder Step Complete', {
    step: step,
    primaryGoal: preferences.primaryGoal,
    subGoalsCount: preferences.subGoals?.length || 0
  });

  // ... existing code
};
```

### 8.2 Track Routine Generation
```typescript
// In RoutineBuilder.tsx
const handleQuestionnaireComplete = (preferences) => {
  const recommendations = matchProtocols(allProtocols, preferences);
  const dailyRoutine = buildDailyRoutine(recommendations, preferences.timeBudget);

  // Track successful generation
  analytics.track('Routine Generated', {
    primaryGoal: preferences.primaryGoal,
    protocolCount: dailyRoutine.morning.length + dailyRoutine.afternoon.length + dailyRoutine.evening.length,
    totalDuration: dailyRoutine.totalDuration,
    evidencePreference: preferences.evidencePreference
  });

  setRoutine(dailyRoutine);
};
```

## Step 9: Error Handling

### 9.1 Add Error Boundaries
```typescript
// ErrorBoundary.tsx
class RoutineBuilderErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Routine Builder Error:', error, errorInfo);
    // Log to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center">
          <h2>Something went wrong</h2>
          <p>Please try again or contact support</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrap RoutineBuilder
<RoutineBuilderErrorBoundary>
  <RoutineBuilder {...props} />
</RoutineBuilderErrorBoundary>
```

### 9.2 Validate Protocol Data
```typescript
// In protocol-matcher.ts
export function matchProtocols(allProtocols, preferences) {
  // Validate inputs
  if (!allProtocols || allProtocols.length === 0) {
    console.error('No protocols available');
    return [];
  }

  if (!preferences.primaryGoal || !preferences.subGoals) {
    console.error('Invalid preferences');
    return [];
  }

  // ... rest of matching logic
}
```

## Step 10: Performance Optimization

### 10.1 Memoize Protocol Matching
```typescript
// In RoutineBuilder.tsx
import { useMemo } from 'react';

const recommendations = useMemo(() => {
  return matchProtocols(allProtocols, preferences);
}, [allProtocols, preferences]);
```

### 10.2 Lazy Load Components
```typescript
// In App.tsx
import { lazy, Suspense } from 'react';

const RoutineBuilder = lazy(() => import('./components/RoutineBuilder'));

// Usage
<Suspense fallback={<LoadingSpinner />}>
  {showRoutineBuilder && <RoutineBuilder {...props} />}
</Suspense>
```

## Common Issues & Solutions

### Issue 1: Protocol IDs Don't Match
**Problem:** Protocol IDs in goal-mapping.ts don't match actual protocol IDs
**Solution:**
```typescript
// Check your actual protocol IDs
console.log(getAllProtocols().map(p => p.id));

// Update goal-mapping.ts to match
'sleep-onset': {
  protocols: ['actual_protocol_id_from_your_system']
}
```

### Issue 2: Missing Protocol Fields
**Problem:** Protocols missing `evidenceGradeNew` or other fields
**Solution:**
```typescript
// Add default values in protocol-matcher.ts
const grade = protocol.evidenceGradeNew || 'speculative';
const severity = protocol.contraindicationsSeverity || 'mild';
```

### Issue 3: Import Errors
**Problem:** Cannot find module errors
**Solution:**
```typescript
// Check relative paths match your structure
// If files are in different locations, adjust:
import { GOAL_TAXONOMY } from '../constants/goal-mapping';
// vs
import { GOAL_TAXONOMY } from '../../constants/goal-mapping';
```

### Issue 4: Type Errors
**Problem:** TypeScript errors about missing types
**Solution:**
```typescript
// Make fields optional in types.ts
export interface Protocol {
  evidenceGradeNew?: EvidenceGrade; // Add ?
  disclaimer?: string; // Add ?
}
```

## Verification Checklist

- [ ] All files copied to correct locations
- [ ] Import paths updated for your structure
- [ ] Protocol interface has required fields
- [ ] Goal mappings use actual protocol IDs
- [ ] Test with different user preferences
- [ ] Error handling in place
- [ ] Analytics tracking added
- [ ] Colors match your brand
- [ ] Mobile responsive (test on phone)
- [ ] Accessibility (keyboard navigation)

## Next Steps

1. **Test with Real Users:** Get feedback on questionnaire flow
2. **Iterate on Mappings:** Refine protocol mappings based on usage
3. **Add More Goals:** Expand taxonomy as you add protocols
4. **Track Effectiveness:** Measure which routines users complete
5. **Build Feedback Loop:** Let users rate routine effectiveness

---

## Quick Troubleshooting Commands

```bash
# Check if files are in place
ls -la src/constants/goal-mapping.ts
ls -la src/utils/protocol-matcher.ts
ls -la src/components/GoalQuestionnaire.tsx
ls -la src/components/RoutineDisplay.tsx

# Test protocol matching in Node
node -e "
const { matchProtocols } = require('./src/utils/protocol-matcher');
const protocols = require('./src/specs').getAllProtocols();
console.log('Loaded', protocols.length, 'protocols');
"

# Check for TypeScript errors
npm run type-check
# or
tsc --noEmit
```

---

## Support

If you encounter issues:
1. Check the console for errors
2. Verify protocol IDs match
3. Test with simple preferences first
4. Review the GOAL_SYSTEM_GUIDE.md for details

**You're ready to launch!** 🚀
