import React, { useState, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  Dialog,
  Chip,
  Snackbar,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { CategoriesApi } from "../../api/categories.api";
import { CategoryForm } from "./CategoryForm";
import { CategoryTree } from "./components/CategoryTree";
import { TablePagination } from "../../components/common/TablePagination";
import { DeleteConfirmDialog } from "../../components/common/DeleteConfirmDialog";
import { CategoryBulkActions } from "./components/CategoryBulkActions";
import { BulkCategoryMoveModal } from "./components/BulkCategoryMoveModal";
import { BulkCategoryImageUrlModal } from "./components/BulkCategoryImageUrlModal";
import { CategoryFiltersModal } from "./components/CategoryFiltersModal";
import { useCategories } from "./hooks/useCategories";
import { useCategorySelection } from "./hooks/useCategorySelection";
import { styles } from "./styles/CategoriesList.styles";

export const CategoriesList = () => {
  const [editingId, setEditingId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expanded, setExpanded] = useState(new Set());
  const [bulkMoveModalOpen, setBulkMoveModalOpen] = useState(false);
  const [bulkImageUrlModalOpen, setBulkImageUrlModalOpen] = useState(false);
  const [filtersModalOpen, setFiltersModalOpen] = useState(false);
  const [selectedCategoryForFilters, setSelectedCategoryForFilters] = useState(null);
  const [isMovingOrder, setIsMovingOrder] = useState(false);

  const {
    categories,
    total,
    loading,
    error,
    page,
    rowsPerPage,
    handlePageChange,
    handleRowsPerPageChange,
    refresh,
    fetchChildren,
    refetchChildren,
    childrenCache,
    loadingChildren,
  } = useCategories();

  const {
    selectedCategories,
    handleSelect,
    handleSelectAll,
    clearSelection,
  } = useCategorySelection();

  // Функция для поиска категории (включая дочерние из кэша)
  const findCategory = (categoryId) => {
    // Ищем в корневых категориях
    const found = categories.find((c) => c.categoryId === categoryId);
    if (found) return found;

    // Ищем в кэше дочерних категорий
    for (const parentId in childrenCache) {
      const foundInChildren = childrenCache[parentId].find(
        (c) => c.categoryId === categoryId
      );
      if (foundInChildren) return foundInChildren;
    }

    return null;
  };

  // Получаем все ID категорий (включая дочерние из кэша)
  const getAllCategoryIds = useCallback(() => {
    const ids = categories.map((c) => c.categoryId);
    // Добавляем дочерние категории из кэша
    Object.values(childrenCache).forEach((children) => {
      children.forEach((child) => {
        if (!ids.includes(child.categoryId)) {
          ids.push(child.categoryId);
        }
      });
    });
    return ids;
  }, [categories, childrenCache]);

  const toggleExpand = (categoryId) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(categoryId)) {
      // Сворачиваем
      newExpanded.delete(categoryId);
    } else {
      // Раскрываем - загружаем дочерние категории ТОЛЬКО при раскрытии
      newExpanded.add(categoryId);
      if (fetchChildren) {
        fetchChildren(categoryId);
      }
    }
    setExpanded(newExpanded);
  };

  const handleCreate = () => {
    setEditingId(null);
    setFormOpen(true);
  };

  const handleEdit = (id) => {
    setEditingId(id);
    setFormOpen(true);
  };

  const handleDeleteClick = (id) => {
    const category = findCategory(id);
    if (category) {
      setCategoryToDelete({
        id,
        name: category.name || "эта категория товаров",
      });
      setDeleteDialogOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    // Проверяем категорию перед удалением
    const category = findCategory(categoryToDelete.id);
    if (!category) {
      setDeleteError("Категория товаров не найдена");
      setSnackbarOpen(true);
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
      return;
    }

    // Проверяем наличие дочерних категорий
    // Используем строгую проверку: если hasChildren === true, то нельзя удалять
    const hasChildren = category.hasChildren === true;
    // Также проверяем кэш на случай, если дочерние загружены, но hasChildren еще не обновлен
    const hasChildrenInCache = childrenCache[categoryToDelete.id]?.length > 0;
    
    // Проверяем наличие товаров
    const hasProducts = category.hasProducts === true;

    // Блокируем удаление, если есть дочерние категории или товары
    if (hasChildren || hasChildrenInCache || hasProducts) {
      const reasons = [];
      if (hasChildren || hasChildrenInCache) {
        reasons.push("имеет дочерние категории товаров");
      }
      if (hasProducts) {
        reasons.push("содержит товары");
      }
      setDeleteError(
        `Невозможно удалить "${categoryToDelete.name}": ${reasons.join(" и ")}. Сначала удалите все дочерние категории товаров и переместите товары в другую категорию.`
      );
      setSnackbarOpen(true);
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
      return;
    }

    setIsDeleting(true);
    try {
      await CategoriesApi.remove(categoryToDelete.id);
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
      refresh();
    } catch (err) {
      console.error(err);
      // Проверяем, является ли ошибка ошибкой внешнего ключа
      const isForeignKeyError =
        err?.response?.status === 400 ||
        err?.code === "P2003" ||
        err?.response?.data?.code === "P2003" ||
        err?.response?.data?.message?.includes("Foreign key") ||
        err?.response?.data?.message?.includes("используется") ||
        err?.response?.data?.message?.includes("дочерние") ||
        err?.response?.data?.message?.includes("товары");

      const errorMessage = isForeignKeyError
        ? `Невозможно удалить "${categoryToDelete.name}": она используется в товарах или имеет дочерние категории товаров. Сначала удалите все дочерние категории и переместите товары в другую категорию.`
        : err?.response?.data?.message ||
          err?.message ||
          "Ошибка при удалении категории товаров";

      setDeleteError(errorMessage);
      setSnackbarOpen(true);
      setDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteDialogClose = () => {
    if (!isDeleting) {
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    setDeleteError(null);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingId(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    clearSelection();
    refresh();
  };

  const handleBulkMoveSuccess = () => {
    const expandedIds = Array.from(expanded);
    clearSelection();
    refresh().then(() => {
      expandedIds.forEach((id) => refetchChildren(id));
    });
  };

  const handleBulkImageUrlSuccess = () => {
    const expandedIds = Array.from(expanded);
    clearSelection();
    refresh().then(() => {
      expandedIds.forEach((id) => refetchChildren(id));
    });
  };

  const handleManageFilters = (categoryId, categoryName) => {
    setSelectedCategoryForFilters({ id: categoryId, name: categoryName });
    setFiltersModalOpen(true);
  };

  const handleFiltersModalClose = () => {
    setFiltersModalOpen(false);
    setSelectedCategoryForFilters(null);
  };

  const handleMoveUp = useCallback(
    async (categoryId, parentId) => {
      setIsMovingOrder(true);
      try {
        await CategoriesApi.move(categoryId, { direction: "up" });
        refresh();
        if (parentId != null) refetchChildren(parentId);
      } catch (err) {
        console.error(err);
        setDeleteError(
          err?.response?.data?.message ??
            err?.message ??
            "Не удалось изменить порядок"
        );
        setSnackbarOpen(true);
      } finally {
        setIsMovingOrder(false);
      }
    },
    [refresh, refetchChildren]
  );

  const handleMoveDown = useCallback(
    async (categoryId, parentId) => {
      setIsMovingOrder(true);
      try {
        await CategoriesApi.move(categoryId, { direction: "down" });
        refresh();
        if (parentId != null) refetchChildren(parentId);
      } catch (err) {
        console.error(err);
        setDeleteError(
          err?.response?.data?.message ??
            err?.message ??
            "Не удалось изменить порядок"
        );
        setSnackbarOpen(true);
      } finally {
        setIsMovingOrder(false);
      }
    },
    [refresh, refetchChildren]
  );

  return (
    <Paper elevation={0} sx={styles.paper}>
      <Box sx={styles.headerContainer}>
        <Box sx={styles.header}>
          <Typography variant="h5" sx={styles.title}>
            Категории товаров
          </Typography>
          {total > 0 && (
            <Chip
              label={total}
              size="small"
              sx={styles.chip}
            />
          )}
        </Box>
      </Box>

      <Box sx={styles.actionsContainer}>
        <Box sx={styles.actionsLeft}></Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          sx={styles.addButton}
        >
          Создать категорию товаров
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={styles.errorAlert}>
          {error}
        </Alert>
      )}

      <CategoryBulkActions
        selectedCount={selectedCategories.length}
        onMoveCategories={() => setBulkMoveModalOpen(true)}
        onSetImageUrl={() => setBulkImageUrlModalOpen(true)}
      />

      {loading ? (
        <Box sx={styles.loadingBox}>
          <Typography>Загрузка...</Typography>
        </Box>
      ) : categories.length === 0 ? (
        <Box sx={styles.emptyBox}>
          <Typography color="text.secondary">
            Категории товаров не созданы
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={styles.treeContainer}>
            <CategoryTree
              categoryTree={categories}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onManageFilters={handleManageFilters}
              onToggleExpand={toggleExpand}
              expanded={expanded}
              fetchChildren={fetchChildren}
              childrenCache={childrenCache}
              loadingChildren={loadingChildren}
              selectedCategories={selectedCategories}
              onSelect={handleSelect}
              onSelectAll={handleSelectAll}
              getAllCategoryIds={getAllCategoryIds}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              isMovingOrder={isMovingOrder}
            />
          </Box>
          <TablePagination
            total={total}
            page={page}
            rowsPerPage={rowsPerPage}
            itemsCount={categories.length}
            itemLabel="категория товаров"
            itemLabelPlural="категорий товаров"
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </>
      )}

      <Dialog
        open={formOpen}
        onClose={handleFormClose}
        maxWidth={false}
        fullWidth
        PaperProps={{
          sx: styles.dialogPaper,
        }}
      >
        <Box sx={styles.dialogContent}>
          <CategoryForm
            id={editingId}
            onClose={handleFormClose}
            onSuccess={handleFormSuccess}
          />
        </Box>
      </Dialog>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        onConfirm={handleDeleteConfirm}
        itemName={categoryToDelete?.name || ""}
        message="Вы уверены, что хотите удалить категорию товаров?"
        warningMessage="Если у категории есть вложенные категории или активные (неархивные) товары, удалить её нельзя. Сначала удалите или переместите дочерние категории и переведите товары в архив или в другую категорию."
        isDeleting={isDeleting}
      />

      <BulkCategoryMoveModal
        open={bulkMoveModalOpen}
        onClose={() => setBulkMoveModalOpen(false)}
        selectedCategories={selectedCategories}
        onSuccess={handleBulkMoveSuccess}
      />

      <BulkCategoryImageUrlModal
        open={bulkImageUrlModalOpen}
        onClose={() => setBulkImageUrlModalOpen(false)}
        selectedCategories={selectedCategories}
        onSuccess={handleBulkImageUrlSuccess}
      />

      <CategoryFiltersModal
        open={filtersModalOpen}
        onClose={handleFiltersModalClose}
        categoryId={selectedCategoryForFilters?.id}
        categoryName={selectedCategoryForFilters?.name}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {deleteError}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

