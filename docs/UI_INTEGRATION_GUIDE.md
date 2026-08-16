# 🎨 Evidence Transparency UI - Integration Guide

## Components Created

### 1. ProtocolEvidenceBadge
**Location:** `src/components/ProtocolEvidenceBadge.tsx`

**Usage:**
```tsx
import { ProtocolEvidenceBadge } from './components/ProtocolEvidenceBadge';

<ProtocolEvidenceBadge
  grade={protocol.evidenceGradeNew}
  size="md"
  showLabel={true}
/>
```

**Props:**
- `grade`: 'established' | 'experimental' | 'speculative'
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `showLabel`: boolean (default: true)

**Badges:**
- ✓ Established (green) - Peer-reviewed research
- ⚡ Experimental (yellow) - Limited studies
- 🔬 Exploratory (blue) - Theoretical basis

---

### 2. ProtocolDisclaimer
**Location:** `src/components/ProtocolDisclaimer.tsx`

**Usage:**
```tsx
import { ProtocolDisclaimer } from './components/ProtocolDisclaimer';

<ProtocolDisclaimer protocol={selectedProtocol} />
```

**Shows:**
- Evidence badge
- Protocol-specific disclaimer
- Evidence-level disclaimer
- Contraindications (with severity warnings)
- Universal FDA disclaimer
- "Help us validate" call-to-action

---

### 3. UniversalDisclaimerModal
**Location:** `src/components/UniversalDisclaimerModal.tsx`

**Usage:**
```tsx
import { UniversalDisclaimerModal } from './components/UniversalDisclaimerModal';

function App() {
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  return (
    <>
      <UniversalDisclaimerModal onAccept={() => setDisclaimerAccepted(true)} />
      {disclaimerAccepted && <MainApp />}
    </>
  );
}
```

**Features:**
- Shows once on first use (localStorage)
- Explains what SynSync is and isn't
- Evidence grading system explanation
- Safety information
- Requires checkbox acknowledgment
- Cannot proceed without acceptance

---

### 4. EvidenceFilter
**Location:** `src/components/EvidenceFilter.tsx`

**Usage:**
```tsx
import { EvidenceFilter } from './components/EvidenceFilter';

const [selectedGrades, setSelectedGrades] = useState<EvidenceGrade[]>([
  'established', 'experimental', 'speculative'
]);

const handleToggle = (grade: EvidenceGrade) => {
  setSelectedGrades(prev =>
    prev.includes(grade)
      ? prev.filter(g => g !== grade)
      : [...prev, grade]
  );
};

<EvidenceFilter
  selectedGrades={selectedGrades}
  onToggle={handleToggle}
  protocolCounts={{ established: 2, experimental: 15, speculative: 21 }}
/>
```

**Features:**
- Toggle evidence levels on/off
- Shows protocol counts per level
- "Show All" button
- Explains competitive advantage

---

### 5. ProtocolList (Updated)
**Location:** `components/ProtocolList.tsx`

**Changes:**
- Added evidence badge icons to protocol cards
- Shows ✓/⚡/🔬 next to protocol names
- Color-coded by evidence level

---

## Complete Integration Example

