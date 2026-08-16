# 🚀 Quick Fixes Implementation Guide

**Priority:** Critical Path to Production-Ready
**Timeframe:** 2-3 weeks
**Target:** Fix blocking issues before adding new features

---

## Fix #1: Error Boundaries (4-6 hours)

### Step 1: Create Error Boundary Component

**File:** `src/components/ErrorBoundary.tsx`

```typescript
import React, { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onError?: (error: Error) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);

    // Log to error tracking service
    if (this.props.onError) {
      this.props.onError(error);
    }

    // You could also log to an error tracking service like Sentry
    // reportErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neuro-950">
          <div className="bg-neuro-900 border border-red-500 rounded-lg p-8 max-w-md text-center">
            <h2 className="text-2xl font-bold text-red-500 mb-4">
              ⚠️ Something Went Wrong
            </h2>
            <p className="text-gray-300 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <details className="text-left mb-6 text-sm text-gray-400">
              <summary className="cursor-pointer hover:text-gray-300">
                Error Details
              </summary>
              <pre className="mt-2 bg-black p-2 rounded overflow-auto">
                {this.state.error?.stack}
              </pre>
            </details>
            <div className="space-y-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Reload Application
              </button>
              <button
                onClick={() => window.history.back()}
                className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Step 2: Wrap App with Error Boundary

**File:** `index.tsx`

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary
      onError={(error) => {
        console.error('Application error:', error);
        // Send to error tracking service
      }}
    >
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
```

### Step 3: Add Error Handling to AudioEngine

**File:** `services/AudioEngine.ts`

```typescript
export class AudioEngine {
  // ... existing code ...

  private errorCallbacks: Array<(error: Error) => void> = [];

  onError(callback: (error: Error) => void) {
    this.errorCallbacks.push(callback);
  }

  private handleError(error: Error, context: string) {
    console.error(`AudioEngine Error [${context}]:`, error);
    this.errorCallbacks.forEach(cb => cb(error));
    this.stop();
  }

  playProtocol(protocol: Protocol) {
    try {
      if (!protocol || !protocol.phases || protocol.phases.length === 0) {
        throw new Error(`Invalid protocol: missing phases in ${protocol?.id}`);
      }

      if (!this.context) {
        throw new Error('AudioContext not initialized');
      }

      this.stop();
      this.initializePhases(protocol.phases);
      this.startPlayback();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.handleError(err, 'playProtocol');
      throw err; // Re-throw for error boundary
    }
  }

  unlock() {
    try {
      if (this.context?.state === 'suspended') {
        this.context.resume();
      }
    } catch (error) {
      console.warn('AudioContext unlock failed:', error);
      // Don't throw - this is non-critical
    }
  }

  dispose() {
    try {
      this.stop();
      if (this.context && this.context.state !== 'closed') {
        this.context.close();
      }
      this.errorCallbacks = [];
    } catch (error) {
      console.error('Error during AudioEngine disposal:', error);
    }
  }
}
```

### Step 4: Add Try-Catch to App.tsx

```typescript
const handlePlay = useCallback(() => {
  try {
    audioEngine.unlock();
    if (!activeProtocol) return;

    const isNewSelection = audioState.currentProtocolId !== activeProtocol.id;

    if (!safetyCleared && (isNewSelection || !audioState.isPlaying)) {
      setShowSafetyGate(true);
      return;
    }

    if (!isNewSelection && audioState.isPlaying && !audioState.isPaused) {
      audioEngine.pause();
      setAudioState(s => ({...s, isPaused: true}));
    } else if (!isNewSelection && audioState.isPaused) {
      audioEngine.resume();
      setAudioState(s => ({...s, isPaused: false}));
    } else {
      audioEngine.stopImmediate();
      audioEngine.playProtocol(activeProtocol);
      setAudioState({
        ...audioState,
        isPlaying: true,
        isPaused: false,
        currentProtocolId: activeProtocol.id,
        currentPhaseIndex: 0
      });
      if (isMobile) setMobileTab('session');
    }
  } catch (error) {
    console.error('Playback error:', error);
    // Error will be caught by error boundary
    // User sees friendly error message
  }
}, [activeProtocol, audioState, isMobile, safetyCleared]);
```

