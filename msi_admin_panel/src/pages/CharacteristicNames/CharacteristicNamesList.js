import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  Dialog,
  Chip,
  Snackbar,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { CharacteristicNamesApi } from "../../api/characteristic-names.api";
import { CharacteristicNameForm } from "./CharacteristicNameForm";
import { CharacteristicTable } from "./components/CharacteristicTable";
import { TablePagination } from "../../components/common/TablePagination";
import { DeleteConfirmDialog } from "../../components/common/DeleteConfirmDialog";
import { useCharacteristicNames } from "./hooks/useCharacteristicNames";
import { styles } from "./styles/CharacteristicNamesList.styles";

export const CharacteristicNamesList = () => {
  const [editingId, setEditingId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [characteristicToDelete, setCharacteristicToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    characteristicNames,
    total,
    loading,
    error,
    page,
    rowsPerPage,
    search,
    sortOrder,
    setSearch,
    handleSortOrderChange,
    handlePageChange,
    handleRowsPerPageChange,
    refresh,
  } = useCharacteristicNames();

  // Локальное состояние для поиска с debounce
  const [localSearch, setLocalSearch] = useState(search);

  // Синхронизируем локальное состояние с внешним
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  // Обновляем родительское состояние через debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== search) {
        setSearch(localSearch);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [localSearch, search, setSearch]);

  const handleCreate = () => {
    setEditingId(null);
    setFormOpen(true);
  };

  const handleEdit = (id) => {
    setEditingId(id);
    setFormOpen(true);
  };

  const handleDeleteClick = (id) => {
    const characteristic = characteristicNames.find(
      (c) => (c.characteristicNameId || c.id || c.name) === id
    );
    if (characteristic) {
      setCharacteristicToDelete({
        id,
        name: characteristic.name || "эта характеристика",
      });
      setDeleteDialogOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!characteristicToDelete) return;

    setIsDeleting(true);
    try {
      await CharacteristicNamesApi.remove(characteristicToDelete.id);
      setDeleteDialogOpen(false);
      setCharacteristicToDelete(null);
      refresh();
    } catch (err) {
      console.error(err);
      // Проверяем, является ли ошибка ошибкой внешнего ключа
      const isForeignKeyError =
        err?.response?.status === 400 ||
        err?.code === "P2003" ||
        err?.response?.data?.code === "P2003" ||
        err?.response?.data?.message?.includes("Foreign key") ||
        err?.response?.data?.message?.includes("используется");

      const errorMessage = isForeignKeyError
        ? `Невозможно удалить "${characteristicToDelete.name}": она используется в товарах. Сначала удалите эту характеристику у всех товаров.`
        : err?.response?.data?.message ||
          err?.message ||
          "Ошибка при удалении характеристики";

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
      setCharacteristicToDelete(null);
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

  return (
    <Paper elevation={0} sx={styles.paper}>
      <Box sx={styles.headerContainer}>
        <Box sx={styles.header}>
          <Typography variant="h5" sx={styles.title}>
            Характеристики
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
        <Box sx={styles.searchContainer}>
          <TextField
            placeholder="Поиск характеристик..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            size="small"
            sx={styles.searchField}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={styles.searchIcon} />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          sx={styles.addButton}
        >
          Создать характеристику
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
      ) : characteristicNames.length === 0 ? (
        <Box sx={styles.emptyBox}>
          <Typography color="text.secondary">
            Характеристики не созданы
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={styles.tableContainer}>
            <CharacteristicTable
              characteristics={characteristicNames}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              sortOrder={sortOrder}
              onSort={handleSortOrderChange}
            />
          </Box>
          <TablePagination
            total={total}
            page={page}
            rowsPerPage={rowsPerPage}
            itemsCount={characteristicNames.length}
            itemLabel="характеристика"
            itemLabelPlural="характеристик"
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
          <CharacteristicNameForm
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
        itemName={characteristicToDelete?.name || ""}
        message="Вы уверены, что хотите удалить характеристику?"
        warningMessage="Если эта характеристика используется в товарах, удаление будет невозможно. Сначала удалите эту характеристику у всех товаров."
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

