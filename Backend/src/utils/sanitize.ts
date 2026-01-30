/**
 * Utility functions for sanitizing user input to prevent injection attacks
 */

/**
 * Sanitize search input to prevent ReDoS (Regular Expression Denial of Service) attacks
 * @param searchTerm - User-provided search term
 * @param maxLength - Maximum length allowed (default: 100)
 * @returns Sanitized search term safe for regex
 */
export const sanitizeSearchInput = (searchTerm: string | undefined, maxLength: number = 100): string | undefined => {
  if (!searchTerm) {
    return undefined;
  }

  // Escape regex special characters to prevent ReDoS
  const sanitized = searchTerm
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape regex special characters
    .substring(0, maxLength) // Limit length to prevent ReDoS
    .trim();

  // Return undefined if empty after sanitization
  return sanitized.length > 0 ? sanitized : undefined;
};

/**
 * Sanitize string input by removing potentially dangerous characters
 * @param input - User input string
 * @param maxLength - Maximum length allowed
 * @returns Sanitized string
 */
export const sanitizeString = (input: string | undefined, maxLength: number = 1000): string => {
  if (!input) {
    return '';
  }

  return input
    .substring(0, maxLength)
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, ''); // Remove control characters
};

