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
import { ServiceCategoriesApi } from "../../api/service-categories.api";
import { ServiceCategoryForm } from "./ServiceCategoryForm";
import { ServiceCategoryTree } from "./components/ServiceCategoryTree";
import { TablePagination } from "../../components/common/TablePagination";
import { DeleteConfirmDialog } from "../../components/common/DeleteConfirmDialog";
import { ServiceCategoryBulkActions } from "./components/ServiceCategoryBulkActions";
import { BulkServiceCategoryMoveModal } from "./components/BulkServiceCategoryMoveModal";
import { useServiceCategories } from "./hooks/useServiceCategories";
import { useServiceCategorySelection } from "./hooks/useServiceCategorySelection";
import { styles } from "./styles/ServiceCategoriesList.styles";

export const ServiceCategoriesList = () => {
  const [editingId, setEditingId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMovingOrder, setIsMovingOrder] = useState(false);
  const [bulkMoveModalOpen, setBulkMoveModalOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [expanded, setExpanded] = useState(new Set());

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
    refreshRootOnly,
    fetchChildren,
    refetchChildren,
    childrenCache,
    loadingChildren,
  } = useServiceCategories();

  const {
    selectedCategories,
    handleSelect,
    handleSelectAll,
    clearSelection,
  } = useServiceCategorySelection();

  const getCategoryId = (item) => item?.id ?? item?.serviceCategoryId;

  const findCategory = useCallback(
    (categoryId) => {
      const found = categories.find(
        (c) => getCategoryId(c) === categoryId
      );
      if (found) return found;
      for (const parentId in childrenCache) {
        const inChildren = childrenCache[parentId].find(
          (c) => getCategoryId(c) === categoryId
        );
        if (inChildren) return inChildren;
      }
      return null;
    },
    [categories, childrenCache]
  );

  const getAllCategoryIds = useCallback(() => {
    const ids = categories.map(getCategoryId).filter(Boolean);
    Object.values(childrenCache).forEach((children) => {
      children.forEach((child) => {
        const id = getCategoryId(child);
        if (id != null && !ids.includes(id)) ids.push(id);
      });
    });
    return ids;
  }, [categories, childrenCache]);

  const toggleExpand = (categoryId) => {
    const next = new Set(expanded);
    if (next.has(categoryId)) {
      next.delete(categoryId);
    } else {
      next.add(categoryId);
      fetchChildren?.(categoryId);
    }
    setExpanded(next);
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
        name: category.name ?? "эта категория услуг",
      });
      setDeleteDialogOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    const category = findCategory(categoryToDelete.id);
    if (!category) {
      setDeleteError("Категория услуг не найдена");
      setSnackbarOpen(true);
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
      return;
    }

    const hasChildren = category.hasChildren === true;
    const hasChildrenInCache =
      (childrenCache[categoryToDelete.id]?.length ?? 0) > 0;

    if (hasChildren || hasChildrenInCache) {
      setDeleteError(
        `Невозможно удалить «${categoryToDelete.name}»: у категории услуг есть подкатегории. Сначала удалите все подкатегории.`
      );
      setSnackbarOpen(true);
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
      return;
    }

    setIsDeleting(true);
    try {
      await ServiceCategoriesApi.remove(categoryToDelete.id);
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
      clearSelection();
      refresh();
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "Ошибка при удалении категории услуг";
      setDeleteError(msg);
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

  const handleMoveUp = useCallback(
    async (categoryId, parentId) => {
      setIsMovingOrder(true);
      try {
        await ServiceCategoriesApi.move(categoryId, { direction: "up" });
        refreshRootOnly();
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
    [refreshRootOnly, refetchChildren]
  );

  const handleMoveDown = useCallback(
    async (categoryId, parentId) => {
      setIsMovingOrder(true);
      try {
        await ServiceCategoriesApi.move(categoryId, { direction: "down" });
        refreshRootOnly();
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
    [refreshRootOnly, refetchChildren]
  );

  const handleBulkMoveSuccess = () => {
    clearSelection();
    refresh();
    setBulkMoveModalOpen(false);
  };

  const handleBulkDeleteConfirm = async () => {
    if (selectedCategories.length === 0) return;
    setIsBulkDeleting(true);
    try {
      await ServiceCategoriesApi.bulkRemove({
        serviceCategoryIds: selectedCategories,
      });
      setBulkDeleteDialogOpen(false);
      clearSelection();
      refresh();
    } catch (err) {
      console.error(err);
      setDeleteError(
        err?.response?.data?.message ??
          err?.message ??
          "Ошибка при массовом удалении категорий услуг"
      );
      setSnackbarOpen(true);
      setBulkDeleteDialogOpen(false);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleBulkDeleteDialogClose = () => {
    if (!isBulkDeleting) setBulkDeleteDialogOpen(false);
  };

  return (
    <Paper elevation={0} sx={styles.paper}>
      <Box sx={styles.headerContainer}>
        <Box sx={styles.header}>
          <Typography variant="h5" sx={styles.title}>
            Категории услуг
          </Typography>
          {total > 0 && <Chip label={total} size="small" sx={styles.chip} />}
        </Box>
      </Box>

      <Box sx={styles.actionsContainer}>
        <Box sx={styles.actionsLeft} />
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          sx={styles.addButton}
        >
          Создать категорию услуг
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={styles.errorAlert}>
          {error}
        </Alert>
      )}

      <ServiceCategoryBulkActions
        selectedCount={selectedCategories.length}
        onMove={() => setBulkMoveModalOpen(true)}
        onDelete={() => setBulkDeleteDialogOpen(true)}
      />

      {loading ? (
        <Box sx={styles.loadingBox}>
          <Typography>Загрузка...</Typography>
        </Box>
      ) : categories.length === 0 ? (
        <Box sx={styles.emptyBox}>
          <Typography color="text.secondary">
            Категории услуг не созданы
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={styles.treeContainer}>
            <ServiceCategoryTree
              categoryTree={categories}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              isMovingOrder={isMovingOrder}
              onToggleExpand={toggleExpand}
              expanded={expanded}
              fetchChildren={fetchChildren}
              childrenCache={childrenCache}
              loadingChildren={loadingChildren}
              selectedCategories={selectedCategories}
              onSelect={handleSelect}
              onSelectAll={handleSelectAll}
              getAllCategoryIds={getAllCategoryIds}
              page={page}
              rowsPerPage={rowsPerPage}
              total={total}
            />
          </Box>
          <TablePagination
            total={total}
            page={page}
            rowsPerPage={rowsPerPage}
            itemsCount={categories.length}
            itemLabel="категория услуг"
            itemLabelPlural="категорий услуг"
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
        PaperProps={{ sx: styles.dialogPaper }}
      >
        <Box sx={styles.dialogContent}>
          <ServiceCategoryForm
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
        itemName={categoryToDelete?.name ?? ""}
        message="Вы уверены, что хотите удалить категорию услуг?"
        warningMessage="Нельзя удалить категорию, у которой есть подкатегории или в которой есть услуги. Сначала перенесите или удалите их."
        isDeleting={isDeleting}
      />

      <DeleteConfirmDialog
        open={bulkDeleteDialogOpen}
        onClose={handleBulkDeleteDialogClose}
        onConfirm={handleBulkDeleteConfirm}
        itemName={`${selectedCategories.length} категорий услуг`}
        message="Удалить выбранные категории услуг?"
        warningMessage="Удаляются только категории без подкатегорий и без услуг. Если у любой выбранной есть подкатегории или услуги, запрос будет отклонён с перечислением таких категорий и причин."
        isDeleting={isBulkDeleting}
      />

      <BulkServiceCategoryMoveModal
        open={bulkMoveModalOpen}
        onClose={() => setBulkMoveModalOpen(false)}
        selectedCategories={selectedCategories}
        onSuccess={handleBulkMoveSuccess}
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
