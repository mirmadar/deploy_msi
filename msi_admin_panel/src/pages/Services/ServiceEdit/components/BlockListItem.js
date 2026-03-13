import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Button,
} from "@mui/material";
import {
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
} from "@mui/icons-material";
import { BLOCK_TYPE_LABELS } from "../constants/blockTypes";
import { BlockPayloadForm } from "./BlockPayloadForm";
import { BlockPreviewContent } from "./BlockPreviewContent";
import { styles } from "./styles/BlockListItem.styles";

export const BlockListItem = ({
  block,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
  isReordering = false,
  isInlineEditing = false,
  onSaveInline,
  onDoneInline,
}) => {
  const blockId = block.serviceBlockId ?? block.id;
  const [payload, setPayload] = useState(() => block.payload ?? {});

  useEffect(() => {
    if (isInlineEditing) setPayload(block.payload ?? {});
  }, [isInlineEditing, block.payload]);

  const canMoveUp = index > 0 && !isReordering;
  const canMoveDown = index < total - 1 && !isReordering;
  const typeLabel = BLOCK_TYPE_LABELS[block.type] ?? block.type;

  const handleDone = () => {
    onSaveInline?.(blockId, payload);
    onDoneInline?.();
  };

  if (isInlineEditing) {
    return (
      <Box sx={styles.inlineEditRow}>
        <Box sx={styles.inlineEditOrder}>
          <Typography variant="body2" color="text.secondary">
            {index + 1}
          </Typography>
        </Box>
        <Box sx={styles.inlineEditForm}>
          <Typography variant="body2" fontWeight={500} color="text.secondary" sx={{ mb: 1 }}>
            {typeLabel}
          </Typography>
          <BlockPayloadForm type={block.type} payload={payload} onChange={setPayload} />
        </Box>
        <Box sx={styles.inlineEditActions}>
          <Tooltip title="Готово" arrow>
            <IconButton color="primary" size="small" onClick={handleDone} sx={styles.doneBtn}>
              <CheckIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={styles.previewCard}>
      <Box sx={styles.previewCardToolbar}>
        <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
          {index + 1}. {typeLabel}
        </Typography>
        <Box sx={styles.actions}>
          <Tooltip title="Выше" arrow>
            <span>
              <IconButton
                size="small"
                disabled={!canMoveUp}
                onClick={() => onMoveUp?.(blockId, index)}
                sx={styles.moveBtn}
              >
                <ArrowUpwardIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Ниже" arrow>
            <span>
              <IconButton
                size="small"
                disabled={!canMoveDown}
                onClick={() => onMoveDown?.(blockId, index)}
                sx={styles.moveBtn}
              >
                <ArrowDownwardIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Редактировать" arrow>
            <IconButton size="small" onClick={() => onEdit?.(block)} sx={styles.editBtn}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Удалить" arrow>
            <IconButton size="small" onClick={() => onDelete?.(blockId)} sx={styles.deleteBtn}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <Box sx={styles.previewCardContent}>
        <BlockPreviewContent block={block} />
      </Box>
    </Box>
  );
};
