import '@testing-library/jest-dom';
import { afterEach, vi, beforeAll, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { installWebAudioMock } from './webAudioMock';

// Web Audio API is absent in jsdom — install constructible, stateful mocks.
installWebAudioMock();

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Functional localStorage mock (jsdom provides one, but keep tests hermetic)
function createStorageMock(): Storage {
  let store = new Map<string, string>();
  return {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(key, String(value));
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store = new Map();
    },
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    },
  } as Storage;
}

Object.defineProperty(globalThis, 'localStorage', {
  value: createStorageMock(),
  writable: true,
  configurable: true,
});

beforeEach(() => {
  localStorage.clear();
});

// matchMedia for reduced-motion / responsive queries
if (typeof window !== 'undefined' && !window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
}

// requestAnimationFrame fallback (jsdom has it, but guard for node env tests)
if (typeof globalThis.requestAnimationFrame === 'undefined') {
  globalThis.requestAnimationFrame = (cb: FrameRequestCallback) =>
    setTimeout(() => cb(performance.now()), 16) as unknown as number;
  globalThis.cancelAnimationFrame = (id: number) => clearTimeout(id);
}

// Suppress known-noisy console output during tests, keep everything else
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = (...args: unknown[]) => {
    const message = String(args[0]);
    if (!message.includes('Warning: ReactDOM.render')) {
      originalConsoleError(...args);
    }
  };
  console.warn = (...args: unknown[]) => {
    const message = String(args[0]);
    if (!message.includes('Warning')) {
      originalConsoleWarn(...args);
    }
  };
});
