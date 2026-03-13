/**
 * Единицы измерения товаров
 */
export enum ProductUnit {
  PG_M = 'PG_M', // Пг.м. - погонный метр
  T = 'T', // Т - тонны
  KG = 'KG', // Кг - килограммы
  M = 'M', // М - метры
  M2 = 'M2', // М² - метры квадратные
  M3 = 'M3', // М³ - метры кубические
  SHT = 'SHT', // Шт - штука
  UP = 'UP', // Уп - упаковка
}

/**
 * Преобразует значение единицы измерения в читаемый формат
 */
export function formatUnit(unit: string | null | undefined): string {
  if (!unit) return 'шт';

  const unitUpper = unit.toUpperCase();

  switch (unitUpper) {
    case ProductUnit.PG_M:
      return 'пг.м.';
    case ProductUnit.T:
      return 'т';
    case ProductUnit.KG:
      return 'кг';
    case ProductUnit.M:
      return 'м';
    case ProductUnit.M2:
      return 'м²';
    case ProductUnit.M3:
      return 'м³';
    case ProductUnit.SHT:
      return 'шт';
    case ProductUnit.UP:
      return 'уп';
    default:
      // Если значение не распознано, возвращаем как есть (для обратной совместимости)
      return unit;
  }
}




