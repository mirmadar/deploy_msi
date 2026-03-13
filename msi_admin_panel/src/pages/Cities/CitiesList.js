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
import { CitiesApi } from "../../api/cities.api";
import { CityForm } from "./CityForm";
import { CityTable } from "./components/CityTable";
import { TablePagination } from "../../components/common/TablePagination";
import { DeleteConfirmDialog } from "../../components/common/DeleteConfirmDialog";
import { useCities } from "./hooks/useCities";
import { styles } from "./styles/CitiesList.styles";

export const CitiesList = () => {
  const [editingId, setEditingId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cityToDelete, setCityToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMovingOrder, setIsMovingOrder] = useState(false);

  const {
    cities,
    total,
    loading,
    error,
    page,
    rowsPerPage,
    sortOrder,
    handlePageChange,
    handleRowsPerPageChange,
    handleSortOrderChange,
    refresh,
  } = useCities();

  const handleCreate = () => {
    setEditingId(null);
    setFormOpen(true);
  };

  const handleEdit = (id) => {
    setEditingId(id);
    setFormOpen(true);
  };

  const handleDeleteClick = (id) => {
    const city = cities.find((c) => c.cityId === id);
    if (city) {
      setCityToDelete({
        id,
        name: city.name || "этот город",
      });
      setDeleteDialogOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!cityToDelete) return;

    setIsDeleting(true);
    try {
      await CitiesApi.remove(cityToDelete.id);
      setDeleteDialogOpen(false);
      setCityToDelete(null);
      refresh();
    } catch (err) {
      console.error(err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Ошибка при удалении города";

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
      setCityToDelete(null);
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
    refresh();
  };

  const handleMoveUp = useCallback(
    async (cityId) => {
      setIsMovingOrder(true);
      try {
        await CitiesApi.move(cityId, { direction: "up" });
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
    async (cityId) => {
      setIsMovingOrder(true);
      try {
        await CitiesApi.move(cityId, { direction: "down" });
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

  return (
    <Paper elevation={0} sx={styles.paper}>
      <Box sx={styles.headerContainer}>
        <Box sx={styles.header}>
          <Typography variant="h5" sx={styles.title}>
            Города
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
          Добавить город
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={styles.errorAlert}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={styles.loadingBox}>
          <Typography>Загрузка...</Typography>
        </Box>
      ) : cities.length === 0 ? (
        <Box sx={styles.emptyBox}>
          <Typography color="text.secondary">
            Города не созданы
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={styles.tableContainer}>
            <CityTable
              cities={cities}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              sortOrder={sortOrder}
              onSort={handleSortOrderChange}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              isMovingOrder={isMovingOrder}
            />
          </Box>
          <TablePagination
            total={total}
            page={page}
            rowsPerPage={rowsPerPage}
            itemsCount={cities.length}
            itemLabel="город"
            itemLabelPlural="городов"
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
          <CityForm
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
        itemName={cityToDelete?.name || ""}
        message="Вы уверены, что хотите удалить город?"
        warningMessage="Это действие нельзя отменить."
        isDeleting={isDeleting}
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

