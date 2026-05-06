// src/providers/AccessibilityProvider.tsx
/* eslint-disable react-refresh/only-export-components */

// Stores the user's a11y prefs (easy-read German + reduced motion), saves them to localStorage,
// and mirrors them onto <html data-easy-read data-reduced-motion> so CSS can react to them.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const STORAGE_KEY = 'mira:a11y';

interface StoredPrefs {
  easyRead?: boolean;
  reducedMotion?: boolean;
}

interface AccessibilityState {
  easyRead: boolean;
  reducedMotion: boolean;
  setEasyRead: (value: boolean) => void;
  setReducedMotion: (value: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityState | null>(null);

const getSystemReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function readStoredPrefs(): StoredPrefs {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredPrefs) : {};
  } catch {
    return {};
  }
}

function writeStoredPrefs(prefs: StoredPrefs): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* private mode / quota — just skip */
  }
}

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [easyRead, setEasyReadState] = useState<boolean>(
    () => readStoredPrefs().easyRead ?? false,
  );
  const [reducedMotion, setReducedMotionState] = useState<boolean>(() => {
    const stored = readStoredPrefs().reducedMotion;
    // If they never picked, fall back to whatever the OS says.
    return stored !== undefined ? stored : getSystemReducedMotion();
  });

  useEffect(() => {
    document.documentElement.dataset.easyRead = easyRead ? 'true' : 'false';
  }, [easyRead]);

  useEffect(() => {
    document.documentElement.dataset.reducedMotion = reducedMotion ? 'true' : 'false';
  }, [reducedMotion]);

  // If the user never picked, follow OS changes live.
  useEffect(() => {
    if (readStoredPrefs().reducedMotion !== undefined) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => setReducedMotionState(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const setEasyRead = useCallback((value: boolean) => {
    setEasyReadState(value);
    writeStoredPrefs({ ...readStoredPrefs(), easyRead: value });
  }, []);

  const setReducedMotion = useCallback((value: boolean) => {
    setReducedMotionState(value);
    writeStoredPrefs({ ...readStoredPrefs(), reducedMotion: value });
  }, []);

  const value = useMemo<AccessibilityState>(
    () => ({ easyRead, reducedMotion, setEasyRead, setReducedMotion }),
    [easyRead, reducedMotion, setEasyRead, setReducedMotion],
  );

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility(): AccessibilityState {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error('useAccessibility must be used inside <AccessibilityProvider>.');
  return ctx;
}