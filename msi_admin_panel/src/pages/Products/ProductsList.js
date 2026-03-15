import React, { useState } from "react";
import { Box, Paper, Alert, Dialog, Snackbar } from "@mui/material";
import { ProductsApi } from "../../api/products.api";
import { ProductEdit } from "./ProductEdit";
import { BulkUpdateModal } from "./BulkUpdateModal";
import { useProducts } from "./hooks/useProducts";
import { useProductSelection } from "./hooks/useProductSelection";
import { ProductPageHeader } from "./components/ProductPageHeader";
import { ProductSearchBar } from "./components/ProductSearchBar";
import { ProductBulkActions } from "./components/ProductBulkActions";
import { ProductTable } from "./components/ProductTable";
import { TablePagination } from "../../components/common/TablePagination";
import { ProductFiltersDrawer } from "./components/ProductFiltersDrawer";
import { DeleteConfirmDialog } from "../../components/common/DeleteConfirmDialog";
import { SelectByFiltersConfirmDialog } from "./components/SelectByFiltersConfirmDialog";
import { convertFiltersToBackendFormat } from "./utils/filterUtils";

import { styles } from "./styles/ProductsList.styles";

export const ProductsList = () => {
  const [editingProductId, setEditingProductId] = useState(null);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [filtersDrawerOpen, setFiltersDrawerOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  
  // Состояния для операций по фильтрам
  const [isSelectionByFilters, setIsSelectionByFilters] = useState(false);
  const [selectedByFiltersCount, setSelectedByFiltersCount] = useState(0);
  const [selectByFiltersDialogOpen, setSelectByFiltersDialogOpen] = useState(false);
  const [bulkUpdateByFiltersModalOpen, setBulkUpdateByFiltersModalOpen] = useState(false);
  const [bulkDeleteByFiltersDialogOpen, setBulkDeleteByFiltersDialogOpen] = useState(false);
  const [isProcessingByFilters, setIsProcessingByFilters] = useState(false);

  const {
    products,
    total,
    loading,
    error,
    page,
    rowsPerPage,
    search,
    filters,
    sortBy,
    sortOrder,
    setFilters,
    setSearch,
    handleSort,
    handlePageChange,
    handleRowsPerPageChange,
    refresh,
  } = useProducts();

  const {
    selectedProducts,
    expandedProductId,
    handleSelect,
    handleSelectAll,
    toggleExpand,
    clearSelection,
  } = useProductSelection();

  const handleDelete = (id) => {
    const product = products.find((p) => p.productId === id);
    if (product) {
      setProductToDelete({ id, name: product.name });
      setDeleteDialogOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    try {
      setIsDeleting(true);
      const res = await ProductsApi.remove(productToDelete.id);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      refresh();
      if (res?.data?.archived) {
        setDeleteError(
          "Товар участвовал в заказах и был помечен как «Архив». Он больше не отображается в публичном каталоге."
        );
        setSnackbarOpen(true);
      }
    } catch (err) {
      console.error(err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Ошибка при удалении товара";
      setDeleteError(message);
      setSnackbarOpen(true);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteDialogClose = () => {
    if (!isDeleting) {
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const handleBulkDelete = () => {
    if (!selectedProducts.length) return;
    setBulkDeleteDialogOpen(true);
  };

  const handleBulkDeleteConfirm = async () => {
    if (!selectedProducts.length) return;
    try {
      setIsDeleting(true);
      await ProductsApi.bulkDelete({
        productIds: selectedProducts,
      });
      clearSelection();
      setBulkDeleteDialogOpen(false);
      refresh();
    } catch (err) {
      console.error(err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Ошибка при удалении товаров";
      setDeleteError(message);
      setSnackbarOpen(true);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDeleteDialogClose = () => {
    if (!isDeleting) {
      setBulkDeleteDialogOpen(false);
    }
  };

  const handleSelectAllProducts = (checked) => {
    handleSelectAll(checked ? products.map((p) => p.productId) : [], checked);
  };

  const handleEditSuccess = () => {
    setEditingProductId(null);
    refresh();
  };

  const handleBulkSuccess = () => {
    clearSelection();
    refresh();
  };

  const handleFilterChange = ({ categoryIds, price, isNew, status, unit }) => {
    setFilters({ categoryIds: categoryIds ?? [], price, isNew, status, unit });
    // Сбрасываем выбор по фильтрам при изменении фильтров
    if (isSelectionByFilters) {
      setIsSelectionByFilters(false);
      setSelectedByFiltersCount(0);
    }
  };

  // Обработчик "Выбрать все по фильтрам"
  const handleSelectAllByFilters = async () => {
    try {
      const backendFilters = convertFiltersToBackendFormat(filters);
      const response = await ProductsApi.countByFilters(backendFilters);
      const count = response.data.count || 0;
      
      if (count === 0) {
        setDeleteError("По указанным фильтрам товары не найдены");
        setSnackbarOpen(true);
        return;
      }
      
      setSelectedByFiltersCount(count);
      setSelectByFiltersDialogOpen(true);
    } catch (err) {
      console.error(err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Ошибка при подсчете товаров";
      setDeleteError(message);
      setSnackbarOpen(true);
    }
  };

  // Подтверждение выбора по фильтрам
  const handleSelectByFiltersConfirm = () => {
    setIsSelectionByFilters(true);
    clearSelection(); // Очищаем обычный выбор
    setSelectByFiltersDialogOpen(false);
  };

  // Обработчик массового обновления по фильтрам
  const handleBulkUpdateByFilters = () => {
    if (!isSelectionByFilters) {
      setBulkModalOpen(true);
    } else {
      setBulkUpdateByFiltersModalOpen(true);
    }
  };

  // Обработчик массового удаления по фильтрам
  const handleBulkDeleteByFilters = () => {
    if (!isSelectionByFilters) {
      handleBulkDelete();
    } else {
      setBulkDeleteByFiltersDialogOpen(true);
    }
  };

  // Подтверждение массового удаления по фильтрам
  const handleBulkDeleteByFiltersConfirm = async () => {
    try {
      setIsProcessingByFilters(true);
      const backendFilters = convertFiltersToBackendFormat(filters);
      await ProductsApi.bulkDeleteByFilters({
        filters: backendFilters,
        confirmCount: selectedByFiltersCount,
      });
      setIsSelectionByFilters(false);
      setSelectedByFiltersCount(0);
      setBulkDeleteByFiltersDialogOpen(false);
      refresh();
      setDeleteError(
        `Успешно удалено товаров: ${selectedByFiltersCount.toLocaleString(
          "ru-RU"
        )}`
      );
      setSnackbarOpen(true);
    } catch (err) {
      console.error(err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Ошибка при удалении товаров";
      setDeleteError(message);
      setSnackbarOpen(true);
    } finally {
      setIsProcessingByFilters(false);
    }
  };

  // Сброс выбора по фильтрам
  const handleClearSelectionByFilters = () => {
    setIsSelectionByFilters(false);
    setSelectedByFiltersCount(0);
    clearSelection();
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    setDeleteError(null);
  };

  return (
    <Paper elevation={0} sx={styles.paper}>
      <ProductPageHeader total={total} />

      <ProductSearchBar
        search={search}
        onSearchChange={setSearch}
        onAddNew={() => setEditingProductId("new")}
        onFiltersClick={() => setFiltersDrawerOpen(true)}
        total={total}
        onSelectAllByFilters={handleSelectAllByFilters}
        hasActiveFilters={!!(filters.categoryIds?.length || filters.price || filters.isNew !== undefined || filters.status || filters.unit)}
      />

      <ProductBulkActions
        selectedCount={isSelectionByFilters ? selectedByFiltersCount : selectedProducts.length}
        isSelectionByFilters={isSelectionByFilters}
        onBulkUpdate={handleBulkUpdateByFilters}
        onDelete={handleBulkDeleteByFilters}
        onClearSelection={handleClearSelectionByFilters}
      />

      {error && (
        <Alert severity="error" sx={styles.errorAlert}>
          {error}
        </Alert>
      )}

      <Box sx={styles.tableContainer}>
        <ProductTable
          products={products}
          loading={loading}
          selectedProducts={selectedProducts}
          expandedProductId={expandedProductId}
          onSelectAll={handleSelectAllProducts}
          onSelect={handleSelect}
          onExpand={toggleExpand}
          onEdit={(id) => setEditingProductId(id)}
          onDelete={handleDelete}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
        />
      </Box>

      <TablePagination
        total={total}
        page={page}
        rowsPerPage={rowsPerPage}
        itemsCount={products.length}
        itemLabel="товар"
        itemLabelPlural="товаров"
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />

      <Dialog
        open={!!editingProductId}
        onClose={() => setEditingProductId(null)}
        maxWidth={false}
        fullWidth
        PaperProps={{
          sx: styles.dialogPaper,
        }}
      >
        <Box sx={styles.dialogContent}>
          <ProductEdit
            productId={editingProductId === "new" ? null : editingProductId}
            onClose={handleEditSuccess}
          />
        </Box>
      </Dialog>

      <BulkUpdateModal
        open={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        selectedProducts={selectedProducts}
        onSuccess={handleBulkSuccess}
        isSelectionByFilters={false}
        filters={null}
        confirmCount={null}
      />

      <BulkUpdateModal
        open={bulkUpdateByFiltersModalOpen}
        onClose={() => setBulkUpdateByFiltersModalOpen(false)}
        selectedProducts={[]}
        onSuccess={() => {
          setIsSelectionByFilters(false);
          setSelectedByFiltersCount(0);
          setBulkUpdateByFiltersModalOpen(false);
          refresh();
        }}
        isSelectionByFilters={true}
        filters={filters}
        confirmCount={selectedByFiltersCount}
      />

      <SelectByFiltersConfirmDialog
        open={selectByFiltersDialogOpen}
        onClose={() => setSelectByFiltersDialogOpen(false)}
        onConfirm={handleSelectByFiltersConfirm}
        count={selectedByFiltersCount}
        message="Найдено товаров по текущим фильтрам:"
        confirmButtonText="Выбрать"
        isProcessing={false}
      />

      <DeleteConfirmDialog
        open={bulkDeleteByFiltersDialogOpen}
        onClose={() => {
          if (!isProcessingByFilters) {
            setBulkDeleteByFiltersDialogOpen(false);
          }
        }}
        onConfirm={handleBulkDeleteByFiltersConfirm}
        itemName={`Будет удалено ${selectedByFiltersCount.toLocaleString("ru-RU")} товаров по фильтрам`}
        message="Вы уверены, что хотите удалить все товары по текущим фильтрам?"
        warningMessage="Если товар уже участвовал в заказах, он не будет удален. Он будет помечен как «Архив» и не будет отображаться в публичном каталоге."
        isDeleting={isProcessingByFilters}
      />

      <ProductFiltersDrawer
        open={filtersDrawerOpen}
        onClose={() => setFiltersDrawerOpen(false)}
        filters={filters}
        onFiltersChange={handleFilterChange}
      />

      <DeleteConfirmDialog
        open={bulkDeleteDialogOpen}
        onClose={handleBulkDeleteDialogClose}
        onConfirm={handleBulkDeleteConfirm}
        itemName={
          selectedProducts.length > 0
            ? products
                .filter((p) => selectedProducts.includes(p.productId))
                .map((p) => p.name)
                .join(", ")
            : ""
        }
        message="Вы уверены, что хотите удалить выбранные товары?"
        warningMessage="Если какой‑то товар уже участвовал в заказах, он не будет удален. Он будет помечен как «Архив» и не будет отображаться в публичном каталоге."
        isDeleting={isDeleting}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        onConfirm={handleDeleteConfirm}
        itemName={productToDelete?.name || ""}
        message="Вы уверены, что хотите удалить этот товар?"
        warningMessage="Если этот товар уже участвовал в заказах, он не будет удален. Он будет помечен как «Архив» и не будет отображаться в публичном каталоге."
        isDeleting={isDeleting}
      />

      <Snackbar
        open={snackbarOpen && !!deleteError}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={
            deleteError?.startsWith("Успешно удалено товаров") ? "success" : "error"
          }
          variant="filled"
          sx={{ width: "100%" }}
        >
          {deleteError}
        </Alert>
      </Snackbar>
    </Paper>
  );
};