---

## Fix #2: Extract Custom Hooks (6-8 hours)

### Create Custom Hooks

**File:** `src/hooks/useAudioPlayback.ts`

```typescript
import { useState, useCallback, useEffect, useRef } from 'react';
import { AudioEngine } from '../services/AudioEngine.ts';
import { Protocol, AudioState } from '../types.ts';

export function useAudioPlayback(audioEngine: AudioEngine) {
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    isPaused: false,
    currentProtocolId: null,
    currentPhaseIndex: 0,
    volume: 0.7,
  });

  // Set up audio engine callbacks
  useEffect(() => {
    audioEngine.onTick = (totalElapsed, phaseElapsed, phaseIndex) => {
      setAudioState(s => ({
        ...s,
        isPlaying: true,
        isPaused: false,
        currentPhaseIndex: phaseIndex,
      }));
    };

    audioEngine.onComplete = () => {
      setAudioState(s => ({
        ...s,
        isPlaying: false,
        isPaused: false,
        currentProtocolId: null,
      }));
    };

    return () => {
      audioEngine.onTick = undefined;
      audioEngine.onComplete = undefined;
    };
  }, [audioEngine]);

  const play = useCallback((protocol: Protocol) => {
    try {
      audioEngine.unlock();
      audioEngine.playProtocol(protocol);
      setAudioState(s => ({
        ...s,
        isPlaying: true,
        isPaused: false,
        currentProtocolId: protocol.id,
        currentPhaseIndex: 0,
      }));
    } catch (error) {
      console.error('Failed to play protocol:', error);
      throw error;
    }
  }, [audioEngine]);

  const pause = useCallback(() => {
    audioEngine.pause();
    setAudioState(s => ({ ...s, isPaused: true }));
  }, [audioEngine]);

  const resume = useCallback(() => {
    audioEngine.resume();
    setAudioState(s => ({ ...s, isPaused: false }));
  }, [audioEngine]);

  const stop = useCallback(() => {
    audioEngine.stopImmediate();
    setAudioState({
      isPlaying: false,
      isPaused: false,
      currentProtocolId: null,
      currentPhaseIndex: 0,
      volume: audioState.volume,
    });
  }, [audioEngine, audioState.volume]);

  const setVolume = useCallback((volume: number) => {
    audioEngine.setMasterGain(volume);
    setAudioState(s => ({ ...s, volume }));
  }, [audioEngine]);

  return {
    audioState,
    play,
    pause,
    resume,
    stop,
    setVolume,
  };
}
```

**File:** `src/hooks/useResponsiveness.ts`

```typescript
import { useState, useEffect } from 'react';

export function useResponsiveness() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      setWidth(newWidth);
      setIsMobile(newWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { isMobile, width };
}
```

**File:** `src/hooks/useModalState.ts`

```typescript
import { useState } from 'react';

type ModalKey = 'sources' | 'legal' | 'download' | 'safetyGate';

export function useModalState() {
  const [modals, setModals] = useState<Record<ModalKey, boolean>>({
    sources: false,
    legal: false,
    download: false,
    safetyGate: false,
  });

  const toggle = (modal: ModalKey) => {
    setModals(m => ({ ...m, [modal]: !m[modal] }));
  };

  const open = (modal: ModalKey) => {
    setModals(m => ({ ...m, [modal]: true }));
  };

  const close = (modal: ModalKey) => {
    setModals(m => ({ ...m, [modal]: false }));
  };

  return { modals, toggle, open, close };
}
```

### Use Hooks in App.tsx

