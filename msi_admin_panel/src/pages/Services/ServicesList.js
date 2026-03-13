import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  Dialog,
  Chip,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { ServicesApi } from "../../api/services.api";
import { ServiceCategoriesApi } from "../../api/service-categories.api";
import { ServiceForm } from "./ServiceForm";
import { ServiceTable } from "./components/ServiceTable";
import { ServiceBulkActions } from "./components/ServiceBulkActions";
import { BulkServiceMoveModal } from "./components/BulkServiceMoveModal";
import { TablePagination } from "../../components/common/TablePagination";
import { DeleteConfirmDialog } from "../../components/common/DeleteConfirmDialog";
import { useServices } from "./hooks/useServices";
import { useServiceSelection } from "./hooks/useServiceSelection";
import { styles } from "./styles/ServicesList.styles";

const flattenCategories = (tree, parentPath = "") => {
  const result = [];
  (tree || []).forEach((node) => {
    const id = node.id ?? node.serviceCategoryId;
    const path = parentPath ? `${parentPath} / ${node.name}` : node.name;
    result.push({ id, name: node.name, displayPath: path });
    if (node.children?.length) {
      result.push(...flattenCategories(node.children, path));
    }
  });
  return result;
};

export const ServicesList = () => {
  const [editingId, setEditingId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMovingOrder, setIsMovingOrder] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [bulkMoveModalOpen, setBulkMoveModalOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    selectedServices,
    handleSelect,
    handleSelectAll,
    clearSelection,
  } = useServiceSelection();

  const {
    services,
    total,
    loading,
    error,
    page,
    rowsPerPage,
    serviceCategoryId,
    setCategoryFilter,
    handlePageChange,
    handleRowsPerPageChange,
    refresh,
  } = useServices();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryFromUrl = params.get("serviceCategoryId");
    if (categoryFromUrl != null && categoryFromUrl !== "") {
      setCategoryFilter(categoryFromUrl);
    }
  }, [location.search]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await ServiceCategoriesApi.getTree();
        const tree = res?.data ?? res ?? [];
        const flat = flattenCategories(tree);
        setCategoryOptions(flat);
      } catch (err) {
        console.error("Не удалось загрузить категории услуг", err);
      }
    };
    fetchCategories();
  }, []);

  const handleCreate = () => {
    setEditingId(null);
    setFormOpen(true);
  };

  const handleEdit = (id) => {
    setEditingId(id);
    setFormOpen(true);
  };

  const handleOpenConstructor = (id) => {
    navigate(`/services/${id}/edit`, {
      state: { returnCategoryId: serviceCategoryId ?? undefined },
    });
  };

  const handleDeleteClick = (id) => {
    const service = services.find(
      (s) => (s.id ?? s.serviceId) === id
    );
    if (service) {
      setServiceToDelete({
        id,
        name: service.name ?? "эта услуга",
      });
      setDeleteDialogOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!serviceToDelete) return;

    setIsDeleting(true);
    try {
      await ServicesApi.remove(serviceToDelete.id);
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
      refresh();
    } catch (err) {
      console.error(err);
      setDeleteError(
        err?.response?.data?.message ??
          err?.message ??
          "Ошибка при удалении услуги"
      );
      setSnackbarOpen(true);
      setDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteDialogClose = () => {
    if (!isDeleting) {
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
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

  const handleBulkMoveSuccess = () => {
    clearSelection();
    refresh();
    setBulkMoveModalOpen(false);
  };

  const handleBulkDeleteConfirm = async () => {
    if (selectedServices.length === 0) return;
    setIsBulkDeleting(true);
    try {
      await ServicesApi.bulkRemove({ serviceIds: selectedServices });
      clearSelection();
      setBulkDeleteDialogOpen(false);
      refresh();
    } catch (err) {
      console.error(err);
      setDeleteError(
        err?.response?.data?.message ?? err?.message ?? "Ошибка при массовом удалении услуг"
      );
      setSnackbarOpen(true);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleBulkDeleteDialogClose = () => {
    if (!isBulkDeleting) setBulkDeleteDialogOpen(false);
  };

  const handleMoveUp = useCallback(
    async (serviceId) => {
      setIsMovingOrder(true);
      try {
        await ServicesApi.move(serviceId, { direction: "up" });
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
    async (serviceId) => {
      setIsMovingOrder(true);
      try {
        await ServicesApi.move(serviceId, { direction: "down" });
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
            Услуги
          </Typography>
          {total > 0 && (
            <Chip label={total} size="small" sx={styles.chip} />
          )}
        </Box>
      </Box>

      <Box sx={styles.actionsContainer}>
        <Box sx={styles.actionsLeft}>
          <FormControl size="small" sx={styles.filterField}>
            <InputLabel id="service-category-filter-label">
              Категория услуг
            </InputLabel>
            <Select
              labelId="service-category-filter-label"
              value={serviceCategoryId ?? ""}
              label="Категория услуг"
              onChange={(e) =>
                setCategoryFilter(
                  e.target.value === "" ? null : e.target.value
                )
              }
            >
              <MenuItem value="">Все категории</MenuItem>
              {categoryOptions.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.displayPath}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          sx={styles.addButton}
        >
          Добавить услугу
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={styles.errorAlert}>
          {error}
        </Alert>
      )}

      <ServiceBulkActions
        selectedCount={selectedServices.length}
        onMove={() => setBulkMoveModalOpen(true)}
        onDelete={() => setBulkDeleteDialogOpen(true)}
      />

      {loading ? (
        <Box sx={styles.loadingBox}>
          <Typography>Загрузка...</Typography>
        </Box>
      ) : services.length === 0 ? (
        <Box sx={styles.emptyBox}>
          <Typography color="text.secondary">
            Услуги не найдены
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={styles.tableContainer}>
            <ServiceTable
              services={services}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onOpenConstructor={handleOpenConstructor}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              isMovingOrder={isMovingOrder}
              showOrderButtons={serviceCategoryId != null && serviceCategoryId !== ""}
              page={page}
              rowsPerPage={rowsPerPage}
              total={total}
              selectedServices={selectedServices}
              onSelect={handleSelect}
              onSelectAll={handleSelectAll}
            />
          </Box>
          <TablePagination
            total={total}
            page={page}
            rowsPerPage={rowsPerPage}
            itemsCount={services.length}
            itemLabel="услуга"
            itemLabelPlural="услуг"
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
          <ServiceForm
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
        itemName={serviceToDelete?.name ?? ""}
        message="Вы уверены, что хотите удалить услугу?"
        warningMessage="Удалённую услугу нельзя будет восстановить."
        isDeleting={isDeleting}
      />

      <BulkServiceMoveModal
        open={bulkMoveModalOpen}
        onClose={() => setBulkMoveModalOpen(false)}
        selectedServiceIds={selectedServices}
        categoryOptions={categoryOptions}
        onSuccess={handleBulkMoveSuccess}
      />

      <DeleteConfirmDialog
        open={bulkDeleteDialogOpen}
        onClose={handleBulkDeleteDialogClose}
        onConfirm={handleBulkDeleteConfirm}
        itemName={`${selectedServices.length} услуг`}
        message="Удалить выбранные услуги?"
        warningMessage="Будут удалены выбранные услуги и весь контент их страниц (блоки). Восстановить данные будет невозможно."
        isDeleting={isBulkDeleting}
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
