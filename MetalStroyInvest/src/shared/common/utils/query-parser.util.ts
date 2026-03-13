import type { Request } from 'express';

export function parseCategories(
  categories: string | string[] | undefined,
  rawQuery?: Request['query'],
): string[] | undefined {
  let categoriesArray: string[] | undefined;

  const categoriesFromArray = rawQuery?.['categories[]'];
  if (categoriesFromArray) {
    if (Array.isArray(categoriesFromArray)) {
      categoriesArray = categoriesFromArray.map((c) => String(c).trim()).filter((c) => c.length > 0);
    } else {
      categoriesArray = [String(categoriesFromArray).trim()].filter((c) => c.length > 0);
    }
  } else if (categories) {
    if (typeof categories === 'string') {
      categoriesArray = categories.split(',').map((c) => c.trim()).filter((c) => c.length > 0);
    } else if (Array.isArray(categories)) {
      categoriesArray = categories.map((c) => String(c).trim()).filter((c) => c.length > 0);
    }
  }

  if (categoriesArray && categoriesArray.length === 0) {
    categoriesArray = undefined;
  }

  return categoriesArray;
}

export function parsePrice(priceStr: string | undefined): number | undefined {
  if (!priceStr) return undefined;
  const price = parseFloat(priceStr);
  return !isNaN(price) ? price : undefined;
}

export function parseBoolean(boolStr: string | undefined): boolean | undefined {
  if (boolStr === undefined) return undefined;
  return boolStr === 'true' || boolStr === '1';
}

const MAX_PAGE = 1000;
const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 20;

/** Безопасная пагинация: ограничивает page и pageSize для защиты от DoS и перегрузки. */
export function parsePagination(page: string | undefined, pageSize: string | undefined) {
  let p = parseInt(page || '1', 10);
  let ps = parseInt(pageSize || String(DEFAULT_PAGE_SIZE), 10);
  if (!Number.isFinite(p) || p < 1) p = 1;
  if (p > MAX_PAGE) p = MAX_PAGE;
  if (!Number.isFinite(ps) || ps < 1) ps = DEFAULT_PAGE_SIZE;
  if (ps > MAX_PAGE_SIZE) ps = MAX_PAGE_SIZE;
  return {
    page: p,
    pageSize: ps,
  };
}

//Валидирует и возвращает параметры сортировки
export function parseSortParams<T extends string>(
  sortBy: string | undefined,
  sortOrder: string | undefined,
  validSortByValues: readonly T[],
  defaultSortBy: T,
  defaultSortOrder: 'asc' | 'desc' = 'desc',
): { sortBy: T; sortOrder: 'asc' | 'desc' } {
  const validSortBy = (validSortByValues.includes(sortBy as T) ? sortBy : defaultSortBy) as T;
  const validSortOrder = sortOrder === 'asc' || sortOrder === 'desc' ? sortOrder : defaultSortOrder;

  return {
    sortBy: validSortBy,
    sortOrder: validSortOrder,
  };
}