### App.tsx
```tsx
import React, { useState, useEffect } from 'react';
import { UniversalDisclaimerModal } from './src/components/UniversalDisclaimerModal';
import { EvidenceFilter } from './src/components/EvidenceFilter';
import { ProtocolList } from './components/ProtocolList';
import { ProtocolDisclaimer } from './src/components/ProtocolDisclaimer';
import { getAllProtocols } from './src/specs';
import type { Protocol, EvidenceGrade } from './types';

export default function App() {
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);
  const [selectedGrades, setSelectedGrades] = useState<EvidenceGrade[]>([
    'established', 'experimental', 'speculative'
  ]);

  const allProtocols = getAllProtocols();

  // Filter protocols by evidence grade
  const filteredProtocols = allProtocols.filter(p =>
    p.evidenceGradeNew && selectedGrades.includes(p.evidenceGradeNew)
  );

  // Count protocols per grade
  const protocolCounts = allProtocols.reduce((acc, p) => {
    if (p.evidenceGradeNew) {
      acc[p.evidenceGradeNew] = (acc[p.evidenceGradeNew] || 0) + 1;
    }
    return acc;
  }, {} as Record<EvidenceGrade, number>);

  const handleToggleGrade = (grade: EvidenceGrade) => {
    setSelectedGrades(prev =>
      prev.includes(grade)
        ? prev.filter(g => g !== grade)
        : [...prev, grade]
    );
  };

  return (
    <>
      {/* Universal Disclaimer - First Time Only */}
      <UniversalDisclaimerModal onAccept={() => setDisclaimerAccepted(true)} />

      {/* Main App */}
      {disclaimerAccepted && (
        <div className="flex h-screen bg-neuro-950">
          {/* Sidebar */}
          <div className="w-80 border-r border-neuro-700 p-4 space-y-4 overflow-y-auto">
            {/* Evidence Filter */}
            <EvidenceFilter
              selectedGrades={selectedGrades}
              onToggle={handleToggleGrade}
              protocolCounts={protocolCounts}
            />

            {/* Protocol List */}
            <ProtocolList
              protocols={filteredProtocols}
              selectedId={selectedProtocol?.id || null}
              onSelect={setSelectedProtocol}
              mode="scientific"
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {selectedProtocol ? (
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Protocol Header */}
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {selectedProtocol.title}
                  </h1>
                  <p className="text-gray-400">{selectedProtocol.description}</p>
                </div>

                {/* Disclaimer Section */}
                <ProtocolDisclaimer protocol={selectedProtocol} />

                {/* Protocol Details */}
                <div className="p-6 bg-neuro-900/40 border border-neuro-700 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Protocol Details</h3>

                  {selectedProtocol.usageGoal && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-400 mb-2">Usage Goal</h4>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {selectedProtocol.usageGoal}
                      </p>
                    </div>
                  )}

                  {selectedProtocol.researchContext && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-400 mb-2">Research Context</h4>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {selectedProtocol.researchContext}
                      </p>
                    </div>
                  )}

                  {selectedProtocol.citation && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-400 mb-2">Citation</h4>
                      <p className="text-xs text-gray-400 font-mono">
                        {selectedProtocol.citation}
                      </p>
                    </div>
                  )}
                </div>

                {/* Start Protocol Button */}
                <button className="w-full py-4 bg-neuro-500 hover:bg-neuro-600 text-white font-bold rounded-lg transition-colors">
                  Start Protocol ({Math.floor(selectedProtocol.duration / 60)} min)
                </button>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                Select a protocol to view details
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
```

---

## Styling Notes

All components use Tailwind classes matching your existing design system:

**Colors:**
- `neuro-500` - Primary brand color
- `neuro-700` - Border color
- `neuro-800/900/950` - Background shades

**Evidence Colors:**
- Green (`green-500`) - Established
- Yellow (`yellow-500`) - Experimental
- Blue (`blue-500`) - Exploratory

**Warning Colors:**
- Red (`red-500`) - Severe contraindications
- Orange (`orange-500`) - Moderate warnings
- Yellow (`yellow-500`) - General caution

---

## Mobile Responsiveness

All components are responsive:
- Filter collapses on mobile
- Modal scrolls on small screens
- Protocol list stacks vertically
- Badges scale appropriately

---

## Accessibility

All components include:
- ARIA labels
- Keyboard navigation
- Focus indicators
- Screen reader support
- Color contrast compliance

---

## Testing Checklist

- [ ] Universal disclaimer shows on first visit
- [ ] Universal disclaimer doesn't show again after acceptance
- [ ] Evidence badges display correctly on protocol cards
- [ ] Evidence filter toggles work
- [ ] Protocol disclaimer shows all sections
- [ ] Severe warnings display in red
- [ ] "Help us validate" appears for needs-validation protocols
- [ ] Mobile layout works
- [ ] Keyboard navigation functional
- [ ] Screen reader announces badges

---

## What This Achieves

### Legal Safety ✅
- Universal disclaimer sets expectations
- Protocol-specific disclaimers cover liability
- Evidence grades prevent overpromising
- Contraindications clearly displayed

### Competitive Advantage ✅
- **ONLY platform with transparent evidence grading**
- Brain.fm: Vague "clinical studies"
- iDoser: No evidence disclosure
- **SynSync:** Honest about what's validated vs. theoretical

### User Trust ✅
- Transparent about uncertainty
- Users become co-researchers
- Track results to validate
- Honest = credible

### Ready for Launch ✅
- All disclaimers in place
- Evidence system visible
- Safety warnings clear
- Users informed before use

---

## Next Steps

1. **Test Integration** (1 day)
   - Add components to your app
   - Test all flows
   - Verify mobile layout

2. **Refine Styling** (0.5 days)
   - Match your exact color scheme
   - Adjust spacing if needed
   - Fine-tune animations

3. **User Testing** (2 days)
   - Show to beta users
   - Get feedback on clarity
   - Iterate on wording

4. **Launch** 🚀
   - Deploy to staging
   - Full QA pass
   - Production release

**You're ready to launch the most honest brainwave platform ever built.**