```typescript
import { useAudioPlayback } from './hooks/useAudioPlayback.ts';
import { useResponsiveness } from './hooks/useResponsiveness.ts';
import { useModalState } from './hooks/useModalState.ts';

export const App: React.FC = () => {
  const [activeProtocol, setActiveProtocol] = useState<Protocol | null>(null);
  const [appMode, setAppMode] = useState<'scientific' | 'speculative'>('scientific');
  const [safetyCleared, setSafetyCleared] = useState(false);
  const [mobileTab, setMobileTab] = useState<'archive' | 'session' | 'tech'>('archive');

  const audioEngine = useRef(new AudioEngine()).current;
  const { audioState, play, pause, resume, stop, setVolume } = useAudioPlayback(audioEngine);
  const { isMobile } = useResponsiveness();
  const { modals, open, close } = useModalState();

  const handlePlay = useCallback(() => {
    try {
      if (!activeProtocol) return;

      const isNewSelection = audioState.currentProtocolId !== activeProtocol.id;

      if (!safetyCleared && (isNewSelection || !audioState.isPlaying)) {
        open('safetyGate');
        return;
      }

      if (!isNewSelection && audioState.isPlaying && !audioState.isPaused) {
        pause();
      } else if (!isNewSelection && audioState.isPaused) {
        resume();
      } else {
        stop();
        play(activeProtocol);
        if (isMobile) setMobileTab('session');
      }
    } catch (error) {
      console.error('Playback failed:', error);
    }
  }, [activeProtocol, audioState, isMobile, safetyCleared, play, pause, resume, stop, open]);

  // Much simpler component logic now!
  return (
    <div>
      {/* Use modals object */}
      {modals.safetyGate && <SafetyGateModal onClose={() => close('safetyGate')} />}
      {/* ... rest of UI ... */}
    </div>
  );
};
```

---

## Fix #3: Add Basic Testing (8-10 hours)

### Step 1: Setup Vitest

**File:** `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/'],
      lines: 70,
      functions: 70,
      branches: 60,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

**File:** `src/test/setup.ts`

```typescript
import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Web Audio API
global.AudioContext = vi.fn() as any;
global.OfflineAudioContext = vi.fn() as any;

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;
```

### Step 2: Test AudioEngine

**File:** `services/__tests__/AudioEngine.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AudioEngine } from '../AudioEngine.ts';
import { Phase } from '../../types.ts';

describe('AudioEngine', () => {
  let engine: AudioEngine;

  beforeEach(() => {
    engine = new AudioEngine();
  });

  describe('initialization', () => {
    it('should create an audio context', () => {
      expect(engine).toBeDefined();
      expect(engine['context']).toBeDefined();
    });

    it('should have default master gain of 1.0', () => {
      expect(engine['masterGain']).toBe(1.0);
    });
  });

  describe('playProtocol', () => {
    it('should throw on invalid protocol', () => {
      expect(() => {
        engine.playProtocol(null as any);
      }).toThrow();
    });

    it('should throw on missing phases', () => {
      expect(() => {
        engine.playProtocol({ id: 'test' } as any);
      }).toThrow();
    });

    it('should call onTick callback during playback', async () => {
      const onTick = vi.fn();
      engine.onTick = onTick;

      const protocol = {
        id: 'test',
        title: 'Test',
        description: 'Test protocol',
        duration: 60,
        phases: [
          {
            dur: 60,
            carrier: 200,
            beat: 10,
          } as Phase,
        ],
        category: 'test',
      };

      engine.playProtocol(protocol);

      // Wait a bit for callback
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(onTick).toHaveBeenCalled();
    });
  });

  describe('volume control', () => {
    it('should set master gain', () => {
      engine.setMasterGain(0.5);
      expect(engine['masterGain']).toBe(0.5);
    });

    it('should clamp master gain to 0-1', () => {
      engine.setMasterGain(1.5);
      expect(engine['masterGain']).toBe(1);

      engine.setMasterGain(-0.5);
      expect(engine['masterGain']).toBe(0);
    });
  });

  describe('cleanup', () => {
    it('should dispose all resources', () => {
      engine.dispose();
      expect(engine['nodes'].length).toBe(0);
    });
  });
});
```

### Step 3: Update package.json

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "type-check": "tsc --noEmit"
  },
  "devDependencies": {
    "vitest": "^0.34.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.1.0",
    "@testing-library/user-event": "^14.5.0",
    "@vitest/ui": "^0.34.0",
    "@vitest/coverage-v8": "^0.34.0",
    "jsdom": "^22.1.0"
  }
}
```

