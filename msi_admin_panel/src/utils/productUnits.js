// Fallback на случай, если API со списком единиц недоступен.
export const FALLBACK_PRODUCT_UNITS = [
  { value: "PG_M", label: "пг.м." },
  { value: "T", label: "т" },
  { value: "KG", label: "кг" },
  { value: "GR", label: "г" },
  { value: "M", label: "м" },
  { value: "M2", label: "м²" },
  { value: "M3", label: "м³" },
  { value: "SHT", label: "шт" },
  { value: "UP", label: "уп" },
  { value: "SECTION", label: "секция" },
  { value: "ROLL", label: "рулон" },
  { value: "BUKHTA", label: "бухта" },
];

export const getUnitLabel = (unit) => {
  if (!unit) return "—";
  const found = FALLBACK_PRODUCT_UNITS.find((item) => item.value === unit);
  return found?.label || unit;
};