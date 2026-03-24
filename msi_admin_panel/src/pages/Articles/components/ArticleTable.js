import React from "react";
import {
  Table,
  TableBody,
  Box,
  CircularProgress,
  Typography,
  Checkbox,
  Chip,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Publish as PublishIcon,
  Unpublished as UnpublishedIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from "@mui/icons-material";
import { TableActions } from "../../../components/common/TableActions";
import { formatDateTime } from "../../../utils/dateFormat";
import { ArticleTableHeader } from "./ArticleTableHeader";
import { ArticleTableRow } from "./ArticleTableRow";
import { styles } from "./styles/ArticleTable.styles";

export const ArticleTable = ({
  articles,
  loading,
  selectedArticles,
  onSelect,
  onSelectAll,
  onEdit,
  onDelete,
  onPublish,
  onUnpublish,
  onMoveUp,
  onMoveDown,
  isMovingOrder,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  if (loading && articles.length === 0) {
    return (
      <Box sx={styles.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  if (articles.length === 0) {
    return (
      <Box sx={styles.emptyContainer}>
        <Typography variant="body1" color="text.secondary">
          Статьи не найдены
        </Typography>
      </Box>
    );
  }

  const articleIds = articles.map((article) => article.articleId);
  const allSelected = articleIds.length > 0 && articleIds.every((id) => selectedArticles.includes(id));
  const someSelected = selectedArticles.some((id) => articleIds.includes(id)) && !allSelected;

  const handleSelectAll = (checked) => {
    onSelectAll(articleIds, checked);
  };

  if (isMobile) {
    return (
      <Box sx={styles.mobileList}>
        <Box sx={styles.mobileSelectAllRow}>
          <Typography sx={styles.mobileSelectAllLabel}>Выбрать все на странице</Typography>
          <Checkbox
            indeterminate={someSelected}
            checked={allSelected}
            onChange={(e) => handleSelectAll(e.target.checked)}
            size="small"
          />
        </Box>

        {articles.map((article, index) => {
          const canMoveUp = index > 0 && !isMovingOrder;
          const canMoveDown = index < articles.length - 1 && !isMovingOrder;
          const isPublished = !!article.publishedAt;
          const isDraft = !article.publishedAt;
          return (
            <Box key={article.articleId} sx={styles.mobileCard}>
              <Box sx={styles.mobileTopRow}>
                <Checkbox
                  checked={selectedArticles.includes(article.articleId)}
                  onChange={(e) => onSelect(article.articleId, e.target.checked)}
                  size="small"
                />
                <Typography variant="caption" color="text.secondary">
                  #{article.articleId}
                </Typography>
              </Box>
              <Typography sx={styles.mobileTitle}>{article.title}</Typography>
              <Typography sx={styles.mobileMeta}>
                Автор: {article.author?.username || "—"}
              </Typography>
              <Typography sx={styles.mobileMeta}>
                Создано: {formatDateTime(article.createdAt)}
              </Typography>
              <Box sx={styles.mobileStatusRow}>
                <Chip label={isDraft ? "Черновик" : "Опубликовано"} size="small" color={isDraft ? "default" : "success"} />
                {isPublished && (
                  <Typography variant="caption" color="text.secondary">
                    {formatDateTime(article.publishedAt)}
                  </Typography>
                )}
              </Box>
              <Box sx={styles.mobileActions}>
                <Tooltip title="Выше в списке" arrow>
                  <span>
                    <IconButton size="small" onClick={() => onMoveUp?.(article.articleId)} disabled={!canMoveUp}>
                      <ArrowUpwardIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Ниже в списке" arrow>
                  <span>
                    <IconButton size="small" onClick={() => onMoveDown?.(article.articleId)} disabled={!canMoveDown}>
                      <ArrowDownwardIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                {isDraft && onPublish && (
                  <IconButton size="small" onClick={() => onPublish(article.articleId)}>
                    <PublishIcon fontSize="small" />
                  </IconButton>
                )}
                {isPublished && onUnpublish && (
                  <IconButton size="small" onClick={() => onUnpublish(article.articleId)}>
                    <UnpublishedIcon fontSize="small" />
                  </IconButton>
                )}
                <TableActions onEdit={() => onEdit(article.articleId)} onDelete={() => onDelete(article.articleId)} />
              </Box>
            </Box>
          );
        })}
      </Box>
    );
  }

  return (
    <Table sx={styles.table}>
      <ArticleTableHeader
        allSelected={allSelected}
        someSelected={someSelected}
        onSelectAll={handleSelectAll}
        hasArticles={articles.length > 0}
      />
      <TableBody>
        {articles.map((article, index) => (
          <ArticleTableRow
            key={article.articleId}
            article={article}
            isSelected={selectedArticles.includes(article.articleId)}
            onSelect={(checked) => onSelect(article.articleId, checked)}
            onEdit={() => onEdit(article.articleId)}
            onDelete={() => onDelete(article.articleId)}
            onPublish={onPublish}
            onUnpublish={onUnpublish}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            isMovingOrder={isMovingOrder}
            index={index}
            total={articles.length}
          />
        ))}
      </TableBody>
    </Table>
  );
};

