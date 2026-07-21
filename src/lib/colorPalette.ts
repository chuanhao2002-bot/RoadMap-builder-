// A curated palette of saturated, mid-to-dark tones — every color here keeps
// white overlay text (project bars/cards/dots) readable. Deliberately avoids
// light hues like yellow that look nice as a swatch but fail contrast once
// white text sits on top of them.
export const COLOR_PALETTE = [
  "#2563eb", // blue
  "#7c3aed", // violet
  "#db2777", // pink
  "#ea580c", // orange
  "#059669", // emerald
  "#0891b2", // cyan
  "#dc2626", // red
  "#4f46e5", // indigo
  "#0d9488", // teal
  "#b45309", // amber
];

/**
 * Deterministically maps a category name to a color in COLOR_PALETTE, so
 * every project in the same category (and the category's own indicators)
 * always render the same color — no manual picking required.
 */
export function colorForCategory(category: string): string {
  const key = category.trim().toLowerCase();
  if (!key) return COLOR_PALETTE[0];
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  return COLOR_PALETTE[Math.abs(hash) % COLOR_PALETTE.length];
}
