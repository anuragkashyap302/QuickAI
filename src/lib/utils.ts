import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * ClassNames merger helper
 * 
 * Ye function dynamic Tailwind classes ko smartly merge karta hai
 * taaki conflicting classes (e.g. 'p-2' vs 'p-4') safely resolve ho sakein.
 * 
 * Example: cn("px-4 py-2", isPrimary && "bg-blue-600 text-white")
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format Date Helper
 */
export function formatDate(date: Date | string | number): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}
