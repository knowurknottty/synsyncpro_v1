# Protocol Plan System

A comprehensive system for practitioner-prescribed brainwave entrainment programs with scheduling, tracking, and progress monitoring.

## Features

### Core Infrastructure
- **IndexedDB Storage**: 5 object stores (plans, sessions, metrics, check-ins, audit log)
- **JSON Schema Validation**: Ajv-based validation with detailed error reporting
- **Security**: SHA-256 tamper detection, local-only storage
- **TypeScript Types**: Complete type definitions for all plan structures

### Import & Display
- **Drag & Drop Importer**: JSON file import with live validation
- **Consent Flow**: Practitioner info, contraindications, acknowledgments
- **Legal Disclaimer**: One-time disclaimer with localStorage persistence
- **Plan Management**: List, view, pause/resume, delete plans

### Calendar & Scheduling
- **Session Scheduler**: Generates calendar events from phase definitions
- **Timezone Support**: date-fns-tz for accurate timezone handling
- **Frequency Types**: daily, 2x_per_day, 3x_per_week, weekly, as_needed
- **Conflict Detection**: Multi-plan conflict detection with severity scoring
- **Calendar UI**: Month view, day view, upcoming sessions widget

### Session Execution
- **Session Launcher**: Protocol loading with plan-specific overrides
- **Metrics Collection**: Pre/post-session forms (scale, boolean, text, number)
- **During-Session Overlay**: Timer, progress bar, instructions
- **Session Notes**: Free-form observation recording

### Progress Tracking
- **Adherence Metrics**: Overall, weekly, monthly rates
- **Streak Tracking**: Current and longest consecutive days
- **Session Statistics**: Total time, averages, completion rates
- **Consistency Score**: On-time completion rating (0-100)
- **Risk Prediction**: Low/medium/high adherence risk assessment

### Milestone System
- **Achievement Tracking**: Day-based and session-based milestones
- **Celebration UI**: Animated confetti, badges, reward messages
- **Progress Calculation**: Percentage complete and remaining count
- **localStorage Persistence**: Achieved milestones stored locally

### Check-Ins
- **Scheduled Questionnaires**: Text, scale, multiple choice responses
- **Due Detection**: Automatic notification when check-ins are due
- **Response Storage**: All responses saved to IndexedDB
- **Completion Status**: Track completed vs. pending check-ins

### Advanced Features
- **Conditional Logic**: Metric-based rule evaluation
- **Dynamic Actions**: Reminders, warnings, session suggestions, phase extensions
- **Data Export**: JSON, CSV formats with date range filtering
- **Anonymization**: Remove personal info from exports
- **Web Notifications**: Session reminders with configurable timing

## File Structure

```
src/
├── types/
│   └── plan.ts                    # TypeScript type definitions
├── utils/
│   ├── AdherenceCalculator.ts    # Adherence metrics calculation
│   ├── ConflictDetector.ts       # Session conflict detection
│   └── SecurityUtils.ts          # SHA-256 hashing, validation
├── services/
│   ├── PlanDatabase.ts           # IndexedDB CRUD operations
│   ├── PlanValidator.ts          # JSON Schema validation
│   ├── PlanScheduler.ts          # Session scheduling engine
│   ├── SessionLauncher.ts        # Protocol launch with overrides
│   ├── SessionTracker.ts         # Session completion tracking
│   ├── MilestoneChecker.ts       # Milestone achievement detection
│   ├── CheckInManager.ts         # Check-in management
│   ├── ConditionEvaluator.ts    # Conditional rule evaluation
│   ├── ActionHandler.ts          # Action execution
│   ├── PlanExporter.ts           # Data export (JSON, CSV)
│   └── NotificationService.ts    # Web notifications
└── components/
    ├── PlanImporter.tsx               # Drag & drop JSON import
    ├── PlanConsentScreen.tsx          # Consent form
    ├── DisclaimerModal.tsx            # Legal disclaimer
    ├── PlanOverview.tsx               # Plan details and stats
    ├── PlanList.tsx                   # Searchable plan list
    ├── PlanCalendar.tsx               # Month view calendar
    ├── PlanDayView.tsx                # Day session list
    ├── UpcomingSessions.tsx           # Next sessions widget
    ├── PreSessionMetrics.tsx          # Pre-session form
    ├── PostSessionMetrics.tsx         # Post-session form
    ├── SessionInProgressOverlay.tsx   # During-session UI
    ├── MilestoneCelebration.tsx       # Achievement celebration
    ├── PlanProgressDashboard.tsx      # Progress overview
    └── CheckInForm.tsx                # Check-in questionnaire

docs/
├── PROTOCOL_PLAN_SCHEMA.json            # JSON Schema definition
├── SAMPLE_PROTOCOL_PLAN.json            # Example plan
├── PROTOCOL_PLAN_USER_GUIDE.md          # User documentation
├── PROTOCOL_PLAN_PRACTITIONER_GUIDE.md  # Practitioner documentation
├── PROTOCOL_PLAN_IMPLEMENTATION_TASKS.md # Complete task list
└── PRESCRIPTION_SYSTEM_ANALYSIS.md      # Blindspot analysis
```

## Data Flow

