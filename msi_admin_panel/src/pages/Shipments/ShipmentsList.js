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
import { ShipmentsApi } from "../../api/shipments.api";
import { ShipmentForm } from "./ShipmentForm";
import { ShipmentTable } from "./components/ShipmentTable";
import { ShipmentBulkActions } from "./components/ShipmentBulkActions";
import { TablePagination } from "../../components/common/TablePagination";
import { DeleteConfirmDialog } from "../../components/common/DeleteConfirmDialog";
import { useShipments } from "./hooks/useShipments";
import { useShipmentSelection } from "./hooks/useShipmentSelection";
import { styles } from "./styles/ShipmentsList.styles";

export const ShipmentsList = () => {
  const [editingId, setEditingId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shipmentToDelete, setShipmentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [bulkActionError, setBulkActionError] = useState(null);
  const [bulkActionSnackbarOpen, setBulkActionSnackbarOpen] = useState(false);
  const [isBulkActioning, setIsBulkActioning] = useState(false);
  const [publishError, setPublishError] = useState(null);
  const [publishSnackbarOpen, setPublishSnackbarOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [unpublishError, setUnpublishError] = useState(null);
  const [unpublishSnackbarOpen, setUnpublishSnackbarOpen] = useState(false);
  const [isUnpublishing, setIsUnpublishing] = useState(false);
  const [isMovingOrder, setIsMovingOrder] = useState(false);

  const {
    shipments,
    total,
    loading,
    error,
    page,
    rowsPerPage,
    handlePageChange,
    handleRowsPerPageChange,
    refresh,
  } = useShipments();

  const {
    selectedShipments,
    handleSelect,
    handleSelectAll,
    clearSelection,
  } = useShipmentSelection();

  const handleCreate = () => {
    setEditingId(null);
    setFormOpen(true);
  };

  const handleEdit = (id) => {
    setEditingId(id);
    setFormOpen(true);
  };

  const handleDeleteClick = (id) => {
    const shipment = shipments.find((s) => s.shipmentPostId === id);
    if (shipment) {
      setShipmentToDelete({
        id,
        name: shipment.title || "этот пост отгрузки",
      });
      setDeleteDialogOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!shipmentToDelete) return;

    setIsDeleting(true);
    try {
      await ShipmentsApi.remove(shipmentToDelete.id);
      setDeleteDialogOpen(false);
      setShipmentToDelete(null);
      refresh();
    } catch (err) {
      console.error(err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Ошибка при удалении поста отгрузки";

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
      setShipmentToDelete(null);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    setDeleteError(null);
  };

  const handlePublish = async (id) => {
    setIsPublishing(true);
    try {
      await ShipmentsApi.publish(id);
      setPublishError(null);
      setPublishSnackbarOpen(true);
      refresh();
    } catch (err) {
      console.error(err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Ошибка при публикации поста отгрузки";
      setPublishError(errorMessage);
      setPublishSnackbarOpen(true);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleClosePublishSnackbar = () => {
    setPublishSnackbarOpen(false);
    setPublishError(null);
  };

  const handleUnpublish = async (id) => {
    setIsUnpublishing(true);
    try {
      await ShipmentsApi.unpublish(id);
      setUnpublishError(null);
      setUnpublishSnackbarOpen(true);
      refresh();
    } catch (err) {
      console.error(err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Ошибка при снятии поста с публикации";
      setUnpublishError(errorMessage);
      setUnpublishSnackbarOpen(true);
    } finally {
      setIsUnpublishing(false);
    }
  };

  const handleCloseUnpublishSnackbar = () => {
    setUnpublishSnackbarOpen(false);
    setUnpublishError(null);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingId(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    refresh();
  };

  const handleBulkDelete = () => {
    if (!selectedShipments.length) return;
    setBulkDeleteDialogOpen(true);
  };

  const handleBulkDeleteConfirm = async () => {
    if (!selectedShipments.length) return;

    setIsBulkActioning(true);
    try {
      await ShipmentsApi.bulkDelete({ shipmentPostIds: selectedShipments });
      setBulkDeleteDialogOpen(false);
      clearSelection();
      refresh();
      setBulkActionError(null);
      setBulkActionSnackbarOpen(true);
    } catch (err) {
      console.error(err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Ошибка при массовом удалении постов с отгрузками";
      setBulkActionError(errorMessage);
      setBulkActionSnackbarOpen(true);
      setBulkDeleteDialogOpen(false);
    } finally {
      setIsBulkActioning(false);
    }
  };

  const handleBulkDeleteDialogClose = () => {
    if (!isBulkActioning) {
      setBulkDeleteDialogOpen(false);
    }
  };

  const handleCloseBulkActionSnackbar = () => {
    setBulkActionSnackbarOpen(false);
    setBulkActionError(null);
  };

  const handleMoveUp = useCallback(
    async (shipmentPostId) => {
      setIsMovingOrder(true);
      try {
        await ShipmentsApi.move(shipmentPostId, { direction: "up" });
        refresh();
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
    [refresh]
  );

  const handleMoveDown = useCallback(
    async (shipmentPostId) => {
      setIsMovingOrder(true);
      try {
        await ShipmentsApi.move(shipmentPostId, { direction: "down" });
        refresh();
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
    [refresh]
  );

  const handleBulkPublish = async () => {
    if (!selectedShipments.length) return;
    setIsBulkActioning(true);
    try {
      await ShipmentsApi.bulkPublish({ shipmentPostIds: selectedShipments });
      clearSelection();
      refresh();
      setBulkActionError(null);
      setBulkActionSnackbarOpen(true);
    } catch (err) {
      console.error(err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Ошибка при массовой публикации постов отгрузок";
      setBulkActionError(errorMessage);
      setBulkActionSnackbarOpen(true);
    } finally {
      setIsBulkActioning(false);
    }
  };

  const handleBulkUnpublish = async () => {
    if (!selectedShipments.length) return;
    setIsBulkActioning(true);
    try {
      await ShipmentsApi.bulkUnpublish({ shipmentPostIds: selectedShipments });
      clearSelection();
      refresh();
      setBulkActionError(null);
      setBulkActionSnackbarOpen(true);
    } catch (err) {
      console.error(err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Ошибка при массовом снятии постов с публикации";
      setBulkActionError(errorMessage);
      setBulkActionSnackbarOpen(true);
    } finally {
      setIsBulkActioning(false);
    }
  };

  return (
    <Paper elevation={0} sx={styles.paper}>
      <Box sx={styles.headerContainer}>
        <Box sx={styles.header}>
          <Typography variant="h5" sx={styles.title}>
            Отгрузки
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
          Создать пост
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={styles.errorAlert}>
          {error}
        </Alert>
      )}

      <ShipmentBulkActions
        selectedCount={selectedShipments.length}
        onBulkDelete={handleBulkDelete}
        onBulkPublish={handleBulkPublish}
        onBulkUnpublish={handleBulkUnpublish}
      />

      {loading ? (
        <Box sx={styles.loadingBox}>
          <Typography>Загрузка...</Typography>
        </Box>
      ) : shipments.length === 0 ? (
        <Box sx={styles.emptyBox}>
          <Typography color="text.secondary">
            Посты с отгрузками не созданы
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={styles.tableContainer}>
            <ShipmentTable
              shipments={shipments}
              loading={loading}
              page={page}
              rowsPerPage={rowsPerPage}
              totalShipments={total}
              selectedShipments={selectedShipments}
              onSelect={handleSelect}
              onSelectAll={handleSelectAll}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onPublish={handlePublish}
              onUnpublish={handleUnpublish}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              isMovingOrder={isMovingOrder}
            />
          </Box>
          <TablePagination
            total={total}
            page={page}
            rowsPerPage={rowsPerPage}
            itemsCount={shipments.length}
            itemLabel="пост отгрузки"
            itemLabelPlural="постов отгрузок"
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
          <ShipmentForm
            key={editingId || 'create'}
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
        itemName={shipmentToDelete?.name || ""}
        message="Вы уверены, что хотите удалить пост отгрузки?"
        warningMessage="Это действие нельзя отменить."
        isDeleting={isDeleting}
      />

      <DeleteConfirmDialog
        open={bulkDeleteDialogOpen}
        onClose={handleBulkDeleteDialogClose}
        onConfirm={handleBulkDeleteConfirm}
        itemName={
          selectedShipments.length > 0
            ? `${selectedShipments.length} постов отгрузок`
            : ""
        }
        message="Вы уверены, что хотите удалить выбранные посты с отгрузками?"
        warningMessage="Это действие нельзя отменить. Все выбранные посты с отгрузками будут безвозвратно удалены."
        isDeleting={isBulkActioning}
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

      <Snackbar
        open={bulkActionSnackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseBulkActionSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseBulkActionSnackbar}
          severity={bulkActionError ? "error" : "success"}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {bulkActionError || "Успешно"}
        </Alert>
      </Snackbar>

      <Snackbar
        open={publishSnackbarOpen}
        autoHideDuration={6000}
        onClose={handleClosePublishSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleClosePublishSnackbar}
          severity={publishError ? "error" : "success"}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {publishError || "Пост отгрузки успешно опубликован"}
        </Alert>
      </Snackbar>

      <Snackbar
        open={unpublishSnackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseUnpublishSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseUnpublishSnackbar}
          severity={unpublishError ? "error" : "success"}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {unpublishError || "Пост отгрузки успешно снят с публикации"}
        </Alert>
      </Snackbar>
    </Paper>
  );
};







