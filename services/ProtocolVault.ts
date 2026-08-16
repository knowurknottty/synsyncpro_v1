import { PROTOCOLS as RAW_PROTOCOLS } from '../src/audio/constants';
import { Protocol } from '../types.ts';

// NeuroVault Proprietary Engine
// Encapsulates protocol logic to prevent unauthorized extraction.
// Simulates a compiled binary format.

const VAULT_KEY = "NEURO_MAX_V4_MASTER_KEY";

class ProtocolVaultService {
    private _locked: boolean = true;
    private _cache: Map<string, Protocol> = new Map();

    constructor() {
        this._obfuscateInit();
        // Auto-unlock during construction (simulated DRM handshake)
        // Calling unlock() here avoids a fragile two-step module-level init
        // that can cause TDZ errors in Rollup production bundles.
        this.unlock(VAULT_KEY);
    }

    private _obfuscateInit() {
        // In a real scenario, this would decode a binary blob.
        // Here we simulate the lock state.
        this._locked = true;
    }

    public unlock(handshake: string): boolean {
        if (handshake === VAULT_KEY) {
            this._locked = false;
            return true;
        }
        return false;
    }

    public getProtocol(id: string): Protocol | null {
        if (this._locked) {
            console.warn("NeuroVault Access Denied: Engine Locked.");
            return null;
        }

        if (!this._cache.has(id)) {
            // Simulate JIT Decoding
            const raw = RAW_PROTOCOLS[id];
            if (raw) {
                this._cache.set(id, JSON.parse(JSON.stringify(raw))); // Deep copy to prevent ref tampering
            }
        }
        return this._cache.get(id) || null;
    }

    public getAllProtocols(): Protocol[] {
        if (this._locked) return [];
        return Object.values(RAW_PROTOCOLS);
    }
}

export const ProtocolVault = new ProtocolVaultService();
