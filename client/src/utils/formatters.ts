/**
 * Utility functions for formatting strings, names, and numbers across the application.
 */

/**
 * Condenses very long generated store names (e.g., "Urban Artisan Coffee Roasters #14")
 * into concise, unique, and memorable display names (e.g., "Urban Coffee #14")
 * while preserving the full name for tooltips and accessibility.
 */
export function formatStoreName(name: string | undefined | null, maxLength = 28): string {
  if (!name) return "Unnamed Store";
  const trimmed = name.trim();

  // If already short enough, return as is
  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  // Check if store has a number/ID suffix like "#12" or "Store 12"
  const hashMatch = trimmed.match(/#\d+/);
  const tag = hashMatch ? ` ${hashMatch[0]}` : "";

  // Remove excess filler words if present to keep it punchy and unique
  const simplified = trimmed
    .replace(/\s*#\d+/, "")
    .replace(/\s+(Retail Hub|Specialty|Boutique|Depot|Solutions|Outpost|Gallery|Works|Studio|Center|Hub|Depot|Store)/gi, "")
    .trim();

  const candidate = `${simplified}${tag}`;
  if (candidate.length <= maxLength) {
    return candidate;
  }

  return `${candidate.slice(0, maxLength - 3)}...`;
}