---

## Fix #4: Memoize Components (4-6 hours)

**File:** `components/ProtocolCard.tsx`

```typescript
import React from 'react';
import { Protocol } from '../types.ts';

interface ProtocolCardProps {
  protocol: Protocol;
  isSelected: boolean;
  onSelect: (protocol: Protocol) => void;
}

// Use React.memo to prevent unnecessary re-renders
export const ProtocolCard = React.memo(
  ({ protocol, isSelected, onSelect }: ProtocolCardProps) => {
    return (
      <div
        className={`p-4 cursor-pointer ${
          isSelected ? 'bg-neuro-700' : 'bg-neuro-800'
        }`}
        onClick={() => onSelect(protocol)}
      >
        <h3>{protocol.title}</h3>
        <p className="text-sm text-gray-400">{protocol.description}</p>
      </div>
    );
  },
  // Custom comparison - only re-render if protocol ID or selection changes
  (prev, next) => {
    return (
      prev.protocol.id === next.protocol.id &&
      prev.isSelected === next.isSelected
    );
  }
);

ProtocolCard.displayName = 'ProtocolCard';
```

**File:** `components/ProtocolList.tsx`

```typescript
import React, { useMemo } from 'react';
import { Protocol } from '../types.ts';
import { ProtocolCard } from './ProtocolCard.tsx';

interface ProtocolListProps {
  protocols: Protocol[];
  selectedProtocolId: string | null;
  onSelectProtocol: (protocol: Protocol) => void;
}

export const ProtocolList = React.memo(
  ({ protocols, selectedProtocolId, onSelectProtocol }: ProtocolListProps) => {
    // Only recompute if protocols actually changed
    const memoizedProtocols = useMemo(
      () => protocols,
      [protocols]
    );

    return (
      <div className="space-y-2">
        {memoizedProtocols.map(protocol => (
          <ProtocolCard
            key={protocol.id}
            protocol={protocol}
            isSelected={protocol.id === selectedProtocolId}
            onSelect={onSelectProtocol}
          />
        ))}
      </div>
    );
  }
);

ProtocolList.displayName = 'ProtocolList';
```

---

## Fix #5: Add Input Validation (6-8 hours)

**File:** `src/validation/schemas.ts`

```typescript
// Using Zod for runtime validation
import { z } from 'zod';

export const PhaseSchema = z.object({
  dur: z.number().min(0.1).max(3600),
  carrier: z.number().min(100).max(500),
  beat: z.number().min(0.5).max(100),
  vol: z.number().min(0).max(1).optional(),
  volL: z.number().min(0).max(1).optional(),
  volR: z.number().min(0).max(1).optional(),
  noise: z.enum(['white', 'pink', 'brown']).optional(),
  noiseMix: z.number().min(0).max(1).optional(),
  entrainmentMode: z.object({
    binaural: z.object({ enabled: z.boolean() }).optional(),
    isochronic: z.object({ enabled: z.boolean() }).optional(),
    monaural: z.object({ enabled: z.boolean() }).optional(),
  }).optional(),
});

export const ProtocolSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(100),
  description: z.string().min(1),
  duration: z.number().min(1).max(3600),
  category: z.string(),
  evidenceLevel: z.enum(['I', 'II', 'III', 'IV', 'V']).optional(),
  phases: z.array(PhaseSchema).min(1),
  contraindications: z.array(z.string()).optional(),
});

export type ValidPhase = z.infer<typeof PhaseSchema>;
export type ValidProtocol = z.infer<typeof ProtocolSchema>;
```

