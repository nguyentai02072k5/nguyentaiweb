"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

/**
 * App-wide theme provider - wraps next-themes.
 * Toggles `.dark` class on <html> via attribute="class".
 */
export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
