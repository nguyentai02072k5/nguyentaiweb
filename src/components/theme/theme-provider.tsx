"use client";

/**
 * Minimal theme provider — replaces next-themes to avoid React 19 warning
 * about inline <script> tags in component render tree.
 *
 * FOUC prevention script is injected in app/layout via next/script
 * with strategy="beforeInteractive" (runs outside React tree).
 *
 * Uses useSyncExternalStore for SSR-safe hydration with localStorage
 * (avoids setState-in-effect anti-pattern flagged by react-hooks lint).
 *
 * API mirrors next-themes' useTheme(): { theme, setTheme, resolvedTheme }
 */

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";
const DEFAULT_THEME: Theme = "light";
const STORAGE_EVENT = "theme:change";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: Theme;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/* External store: subscribe to storage events to re-render when theme changes. */
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(STORAGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(STORAGE_EVENT, callback);
  };
}

function getClientSnapshot(): Theme {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "dark" ? "dark" : "light";
  } catch {
    return DEFAULT_THEME;
  }
}

function getServerSnapshot(): Theme {
  return DEFAULT_THEME;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  const setTheme = useCallback((next: Theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* localStorage may be unavailable (private mode) — ignore */
    }
    document.documentElement.classList.toggle("dark", next === "dark");
    window.dispatchEvent(new Event(STORAGE_EVENT));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme: theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    /* Sane defaults for consumers outside the provider (e.g. SSR fallback) */
    return {
      theme: DEFAULT_THEME,
      setTheme: () => {},
      resolvedTheme: DEFAULT_THEME,
    };
  }
  return ctx;
}