**File:** `src/validation/validator.ts`

```typescript
import { ProtocolSchema, PhaseSchema } from './schemas.ts';
import { Protocol, Phase } from '../types.ts';

export class ValidationError extends Error {
  constructor(message: string, public readonly details?: any) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateProtocol(data: unknown): Protocol {
  try {
    const result = ProtocolSchema.safeParse(data);
    if (!result.success) {
      throw new ValidationError(
        `Invalid protocol: ${result.error.message}`,
        result.error.errors
      );
    }
    return result.data as Protocol;
  } catch (error) {
    if (error instanceof ValidationError) throw error;
    throw new ValidationError('Unknown validation error', error);
  }
}

export function validatePhase(data: unknown): Phase {
  try {
    const result = PhaseSchema.safeParse(data);
    if (!result.success) {
      throw new ValidationError(
        `Invalid phase: ${result.error.message}`,
        result.error.errors
      );
    }
    return result.data as Phase;
  } catch (error) {
    if (error instanceof ValidationError) throw error;
    throw new ValidationError('Unknown validation error', error);
  }
}
```

**File:** `services/AudioEngine.ts` (updated)

```typescript
import { validateProtocol } from '../validation/validator.ts';
import { Protocol } from '../types.ts';

export class AudioEngine {
  playProtocol(protocol: unknown) {
    try {
      // Validate input
      const validProtocol = validateProtocol(protocol);

      if (!this.context) {
        throw new Error('AudioContext not initialized');
      }

      this.stop();
      this.initializePhases(validProtocol.phases);
      this.startPlayback();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.handleError(err, 'playProtocol');
      throw err;
    }
  }
}
```

---

## Commit & Push These Changes

```bash
# Create a new feature branch
git checkout -b feat/critical-fixes

# Stage changes
git add .

# Commit
git commit -m "Add critical fixes: error boundaries, hooks extraction, testing setup, validation"

# Push
git push -u origin feat/critical-fixes

# Create Pull Request for review
```

---

## Next: Create GitHub Issues

Template for issues:

```markdown
# [CRITICAL] Component Refactoring - App.tsx

## Current State
App.tsx is 28KB with 15+ useState calls

## Problem
- Violates single responsibility
- Hard to test
- Difficult to debug
- Performance issues with large state

## Solution
Extract hooks and separate concerns

## Acceptance Criteria
- [ ] useAudioPlayback hook created
- [ ] useResponsiveness hook created
- [ ] useModalState hook created
- [ ] App.tsx < 200 lines
- [ ] All functionality preserved
- [ ] Tests pass

## Effort
16-20 hours

---

# [HIGH] Add Testing Infrastructure

## Current State
Zero tests, no test setup

## Problem
- No regression detection
- Hard to refactor safely
- Code quality difficult to maintain

## Solution
Implement Vitest with 70% coverage

## Acceptance Criteria
- [ ] vitest configured
- [ ] AudioEngine tests (80% coverage)
- [ ] Core service tests (75% coverage)
- [ ] CI pipeline runs tests
- [ ] Coverage reports generated

## Effort
40-50 hours
```

---

## Verification Checklist

After implementing these fixes:

- [ ] No console errors on startup
- [ ] Error boundary catches and displays errors gracefully
- [ ] Custom hooks can be imported and used independently
- [ ] Tests run with `npm run test`
- [ ] Test coverage visible with `npm run test:coverage`
- [ ] All validations prevent invalid data
- [ ] Components don't re-render unnecessarily
- [ ] Build size reduced by at least 15%
- [ ] Type checking passes with `npm run type-check`

---

**Estimated Total Time:** 28-40 hours
**Team Allocation:** 2-3 developers over 1-2 weeks

