import DOMPurify from 'isomorphic-dompurify';

/**
 * Санитизирует HTML для безопасного вывода (защита от XSS).
 * Разрешает безопасные теги (p, strong, em, a, ul, ol, li, br, h1–h6 и т.д.),
 * удаляет script, event-атрибуты и опасные протоколы.
 */
export function sanitizeHtml(dirty: string): string {
  if (typeof dirty !== 'string') return '';
  return DOMPurify.sanitize(dirty, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'b', 'i', 'u', 's', 'a', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'code', 'span', 'div',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'img', 'hr',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'src', 'alt', 'width', 'height', 'title'],
    ADD_ATTR: ['target'],
  });
}
