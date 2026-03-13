/**
 * Форматирование даты и времени для отображения в таблицах (ru-RU).
 * @param {string|Date|null|undefined} dateString — ISO-строка или Date
 * @returns {string|null} — например "16 февр. 2025, 14:30" или null
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toLocaleString("ru-RU", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
