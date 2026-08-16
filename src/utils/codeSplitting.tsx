import { lazy, Suspense } from 'react';
import type { ComponentType, ReactNode } from 'react';

/**
 * Code Splitting and Dynamic Import Utilities
 *
 * Provides utilities for lazy loading components to reduce bundle size
 * and improve initial load performance
 */

/**
 * Loading fallback component
 */
export const DefaultLoadingFallback = () => (
  <div className="flex items-center justify-center w-full h-full">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neuro-500" />
  </div>
);

/**
 * Create a lazy-loaded component with error boundary and fallback
 */
export const createLazyComponent = <P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  fallback?: ReactNode
) => {
  const LazyComponent = lazy(importFunc);

  return (props: P) => (
    <Suspense fallback={fallback || <DefaultLoadingFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

/**
 * Bundle split by platform
 */
export const codeSplittingConfig = {
  // Mobile components
  mobile: {
    MobileApp: () => import('../../components/MobileApp.tsx').then((m) => ({ default: m.MobileApp })),
  },

  // Desktop components
  desktop: {
    DesktopApp: () =>
      import('../../components/DesktopApp.tsx').then((m) => ({ default: m.DesktopApp })),
  },

  // Modals (lazy loaded)
  modals: {
    SourcesModal: () =>
      import('../../components/SourcesModal.tsx').then((m) => ({ default: m.SourcesModal })),
    LegalModal: () =>
      import('../../components/LegalModal.tsx').then((m) => ({ default: m.LegalModal })),
    DownloadPortal: () =>
      import('../../components/DownloadPortal.tsx').then((m) => ({ default: m.DownloadPortal })),
    SafetyGateModal: () =>
      import('../../components/SafetyGateModal.tsx').then((m) => ({
        default: m.SafetyGateModal,
      })),
  },

  // Heavy components
  heavy: {
    Visualizer: () =>
      import('../../components/Visualizer.tsx').then((m) => ({ default: m.Visualizer })),
    CymaticsVisualizer: () =>
      import('../../components/CymaticsVisualizer.tsx').then((m) => ({
        default: m.CymaticsVisualizer,
      })),
    SessionTracker: () =>
      import('../../components/SessionTracker.tsx').then((m) => ({
        default: m.SessionTracker,
      })),
    ProgressDashboard: () =>
      import('../../components/ProgressDashboard.tsx').then((m) => ({
        default: m.ProgressDashboard,
      })),
  },
};

/**
 * Dynamic component loader with prefetching capability
 */
export class ComponentLoader {
  private static loadedComponents = new Map<string, any>();
  private static prefetchQueue: string[] = [];

  static async loadComponent(path: string): Promise<any> {
    if (this.loadedComponents.has(path)) {
      return this.loadedComponents.get(path);
    }

    try {
      const module = await import(/* @vite-ignore */ path);
      this.loadedComponents.set(path, module);
      return module;
    } catch (error) {
      console.error(`Failed to load component: ${path}`, error);
      throw error;
    }
  }

  static prefetch(path: string): void {
    if (!this.loadedComponents.has(path) && !this.prefetchQueue.includes(path)) {
      this.prefetchQueue.push(path);

      // Prefetch after idle time
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => {
          this.processPrefetchQueue();
        });
      } else {
        setTimeout(() => {
          this.processPrefetchQueue();
        }, 2000);
      }
    }
  }

  private static processPrefetchQueue(): void {
    while (this.prefetchQueue.length > 0) {
      const path = this.prefetchQueue.shift();
      if (path) {
        this.loadComponent(path).catch(() => {
          // Silently fail on prefetch
        });
      }
    }
  }

  static clear(): void {
    this.loadedComponents.clear();
    this.prefetchQueue = [];
  }
}

/**
 * Route-based code splitting hints
 * Use these to prefetch components before navigation
 */
export const routePrefetches = {
  home: () => {
    ComponentLoader.prefetch('../../components/LandingPage.tsx');
  },

  archive: () => {
    ComponentLoader.prefetch('../../components/ProtocolList.tsx');
  },

  session: () => {
    ComponentLoader.prefetch('../../components/Visualizer.tsx');
    ComponentLoader.prefetch('../../components/SessionProgress.tsx');
  },

  technical: () => {
    ComponentLoader.prefetch('../../components/ManualTuningPanel.tsx');
  },

  dashboard: () => {
    ComponentLoader.prefetch('../../components/ProgressDashboard.tsx');
    ComponentLoader.prefetch('../../components/SessionTracker.tsx');
  },
};

/**
 * Bundle size analysis helper
 * Returns estimated bundle impact of components
 */
export const getBundleImpact = (componentPaths: string[]) => {
  // This is a simplified version. In production, you'd want to use webpack-bundle-analyzer
  // or similar tools to get accurate bundle sizes

  const estimatedSizes: Record<string, number> = {
    Visualizer: 45, // KB
    CymaticsVisualizer: 60, // KB
    SessionTracker: 35, // KB
    ProgressDashboard: 40, // KB
    Modals: 25, // KB
  };

  const total = componentPaths.reduce((sum, path) => {
    const fileName = path.split('/').pop()?.split('.')[0] || '';
    return sum + (estimatedSizes[fileName] || 0);
  }, 0);

  return {
    components: componentPaths.length,
    estimatedTotalKB: total,
    estimatedLoadTime: Math.ceil(total / 500), // Assuming 500KB/s connection
  };
};
