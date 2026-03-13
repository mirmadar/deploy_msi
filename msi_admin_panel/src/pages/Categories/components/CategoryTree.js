import React, { useState, useMemo } from "react";
import { Box, CircularProgress, Typography, Checkbox } from "@mui/material";
import { CategoryTreeNode } from "./CategoryTreeNode";
import { styles } from "./styles/CategoryTree.styles";

export const CategoryTree = ({
  categoryTree,
  loading,
  onEdit,
  onDelete,
  onManageFilters,
  onToggleExpand,
  expanded,
  fetchChildren,
  childrenCache,
  loadingChildren,
  selectedCategories = [],
  onSelect,
  onSelectAll,
  getAllCategoryIds,
  onMoveUp,
  onMoveDown,
  isMovingOrder,
}) => {
  // Получаем все ID категорий (включая дочерние из кэша)
  // Хуки должны вызываться до любых условных возвратов
  const allCategoryIds = useMemo(() => {
    const ids = categoryTree.map((c) => c.categoryId);
    // Добавляем дочерние категории из кэша
    Object.values(childrenCache).forEach((children) => {
      children.forEach((child) => {
        if (!ids.includes(child.categoryId)) {
          ids.push(child.categoryId);
        }
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
          Категории товаров не найдены
        </Typography>
      </Box>
    );
  }

  const allSelected = allCategoryIds.length > 0 && 
    allCategoryIds.every((id) => selectedCategories.includes(id));
  const someSelected = allCategoryIds.some((id) => selectedCategories.includes(id));

  const handleSelectAll = (checked) => {
    if (onSelectAll && getAllCategoryIds) {
      const allIds = getAllCategoryIds();
      onSelectAll(allIds, checked);
    }
  };

  return (
    <Box sx={styles.treeContainer}>
      {/* Чекбокс для выбора всех */}
      {categoryTree.length > 0 && (
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
      )}
      
      {categoryTree.map((node, index) => (
        <CategoryTreeNode
          key={node.categoryId}
          node={node}
          level={0}
          parentId={null}
          indexInSiblings={index}
          siblingsCount={categoryTree.length}
          expanded={expanded}
          onToggleExpand={onToggleExpand}
          onEdit={onEdit}
          onDelete={onDelete}
          onManageFilters={onManageFilters}
          fetchChildren={fetchChildren}
          childrenCache={childrenCache}
          loadingChildren={loadingChildren}
          selectedCategories={selectedCategories}
          onSelect={onSelect}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          isMovingOrder={isMovingOrder}
        />
      ))}
    </Box>
  );
};

