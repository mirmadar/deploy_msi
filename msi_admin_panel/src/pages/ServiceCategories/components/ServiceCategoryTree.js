import React, { useMemo } from "react";
import { Box, CircularProgress, Typography, Checkbox } from "@mui/material";
import { ServiceCategoryTreeNode } from "./ServiceCategoryTreeNode";
import { styles } from "./styles/ServiceCategoryTree.styles";

export const ServiceCategoryTree = ({
  categoryTree,
  loading,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  isMovingOrder = false,
  onToggleExpand,
  expanded,
  fetchChildren,
  childrenCache,
  loadingChildren,
  selectedCategories = [],
  onSelect,
  onSelectAll,
  getAllCategoryIds,
  page = 0,
  rowsPerPage = 25,
  total = 0,
}) => {
  const allCategoryIds = useMemo(() => {
    const ids = categoryTree.map((c) => c.id ?? c.serviceCategoryId);
    Object.values(childrenCache).forEach((children) => {
      children.forEach((child) => {
        const id = child.id ?? child.serviceCategoryId;
        if (id != null && !ids.includes(id)) ids.push(id);
      });
    });
    return ids;
  }, [categoryTree, childrenCache]);

  if (loading && categoryTree.length === 0) {
    return (
      <Box sx={styles.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  if (categoryTree.length === 0) {
    return (
      <Box sx={styles.emptyContainer}>
        <Typography variant="body1" color="text.secondary">
          Категории услуг не найдены
        </Typography>
      </Box>
    );
  }

  const allSelected =
    allCategoryIds.length > 0 &&
    allCategoryIds.every((id) => selectedCategories.includes(id));
  const someSelected = allCategoryIds.some((id) =>
    selectedCategories.includes(id)
  );

  const handleSelectAll = (checked) => {
    if (onSelectAll && getAllCategoryIds) {
      onSelectAll(getAllCategoryIds(), checked);
    }
  };

  return (
    <Box sx={styles.treeContainer}>
      <Box sx={styles.selectAllRow}>
        <Checkbox
          checked={allSelected}
          indeterminate={someSelected && !allSelected}
          onChange={(e) => handleSelectAll(e.target.checked)}
          size="small"
          sx={styles.selectAllCheckbox}
        />
        <Typography variant="body2" sx={styles.selectAllText}>
          Выбрать все
        </Typography>
      </Box>

      {categoryTree.map((node, index) => (
        <ServiceCategoryTreeNode
          key={node.id ?? node.serviceCategoryId}
          node={node}
          level={0}
          parentId={null}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          indexInSiblings={index}
          siblingsCount={categoryTree.length}
          globalIndex={page * rowsPerPage + index}
          totalInCategory={total}
          isMovingOrder={isMovingOrder}
          expanded={expanded}
          onToggleExpand={onToggleExpand}
          onEdit={onEdit}
          onDelete={onDelete}
          fetchChildren={fetchChildren}
          childrenCache={childrenCache}
          loadingChildren={loadingChildren}
          selectedCategories={selectedCategories}
          onSelect={onSelect}
        />
      ))}
    </Box>
  );
};
