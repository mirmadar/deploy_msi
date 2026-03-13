import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
  Checkbox,
} from "@mui/material";
import {
  KeyboardArrowRight as KeyboardArrowRightIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from "@mui/icons-material";
import { styles } from "./styles/ServiceCategoryTreeNode.styles";

export const ServiceCategoryTreeNode = ({
  node,
  level,
  expanded,
  onToggleExpand,
  onEdit,
  onDelete,
  parentId,
  onMoveUp,
  onMoveDown,
  indexInSiblings = 0,
  siblingsCount = 1,
  globalIndex,
  totalInCategory,
  isMovingOrder = false,
  fetchChildren,
  childrenCache,
  loadingChildren,
  selectedCategories = [],
  onSelect,
}) => {
  const nodeId = node.id ?? node.serviceCategoryId;
  const isExpanded = expanded.has(nodeId);
  const hasChildren = node.hasChildren === true;
  const localChildren = childrenCache[nodeId] || [];
  const useGlobalOrder = parentId == null && totalInCategory != null && globalIndex != null;
  const canMoveUp = (useGlobalOrder ? globalIndex > 0 : indexInSiblings > 0) && !isMovingOrder;
  const canMoveDown = (useGlobalOrder ? globalIndex < totalInCategory - 1 : indexInSiblings < siblingsCount - 1) && !isMovingOrder;

  const sortedChildren = [...localChildren].sort((a, b) => {
    const orderA = a.sortOrder ?? 999;
    const orderB = b.sortOrder ?? 999;
    if (orderA !== orderB) return orderA - orderB;
    return (b.id ?? b.serviceCategoryId ?? 0) - (a.id ?? a.serviceCategoryId ?? 0);
  });

  const isLoadingChildren = loadingChildren[nodeId];
  const isSelected = selectedCategories.includes(nodeId);

  return (
    <Box>
      <Box sx={styles.nodeRow}>
        <Box sx={styles.nodeContent}>
          <Checkbox
            checked={isSelected}
            onChange={(e) => onSelect && onSelect(nodeId, e.target.checked)}
            size="small"
            sx={styles.checkbox}
            onClick={(e) => e.stopPropagation()}
          />

          <Box sx={styles.idCell}>
            <Typography variant="body2" sx={styles.idText}>
              #{nodeId}
            </Typography>
          </Box>

          <Box sx={styles.indent(level)} />

          {hasChildren ? (
            <IconButton
              size="small"
              onClick={() => onToggleExpand(nodeId)}
              sx={styles.expandButton}
              disabled={isLoadingChildren}
            >
              {isExpanded ? (
                <KeyboardArrowDownIcon fontSize="small" />
              ) : (
                <KeyboardArrowRightIcon fontSize="small" />
              )}
            </IconButton>
          ) : (
            <Box sx={styles.expandPlaceholder} />
          )}

          <Typography variant="body2" sx={styles.categoryName}>
            {node.name}
          </Typography>
        </Box>

        <Box sx={styles.actions}>
          <Tooltip title="Выше в списке" arrow>
            <span>
              <IconButton
                size="small"
                onClick={() => onMoveUp?.(nodeId, parentId)}
                disabled={!canMoveUp}
                sx={styles.moveButton}
              >
                <ArrowUpwardIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Ниже в списке" arrow>
            <span>
              <IconButton
                size="small"
                onClick={() => onMoveDown?.(nodeId, parentId)}
                disabled={!canMoveDown}
                sx={styles.moveButton}
              >
                <ArrowDownwardIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Редактировать" arrow>
            <IconButton
              size="small"
              onClick={() => onEdit(nodeId)}
              sx={styles.editButton}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Удалить" arrow>
            <IconButton
              size="small"
              onClick={() => onDelete(nodeId)}
              sx={styles.deleteButton}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {hasChildren && isExpanded && (
        <Box sx={styles.childrenContainer}>
          {isLoadingChildren ? (
            <Box sx={styles.loadingChildren}>
              <CircularProgress size={16} />
            </Box>
          ) : sortedChildren.length > 0 ? (
            sortedChildren.map((child, idx) => (
              <ServiceCategoryTreeNode
                key={child.id ?? child.serviceCategoryId}
                node={child}
                level={level + 1}
                expanded={expanded}
                onToggleExpand={onToggleExpand}
                onEdit={onEdit}
                onDelete={onDelete}
                parentId={nodeId}
                onMoveUp={onMoveUp}
                onMoveDown={onMoveDown}
                indexInSiblings={idx}
                siblingsCount={sortedChildren.length}
                isMovingOrder={isMovingOrder}
                globalIndex={undefined}
                totalInCategory={undefined}
                fetchChildren={fetchChildren}
                childrenCache={childrenCache}
                loadingChildren={loadingChildren}
                selectedCategories={selectedCategories}
                onSelect={onSelect}
              />
            ))
          ) : null}
        </Box>
      )}
    </Box>
  );
};
