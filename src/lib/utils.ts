import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes with conflict resolution.
 * Used by all shadcn/ui components and custom components.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
