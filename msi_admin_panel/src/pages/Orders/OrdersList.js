import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Alert,
  Snackbar,
} from "@mui/material";
import { OrdersApi } from "../../api/orders.api";
import { OrderTable } from "./components/OrderTable";
import { OrderFilters } from "./components/OrderFilters";
import { OrderSearchBar } from "./components/OrderSearchBar";
import { OrderPageHeader } from "./components/OrderPageHeader";
import { SendConfirmDialog } from "./components/SendConfirmDialog";
import { TablePagination } from "../../components/common/TablePagination";
import { useOrders } from "./hooks/useOrders";
import { styles } from "./styles/OrdersList.styles";

export const OrdersList = () => {
  const [filtersDrawerOpen, setFiltersDrawerOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [pendingOrderNumber, setPendingOrderNumber] = useState(null);

  const {
    orders,
    total,
    loading,
    error,
    page,
    rowsPerPage,
    filters,
    setFilters,
    handlePageChange,
    handleRowsPerPageChange,
    refresh,
  } = useOrders();

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleResendClientEmailClick = (orderNumber) => {
    setPendingAction("clientEmail");
    setPendingOrderNumber(orderNumber);
    setConfirmDialogOpen(true);
  };

  const handleResendCompanyEmailClick = (orderNumber) => {
    setPendingAction("companyEmail");
    setPendingOrderNumber(orderNumber);
    setConfirmDialogOpen(true);
  };

  const handleResendBitrixClick = (orderNumber) => {
    setPendingAction("bitrix");
    setPendingOrderNumber(orderNumber);
    setConfirmDialogOpen(true);
  };

  const handleConfirmDialogClose = () => {
    if (!isProcessing) {
      setConfirmDialogOpen(false);
      setPendingAction(null);
      setPendingOrderNumber(null);
    }
  };

  const handleConfirmSend = async () => {
    if (!pendingAction || !pendingOrderNumber) return;

    setIsProcessing(true);
    try {
      switch (pendingAction) {
        case "clientEmail":
          await OrdersApi.resendClientEmail(pendingOrderNumber);
          setSnackbarMessage("Email клиенту успешно отправлен");
          setSnackbarSeverity("success");
          break;
        case "companyEmail":
          await OrdersApi.resendCompanyEmail(pendingOrderNumber);
          setSnackbarMessage("Email компании успешно отправлен");
          setSnackbarSeverity("success");
          break;
        case "bitrix":
          await OrdersApi.resendBitrix(pendingOrderNumber);
          setSnackbarMessage("Лид успешно отправлен в Bitrix24");
          setSnackbarSeverity("success");
          break;
        default:
          break;
      }
      setSnackbarOpen(true);
      setConfirmDialogOpen(false);
      setPendingAction(null);
      setPendingOrderNumber(null);
      refresh();
    } catch (err) {
      console.error(err);
      let errorMessage = "Ошибка при отправке";
      switch (pendingAction) {
        case "clientEmail":
          errorMessage =
            err?.response?.data?.message ||
            err?.message ||
            "Ошибка при отправке email клиенту";
          break;
        case "companyEmail":
          errorMessage =
            err?.response?.data?.message ||
            err?.message ||
            "Ошибка при отправке email компании";
          break;
        case "bitrix":
          errorMessage =
            err?.response?.data?.message ||
            err?.message ||
            "Ошибка при отправке в Bitrix24";
          break;
        default:
          break;
      }
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      setConfirmDialogOpen(false);
      setPendingAction(null);
      setPendingOrderNumber(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSearchChange = (searchValue) => {
    setFilters((prev) => ({
      ...prev,
      search: searchValue || undefined,
    }));
  };

  const hasActiveFilters = Object.keys(filters || {}).some(
    (key) => filters[key] !== undefined && filters[key] !== null && filters[key] !== ""
  );

  return (
    <Paper elevation={0} sx={styles.paper}>
      <OrderPageHeader total={total} />

      <OrderSearchBar
        search={filters?.search || ""}
        onSearchChange={handleSearchChange}
        onFiltersClick={() => setFiltersDrawerOpen(true)}
        hasActiveFilters={hasActiveFilters}
      />

      {error && (
        <Alert severity="error" sx={styles.errorAlert}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={styles.loadingBox}>
          <Typography>Загрузка...</Typography>
        </Box>
      ) : orders.length === 0 ? (
        <Box sx={styles.emptyBox}>
          <Typography color="text.secondary">
            Заказы не найдены
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={styles.tableContainer}>
            <OrderTable
              orders={orders}
              loading={loading}
              onResendClientEmail={handleResendClientEmailClick}
              onResendCompanyEmail={handleResendCompanyEmailClick}
              onResendBitrix={handleResendBitrixClick}
            />
          </Box>
          <TablePagination
            total={total}
            page={page}
            rowsPerPage={rowsPerPage}
            itemsCount={orders.length}
            itemLabel="заказ"
            itemLabelPlural="заказов"
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </>
      )}

      <OrderFilters
        open={filtersDrawerOpen}
        onClose={() => setFiltersDrawerOpen(false)}
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      <SendConfirmDialog
        open={confirmDialogOpen}
        onClose={handleConfirmDialogClose}
        onConfirm={handleConfirmSend}
        orderNumber={pendingOrderNumber}
        actionType={pendingAction}
        isProcessing={isProcessing}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

