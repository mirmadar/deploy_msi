export function formatUnit(
  unit: string | null | undefined,
  unitLabels?: Record<string, string>,
): string {
  if (!unit) return 'шт';
  if (!unitLabels) return unit;
  return unitLabels[unit] || unit;
}
