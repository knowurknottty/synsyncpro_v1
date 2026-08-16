import { PROTOCOLS, PROTOCOL_CHAINS } from './src/audio/constants';
import { SocraticStep } from './types';
export { PROTOCOLS, PROTOCOL_CHAINS };

export const SOLFEGGIO = {
    UT: 396,   // Liberating guilt/fear
    RE: 417,   // Undoing situations
    MI: 528,   // Transformation/miracles (DNA repair)
    FA: 639,   // Connecting relationships
    SOL: 741,  // Awakening intuition
    LA: 852    // Returning to spiritual order
};

export const SCHUMANN_BASE = 7.83;
export const SCHUMANN_HARMONICS = [7.83, 14.3, 20.8, 27.3, 33.8];

// Protocol IDs that should display "NEW" badge (recently added protocols)
export const NEW_PROTOCOL_IDS = new Set([
    'tg-cfc',    // Memory-Boost Theta Sync
    'ti-pbm',    // Theta-Gamma Intelligence Bridge
    'mgs-40',    // Gamma Focus Fusion
    'smr-mu',    // Calm Body, Alert Mind
    'rf-hrv',    // Autonomic Balance Protocol
    'acsw',      // Alpha Deep Rest
    'hci-639',   // Heart-Centered Connection
    'atb-10',    // Alpha Theta Bridge
    'gmu-1.5'    // Gamma-Mu Integration
]);

export const SOCRATIC_STEPS: SocraticStep[] = [
    { id: 'identify', question: "Identify a limiting belief you wish to remove.", placeholder: "e.g., 'I am not creative enough.'", nextLabel: "Examine" },
    { id: 'examine', question: "What evidence do you have that absolutely contradicts this belief?", placeholder: "List times you were creative...", nextLabel: "Dissolve" },
    { id: 'dissolve', question: "If this belief didn't exist, who would you be right now?", placeholder: "I would be...", nextLabel: "Replace" },
    { id: 'replace', question: "Construct a new, absolute truth to replace the old belief.", placeholder: "e.g., 'My creativity is infinite and flowing.'", nextLabel: "Integrate" }
];

export const GEOMETRY_LESSONS = [
    { 
        shape: "Tetrahedron", element: "Fire", description: "The simplest Platonic solid. 4 faces. Represents the spark of creation, transformation, and the direction of energy.",
        vertices: [[1,1,1], [1,-1,-1], [-1,1,-1], [-1,-1,1]], 
        faces: [[0,1,2], [0,1,3], [0,2,3], [1,2,3]]
    },
    { 
        shape: "Hexahedron (Cube)", element: "Earth", description: "6 faces. Represents stability, grounding, and the physical manifest world.",
        vertices: [[-1,-1,-1], [1,-1,-1], [1,1,-1], [-1,1,-1], [-1,-1,1], [1,-1,1], [1,1,1], [-1,1,1]],
        faces: [[0,1,2,3], [4,5,6,7], [0,1,5,4], [2,3,7,6], [0,3,7,4], [1,2,6,5]]
    }
];
