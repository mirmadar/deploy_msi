import { ProductUnit } from '@prisma/client';

export const PRODUCT_UNIT_LABELS: Partial<Record<ProductUnit, string>> = {
  PG_M: 'пг.м.',
  T: 'т',
  KG: 'кг',
  GR: 'гр',
  M: 'м',
  M2: 'м²',
  M3: 'м³',
  SHT: 'шт',
  UP: 'уп',
  SECTION: 'секция',
  ROLL: 'рулон',
  BUKHTA: 'бухта',
};

export const getProductUnitOptions = () =>
  Object.values(ProductUnit).map((value) => ({
    value,
    label: PRODUCT_UNIT_LABELS[value] ?? value,
  }));