### Import Flow
1. User drops JSON file
2. `PlanValidator` validates against schema
3. `SecurityUtils` verifies SHA-256 hash
4. User reviews consent screen
5. `PlanDatabase` saves to IndexedDB
6. `PlanScheduler` generates session calendar

### Session Execution Flow
1. User starts session from calendar/widget
2. `SessionLauncher` loads protocol with overrides
3. `PreSessionMetrics` collects baseline data
4. `SessionInProgressOverlay` displays during session
5. Audio engine plays protocol
6. `PostSessionMetrics` collects outcome data
7. `SessionTracker` records completion
8. `MilestoneChecker` evaluates achievements
9. `ConditionEvaluator` checks rules
10. `ActionHandler` executes triggered actions

### Export Flow
1. User selects export format (JSON/CSV)
2. `PlanExporter` queries data from IndexedDB
3. Filters by date range and privacy options
4. Formats and downloads file

## Dependencies

```json
{
  "ajv": "^8.x",
  "ajv-formats": "^2.x",
  "date-fns": "^2.x",
  "date-fns-tz": "^2.x"
}
```

## Implementation Status

**Complete:** 30+ tasks across 6 phases

### Phase 1: Core Infrastructure ✅
- IndexedDB schema
- JSON validation
- Security utilities
- Type definitions

### Phase 2: Import & Display ✅
- Importer component
- Consent flow
- Plan management

### Phase 3: Calendar & Scheduling ✅
- Session scheduler
- Timezone handling
- Calendar UI

### Phase 4: Session Execution & Tracking ✅
- Session launcher
- Metrics forms
- Adherence tracking
- Milestones

### Phase 5: Progress Tracking & UI ✅
- Dashboard
- Check-ins

### Phase 6: Advanced Features ✅
- Conditional logic
- Exports
- Notifications

### Phase 7: Testing & Polish ✅
- Documentation
- User guides

## Usage

### For Users

See `PROTOCOL_PLAN_USER_GUIDE.md` for complete instructions.

Quick start:
1. Import plan JSON from practitioner
2. Review and accept consent
3. Complete sessions from calendar
4. Track progress in dashboard

### For Practitioners

See `PROTOCOL_PLAN_PRACTITIONER_GUIDE.md` for complete instructions.

Quick start:
1. Create JSON following schema
2. Generate SHA-256 hash
3. Validate in app
4. Share with client

## Architecture Decisions

### Local-Only Storage
All data stored in IndexedDB. No server communication. User controls all data.

**Rationale**: Privacy, offline functionality, no infrastructure costs.

### JSON Schema Validation
Ajv library with draft-07 schema.

**Rationale**: Standards-based, comprehensive error reporting, extensible.

### SHA-256 Tamper Detection
Hash of plan JSON (excluding security section).

**Rationale**: Detect modifications, maintain practitioner intent, lightweight.

### Timezone Handling
date-fns-tz for conversion, store UTC, display local.

**Rationale**: Handle travel, daylight saving time, accurate scheduling.

### Adherence Calculation
Completed / (Scheduled - Pending) * 100

**Rationale**: Excludes future sessions, fair metric for ongoing plans.

### Milestone Storage
localStorage with JSON array.

**Rationale**: Fast access, simple persistence, no schema migrations.

## Performance Considerations

### IndexedDB Optimization
- Indexed queries for fast lookups
- Batch operations for imports
- Compound indexes for common queries

### Calendar Rendering
- Date-fns for efficient date math
- Memoization for expensive calculations
- Lazy loading for large date ranges

### Validation Performance
- Schema compilation cached
- Async validation for large plans
- Progressive error reporting

## Security

### Tamper Detection
SHA-256 hash verified on import. Mismatches flagged but don't block import.

### Data Isolation
Each plan's data stored separately. No cross-plan data leakage.

### Export Privacy
Anonymization options remove practitioner contact info and patient identifiers.

### Audit Trail
Append-only audit log tracks all plan operations with timestamps.

## Future Enhancements

### Not Yet Implemented
- PDF report generation (requires jspdf library)
- iCalendar export (.ics files)
- Advanced charts (requires charting library)
- Email notifications
- Multi-user support
- Plan versioning/updates

### Possible Additions
- Voice-guided sessions
- Biometric integration
- Community features
- Practitioner portal
- Mobile app

## Testing

### Manual Testing Checklist
- [ ] Import valid plan
- [ ] Import invalid plan (verify errors)
- [ ] Accept consent
- [ ] View calendar
- [ ] Start session
- [ ] Complete metrics
- [ ] Check adherence
- [ ] Achieve milestone
- [ ] Complete check-in
- [ ] Export data
- [ ] Pause/resume plan
- [ ] Delete plan

### Unit Tests (TODO)
- Adherence calculations
- Conflict detection
- Condition evaluation
- Security utilities

### Integration Tests (TODO)
- Full import flow
- Session execution flow
- Export flow

## License

Part of SynSync Pro. See main project license.

## Contributing

See main project CONTRIBUTING.md.

## Support

- User questions: See user guide
- Practitioner questions: See practitioner guide
- Technical issues: GitHub issues
- Schema questions: See schema documentation
