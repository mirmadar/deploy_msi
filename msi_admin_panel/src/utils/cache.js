// Простое in-memory кэширование с TTL в рамках жизни вкладки
// Ключ: строка, значение: { expiresAt: number, data: any }
const cacheStore = {};

/**
 * Получить из кэша, если не истёк TTL
 * @param {string} key
 * @returns {*|null}
 */
export const getFromCache = (key) => {
  const entry = cacheStore[key];
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    delete cacheStore[key];
    return null;
  }
  return entry.data;
};

/**
 * Положить в кэш с TTL (в миллисекундах)
 * @param {string} key
 * @param {*} data
 * @param {number} ttlMs
 */
export const setToCache = (key, data, ttlMs) => {
  cacheStore[key] = {
    data,
    expiresAt: Date.now() + ttlMs,
  };
};

/**
 * Явно сбросить значение по ключу (например, после сохранения формы)
 * @param {string} key
 */
export const clearCacheKey = (key) => {
  delete cacheStore[key];
};

