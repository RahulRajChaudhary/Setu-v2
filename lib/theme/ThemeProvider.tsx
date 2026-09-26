"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ThemeMode = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

// No client-side persistence by design: this project has no backend/auth yet to
// own the source of truth for a per-user preference, and localStorage isn't
// acceptable (it wouldn't follow the user across devices). Mode lives in memory
// for the session and defaults to "system" on every load. When a real backend
// preference endpoint exists, wire it up here — setMode's callback and the
// initial-mode resolution below are the only two places that need to change.
const DEFAULT_MODE: ThemeMode = "system";

type ThemeContextValue = {
  mode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(resolved: ResolvedTheme) {
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(DEFAULT_MODE);

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    mode === "system" ? getSystemTheme() : mode,
  );

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
  }, []);

  useEffect(() => {
    const resolved = mode === "system" ? getSystemTheme() : mode;
    setResolvedTheme(resolved);
    applyTheme(resolved);

    if (mode !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    function handleChange(event: MediaQueryListEvent) {
      const next = event.matches ? "dark" : "light";
      setResolvedTheme(next);
      applyTheme(next);
    }
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [mode]);

  const value = useMemo(() => ({ mode, resolvedTheme, setMode }), [mode, resolvedTheme, setMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
