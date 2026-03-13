// Константы для единиц измерения товаров
export const PRODUCT_UNITS = {
  PG_M: "PG_M",
  T: "T",
  KG: "KG",
  M: "M",
  M2: "M2",
  M3: "M3",
  SHT: "SHT",
  UP: "UP",
};

// Маппинг единиц измерения для отображения
export const PRODUCT_UNITS_LABELS = {
  [PRODUCT_UNITS.PG_M]: "Пг.м.",
  [PRODUCT_UNITS.T]: "Т",
  [PRODUCT_UNITS.KG]: "Кг",
  [PRODUCT_UNITS.M]: "М",
  [PRODUCT_UNITS.M2]: "М²",
  [PRODUCT_UNITS.M3]: "М³",
  [PRODUCT_UNITS.SHT]: "Шт",
  [PRODUCT_UNITS.UP]: "Уп",
};

// Получить метку единицы измерения по значению
export const getUnitLabel = (unit) => {
  return PRODUCT_UNITS_LABELS[unit] || unit || "—";
};

// Массив единиц измерения для использования в Select
export const PRODUCT_UNITS_OPTIONS = Object.entries(PRODUCT_UNITS_LABELS).map(([value, label]) => ({
  value,
  label,
}));


