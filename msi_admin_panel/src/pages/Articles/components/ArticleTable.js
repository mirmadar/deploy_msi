import React from "react";
import {
  Table,
  TableBody,
  Box,
  CircularProgress,
  Typography,
} from "@mui/material";
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

