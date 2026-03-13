// Стили для ProductForm
export const styles = {
  container: {
    p: 2.5,
  },
  // Заголовок
  header: {
    display: "flex",
    alignItems: "center",
    gap: 2.5,
    mb: 3,
    pb: 2.5,
    borderBottom: "1px solid",
    borderColor: "divider",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 1.5,
    border: "1px solid",
    borderColor: "divider",
    flexShrink: 0,
  },
  // Заголовок товара
  title: {
    variant: "h6",
    fontWeight: 600,
    mb: 0.5,
    fontSize: "1rem",
    color: "text.primary",
  },
  // ID товара
  idText: {
    variant: "body2",
    color: "text.secondary",
    fontSize: "0.875rem",
    fontWeight: 400,
  },
  // Основная информация - компактный список
  infoList: {
    display: "flex",
    flexDirection: "column",
    gap: 1.5,
    pb: 2.5,
    borderBottom: "1px solid",
    borderColor: "divider",
  },
  infoItem: {
    display: "flex",
    alignItems: "center",
    gap: 2,
    py: 0.75,
  },
  // Единый стиль для всех меток (labels)
  infoLabel: {
    variant: "body2",
    color: "text.secondary",
    fontSize: "0.875rem",
    fontWeight: 400,
    minWidth: 100,
    flexShrink: 0,
  },
  // Единый стиль для всех значений
  infoValue: {
    variant: "body2",
    color: "text.primary",
    fontSize: "0.875rem",
    fontWeight: 500,
  },
  statusChip: {
    height: 22,
    fontSize: "0.75rem",
  },
  // Характеристики
  characteristicsSection: {
    pt: 2.5,
  },
  characteristicsTitle: {
    variant: "subtitle2",
    fontWeight: 600,
    fontSize: "0.875rem",
    color: "text.secondary",
    mb: 2,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  characteristicsList: {
    display: "flex",
    flexDirection: "column",
    gap: 1.5,
  },
  characteristicItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: 2,
    py: 0.75,
    px: 0,
  },
  // Используем тот же стиль, что и infoLabel
  characteristicName: {
    variant: "body2",
    color: "text.secondary",
    fontSize: "0.875rem",
    fontWeight: 400,
    minWidth: 120,
    flexShrink: 0,
  },
  // Используем тот же стиль, что и infoValue
  characteristicValue: {
    variant: "body2",
    color: "text.primary",
    fontSize: "0.875rem",
    fontWeight: 500,
  },
};
