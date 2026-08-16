import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { AudioEngine } from '../../services/AudioEngine.ts';
import {
  SignalProofTap,
  SignalProofTapNode,
} from '../audio/proof/SignalProofTap.ts';

/**
 * AudioEngineContext provides a singleton AudioEngine instance managed by the
 * React lifecycle. ProofTapContext exposes a read-only measurement substrate
 * fed by the post-limiter/analyser stereo stream delivered to the destination.
 */
const AudioEngineContext = createContext<AudioEngine | null>(null);
const ProofTapContext = createContext<SignalProofTap | null>(null);

interface AudioEngineProviderProps {
  children: ReactNode;
  onError?: (error: Error) => void;
}

export const AudioEngineProvider: React.FC<AudioEngineProviderProps> = ({
  children,
  onError,
}) => {
  const engineRef = useRef<AudioEngine | null>(null);
  const proofNodeRef = useRef<SignalProofTapNode | null>(null);
  const [proofTap, setProofTap] = useState<SignalProofTap | null>(null);

  if (!engineRef.current) {
    engineRef.current = new AudioEngine();
  }

  useEffect(() => {
    const engine = engineRef.current;
    let cancelled = false;

    if (!engine) return undefined;

    if (onError) {
      engine.onError = (error: Error) => onError(error);
    }

    const attachProofTap = async (): Promise<void> => {
      const context = engine.ctx;
      const analyser = engine.analyser;
      if (!context || !analyser || !context.audioWorklet) return;

      let proofNode: SignalProofTapNode | null = null;
      try {
        proofNode = await SignalProofTapNode.create(context, {
          seconds: 4,
          chunkFrames: 2048,
        });

        if (cancelled) {
          proofNode.disconnect();
          return;
        }

        // Fail-safe reroute: establish the downstream proof-node connection
        // before touching the proven analyser -> destination route. Only after
        // that connection succeeds do we replace the direct analyser edge.
        proofNode.node.connect(context.destination);

        try {
          analyser.connect(proofNode.node);
          analyser.disconnect(context.destination);
        } catch (error) {
          // Roll back to the original route if any graph mutation fails.
          try {
            analyser.disconnect(proofNode.node);
          } catch {
            // Best-effort rollback; the direct route remains unless disconnect
            // succeeded below.
          }
          try {
            analyser.connect(context.destination);
          } catch {
            // If this throws, surface the original graph error to the caller.
          }
          try {
            proofNode.node.disconnect(context.destination);
          } catch {
            // Ignore cleanup failure; node is about to be disposed.
          }
          proofNode.disconnect();
          throw error;
        }

        proofNodeRef.current = proofNode;
        setProofTap(proofNode.tap);
      } catch (error) {
        const normalized = error instanceof Error ? error : new Error(String(error));
        console.warn('Signal proof tap unavailable:', normalized);
        onError?.(normalized);
      }
    };

    void attachProofTap();

    return () => {
      cancelled = true;
      engine.onError = undefined;

      const context = engine.ctx;
      const analyser = engine.analyser;
      const proofNode = proofNodeRef.current;

      if (context && analyser && proofNode) {
        try {
          analyser.disconnect(proofNode.node);
        } catch {
          // It may already be disconnected during teardown.
        }
        try {
          proofNode.node.disconnect(context.destination);
        } catch {
          // It may already be disconnected during teardown.
        }
        try {
          analyser.connect(context.destination);
        } catch (error) {
          console.error('Error restoring AudioEngine output route:', error);
        }
        proofNode.disconnect();
        proofNodeRef.current = null;
        setProofTap(null);
      }

      try {
        engine.dispose?.();
      } catch (error) {
        console.error('Error disposing AudioEngine:', error);
      }
    };
  }, [onError]);

  return (
    <AudioEngineContext.Provider value={engineRef.current}>
      <ProofTapContext.Provider value={proofTap}>
        {children}
      </ProofTapContext.Provider>
    </AudioEngineContext.Provider>
  );
};

export const useAudioEngine = (): AudioEngine => {
  const engine = useContext(AudioEngineContext);
  if (!engine) {
    throw new Error(
      'useAudioEngine must be used within an AudioEngineProvider. ' +
        'Wrap your component tree with <AudioEngineProvider>'
    );
  }
  return engine;
};

/**
 * Returns the live proof tap, or null while AudioWorklet is unavailable/loading.
 * Consumers must render an explicit unavailable state rather than inventing data.
 */
export const useSignalProofTap = (): SignalProofTap | null =>
  useContext(ProofTapContext);
