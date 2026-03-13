import React from "react";
import {
  TableRow,
  TableCell,
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Checkbox,
} from "@mui/material";
import {
  Publish as PublishIcon,
  Unpublished as UnpublishedIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from "@mui/icons-material";
import { TableActions } from "../../../components/common/TableActions";
import { formatDateTime } from "../../../utils/dateFormat";
import { styles } from "./styles/ArticleTableRow.styles";

export const ArticleTableRow = ({
  article,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onPublish,
  onUnpublish,
  onMoveUp,
  onMoveDown,
  isMovingOrder = false,
  index = 0,
  total = 1,
}) => {
  const canMoveUp = index > 0 && !isMovingOrder;
  const canMoveDown = index < total - 1 && !isMovingOrder;
  // Статья опубликована, если есть publishedAt
  const isPublished = !!article.publishedAt;
  const isDraft = !article.publishedAt;
  const publishedDateFormatted = formatDateTime(article.publishedAt);

  return (
    <TableRow hover selected={isSelected} sx={styles.tableRow}>
      <TableCell padding="checkbox">
        <Checkbox
          checked={isSelected}
          onChange={(e) => onSelect(e.target.checked)}
          size="small"
        />
      </TableCell>
      <TableCell sx={styles.idCell}>
        <Box sx={styles.cellContent}>
          <Typography variant="body2" sx={styles.idText}>
            #{article.articleId}
          </Typography>
        </Box>
      </TableCell>
      <TableCell sx={styles.titleCell}>
        <Box sx={styles.titleCellWrapper}>
          <Typography variant="body2" sx={styles.titleText}>
            {article.title}
          </Typography>
        </Box>
      </TableCell>
      <TableCell sx={styles.authorCell}>
        <Box sx={styles.cellContent}>
          <Typography variant="body2" sx={styles.authorText}>
            {article.author?.username || "—"}
          </Typography>
        </Box>
      </TableCell>
      <TableCell sx={styles.createdCell}>
        <Box sx={styles.cellContent}>
          <Typography variant="body2" sx={styles.createdText}>
            {formatDateTime(article.createdAt)}
          </Typography>
        </Box>
      </TableCell>
      <TableCell sx={styles.publishedCell}>
        <Box sx={styles.cellContent}>
          {isDraft ? (
            <Chip
              label="Черновик"
              size="small"
              color="default"
              sx={styles.draftChip}
            />
          ) : (
            <>
              {publishedDateFormatted && (
                <Typography variant="body2" sx={styles.publishedText}>
                  {publishedDateFormatted}
                </Typography>
              )}
              <Chip
                label="Опубликовано"
                size="small"
                color="success"
                sx={styles.publishedChip}
              />
            </>
          )}
        </Box>
      </TableCell>
      <TableCell sx={styles.actionsCell}>
        <Box sx={styles.cellContent}>
          <Box sx={styles.actionsContainer}>
            {onMoveUp && (
              <Tooltip title="Выше в списке" arrow>
                <span>
                  <IconButton
                    size="small"
                    onClick={() => onMoveUp(article.articleId)}
                    disabled={!canMoveUp}
                    sx={{ minWidth: 32 }}
                  >
                    <ArrowUpwardIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            )}
            {onMoveDown && (
              <Tooltip title="Ниже в списке" arrow>
                <span>
                  <IconButton
                    size="small"
                    onClick={() => onMoveDown(article.articleId)}
                    disabled={!canMoveDown}
                    sx={{ minWidth: 32 }}
                  >
                    <ArrowDownwardIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            )}
            {isDraft && onPublish && (
              <Tooltip title="Опубликовать" arrow>
                <IconButton
                  size="small"
                  onClick={() => onPublish(article.articleId)}
                  sx={styles.publishButton}
                >
                  <PublishIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {isPublished && onUnpublish && (
              <Tooltip title="Снять с публикации" arrow>
                <IconButton
                  size="small"
                  onClick={() => onUnpublish(article.articleId)}
                  sx={styles.unpublishButton}
                >
                  <UnpublishedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <TableActions
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </Box>
        </Box>
      </TableCell>
    </TableRow>
  );
};

