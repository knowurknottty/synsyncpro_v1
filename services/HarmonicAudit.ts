
import { Protocol, Phase } from '../types';

export interface HarmonicResult {
    score: number;
    status: 'HARMONIC' | 'DISSONANT' | 'NEUTRAL';
    findings: string[];
    recommendation?: string;
    artifactFrequencies: number[];
}

export class HarmonicAudit {
    /**
     * Analyzes the harmonic compatibility between two protocols if they were stacked or chained.
     */
    static analyzePair(p1: Protocol, p2: Protocol): HarmonicResult {
        // We compare the primary entrainment frequencies (beats) of the first phases
        // for a simplified "initial contact" analysis, or average beats.
        const f1 = p1.phases[0].beat;
        const f2 = p2.phases[0].beat;
        const c1 = p1.phases[0].carrier;
        const c2 = p2.phases[0].carrier;

        return this.analyzeFrequencies([
            { carrier: c1, beat: f1, name: p1.title },
            { carrier: c2, beat: f2, name: p2.title }
        ]);
    }

    static analyzeFrequencies(nodes: { carrier: number, beat: number, name: string }[]): HarmonicResult {
        const findings: string[] = [];
        const artifacts: number[] = [];
        let dissonantCount = 0;
        let harmonicCount = 0;

        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const n1 = nodes[i];
                const n2 = nodes[j];

                // 1. Interference check (Carrier vs Carrier)
                const carrierDiff = Math.abs(n1.carrier - n2.carrier);
                if (carrierDiff > 0 && carrierDiff < 15) {
                    findings.push(`⚠️ CRITICAL: Carriers ${n1.carrier}Hz and ${n2.carrier}Hz create a ${carrierDiff}Hz ghost beat in the sensitive ${carrierDiff < 4 ? 'Delta' : 'Theta'} range.`);
                    dissonantCount += 2;
                }

                // 2. Beat vs Beat interference
                const beatDiff = Math.abs(n1.beat - n2.beat);
                if (beatDiff > 0 && beatDiff < 3) {
                    findings.push(`⚠️ DISSONANCE: Beat frequencies ${n1.beat}Hz and ${n2.beat}Hz are too close, creating a ${beatDiff}Hz interference that causes frequency confusion.`);
                    dissonantCount++;
                }

                // 3. Synergistic artifacts (e.g. Gamma + Alpha creating Theta)
                // If one is high (Gamma 30-100) and one is medium (Alpha 8-12)
                const high = Math.max(n1.beat, n2.beat);
                const low = Math.min(n1.beat, n2.beat);

                const artifact = Math.abs(high - low);
                artifacts.push(artifact);

                if (high >= 30 && low >= 7 && low <= 13) {
                    findings.push(`✅ SYNERGY: ${n1.name} + ${n2.name} creates a ${artifact.toFixed(1)}Hz secondary artifact, providing a relaxation bonus.`);
                    harmonicCount++;
                }
            }
        }

        let status: 'HARMONIC' | 'DISSONANT' | 'NEUTRAL' = 'NEUTRAL';
        if (dissonantCount > 0) status = 'DISSONANT';
        else if (harmonicCount > 0) status = 'HARMONIC';

        let score = 100 - (dissonantCount * 25) + (harmonicCount * 10);
        score = Math.max(0, Math.min(100, score));

        return {
            score,
            status,
            findings,
            artifactFrequencies: artifacts,
            recommendation: status === 'DISSONANT' ? "Recommend separating these protocols or choosing frequencies with >5Hz separation." : undefined
        };
    }
}
