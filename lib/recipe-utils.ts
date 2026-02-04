/**
 * Utility functions for recipe calculations, particularly serving size adjustments
 */

// Units that should not be scaled (taste-based or fixed amounts)
const NON_SCALABLE_UNITS = [
  'pinch',
  'pinches',
  'to taste',
  'as needed',
  'for garnish',
  'optional',
];

// Units that should display as whole numbers (countable items)
const COUNTABLE_UNITS = [
  'piece', 'pieces', 'slice', 'slices', 'clove', 'cloves',
  'leaf', 'leaves', 'sprig', 'sprigs', 'head', 'heads',
  'bulb', 'bulbs', 'stalk', 'stalks', 'egg', 'eggs',
];

// Units that benefit from rounding to nice numbers when large
const WEIGHT_VOLUME_UNITS = [
  'g', 'kg', 'ml', 'l', 'oz', 'lb', 'cup', 'cups',
];

/**
 * Round to a "nice" number for cooking (nearest 5 for larger values)
 */
function roundToNice(value: number): number {
  if (value >= 100) {
    // Round to nearest 5 for values >= 100
    return Math.round(value / 5) * 5;
  } else if (value >= 10) {
    // Round to nearest whole number for values >= 10
    return Math.round(value);
  }
  // Keep precision for smaller values
  return Math.round(value * 10) / 10;
}

/**
 * Format a quantity for display, with smart rounding based on unit type
 */
export function formatQuantity(quantity: number, unit?: string): string {
  // Round to 2 decimal places to avoid floating point issues
  let rounded = Math.round(quantity * 100) / 100;
  
  // Handle zero
  if (rounded === 0) return '0';
  
  const normalizedUnit = unit?.toLowerCase().trim() || '';
  const isCountable = COUNTABLE_UNITS.some(u => normalizedUnit.includes(u));
  const isWeightVolume = WEIGHT_VOLUME_UNITS.some(u => normalizedUnit === u || normalizedUnit.endsWith(u));
  
  // For weight/volume units with larger values, round to nice numbers
  if (isWeightVolume && rounded >= 10) {
    rounded = roundToNice(rounded);
  }
  
  // Handle whole numbers
  if (rounded % 1 === 0) {
    return Math.round(rounded).toString();
  }
  
  // For countable items, round to nearest 0.5
  if (isCountable) {
    rounded = Math.round(rounded * 2) / 2; // Round to nearest 0.5
    if (rounded % 1 === 0) {
      return Math.round(rounded).toString();
    }
  }
  
  // For values >= 10, just round to whole number
  if (rounded >= 10) {
    return Math.round(rounded).toString();
  }
  
  // Clean decimal display - remove trailing zeros
  const decimalStr = rounded.toFixed(1).replace(/\.0$/, '');
  return decimalStr;
}

/**
 * Check if a unit should be scaled
 */
export function isScalableUnit(unit: string): boolean {
  const normalizedUnit = unit.toLowerCase().trim();
  return !NON_SCALABLE_UNITS.some(nonScalable => 
    normalizedUnit.includes(nonScalable)
  );
}

/**
 * Calculate the scaled quantity based on serving adjustment
 * @param originalQuantity - The original quantity from the recipe
 * @param originalServings - The default servings the recipe is designed for
 * @param newServings - The user's desired serving count
 * @param unit - The unit of measurement (to check if scalable)
 * @returns The scaled quantity
 */
export function calculateScaledQuantity(
  originalQuantity: number | string,
  originalServings: number,
  newServings: number,
  unit?: string
): number {
  // Parse quantity if it's a string
  const quantity = typeof originalQuantity === 'string' 
    ? parseFloat(originalQuantity) || 0 
    : originalQuantity;
  
  // If unit is not scalable, return original quantity
  if (unit && !isScalableUnit(unit)) {
    return quantity;
  }
  
  // Avoid division by zero
  if (originalServings <= 0) {
    return quantity;
  }
  
  // Calculate the multiplier and apply it
  const multiplier = newServings / originalServings;
  return quantity * multiplier;
}

/**
 * Format a scaled quantity with its unit for display
 */
export function formatScaledIngredient(
  originalQuantity: number | string,
  unit: string,
  originalServings: number,
  newServings: number
): string {
  const scaledQuantity = calculateScaledQuantity(
    originalQuantity,
    originalServings,
    newServings,
    unit
  );
  
  const formattedQuantity = formatQuantity(scaledQuantity);
  
  return `${formattedQuantity} ${unit}`.trim();
}

/**
 * Get the default servings value, with fallback
 */
export function getDefaultServings(recipeServings?: number | null): number {
  return recipeServings && recipeServings > 0 ? recipeServings : 2;
}
