import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface MotionContextValue {
    reduceMotion: boolean;
    setReduceMotion: (value: boolean) => void;
}

const MotionContext = createContext<MotionContextValue>({
    reduceMotion: false,
    setReduceMotion: () => {},
});

export const useMotion = () => {
    const context = useContext(MotionContext);
    if (!context) {
        throw new Error('useMotion must be used within MotionProvider');
    }
    return context;
};

interface MotionProviderProps {
    children: ReactNode;
}

export const MotionProvider: React.FC<MotionProviderProps> = ({ children }) => {
    const [reduceMotion, setReduceMotion] = useState<boolean>(() => {
        // Check both localStorage preference and system preference
        const storedPref = localStorage.getItem('synsync_reduce_motion');
        if (storedPref !== null) {
            return storedPref === 'true';
        }
        // Fall back to system preference
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    });

    // Persist to localStorage when changed
    useEffect(() => {
        localStorage.setItem('synsync_reduce_motion', String(reduceMotion));
    }, [reduceMotion]);

    return (
        <MotionContext.Provider value={{ reduceMotion, setReduceMotion }}>
            {children}
        </MotionContext.Provider>
    );
};
