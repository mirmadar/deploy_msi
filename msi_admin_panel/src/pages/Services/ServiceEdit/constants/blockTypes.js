// Типы блоков контента услуги (соответствуют бэкенду)
export const BLOCK_TYPES = {
  HEADING: "HEADING",
  TEXT: "TEXT",
  LIST: "LIST",
  IMAGE: "IMAGE",
  DOCUMENTS: "DOCUMENTS",
};

export const BLOCK_TYPE_LABELS = {
  [BLOCK_TYPES.HEADING]: "Заголовок",
  [BLOCK_TYPES.TEXT]: "Текст",
  [BLOCK_TYPES.LIST]: "Список",
  [BLOCK_TYPES.IMAGE]: "Изображение",
  [BLOCK_TYPES.DOCUMENTS]: "Документы",
};

export const BLOCK_TYPE_ORDER = [
  BLOCK_TYPES.HEADING,
  BLOCK_TYPES.TEXT,
  BLOCK_TYPES.LIST,
  BLOCK_TYPES.IMAGE,
  BLOCK_TYPES.DOCUMENTS,
];
