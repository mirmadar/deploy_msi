import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
} from "@mui/material";
import {
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { styles } from "./styles/SelectByFiltersConfirmDialog.styles";

export const SelectByFiltersConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  count,
  message,
  confirmButtonText = "Выбрать",
  isProcessing = false,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: styles.dialogPaper,
      }}
    >
      <DialogTitle sx={styles.dialogTitle}>
        <Typography variant="h6" sx={styles.title}>
          Выбрать все по фильтрам
        </Typography>
      </DialogTitle>

      <DialogContent sx={styles.dialogContent}>
        <Typography variant="body1" sx={styles.message}>
          {message}
        </Typography>
        <Box sx={styles.countBox}>
          <Typography variant="h5" sx={styles.countText}>
            {count.toLocaleString("ru-RU")}
          </Typography>
          <Typography variant="body2" sx={styles.countLabel}>
            товаров будет выбрано
          </Typography>
        </Box>

        <Alert
          severity="info"
          sx={styles.infoAlert}
          icon={<CheckCircleIcon />}
        >
          <Typography variant="body2" sx={styles.infoText}>
            После подтверждения вы сможете выполнить массовые операции с выбранными товарами.
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions sx={styles.dialogActions}>
        <Button
          onClick={onClose}
          disabled={isProcessing}
          sx={styles.cancelButton}
        >
          Отмена
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="primary"
          disabled={isProcessing}
          sx={styles.confirmButton}
        >
          {isProcessing ? "Обработка..." : confirmButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

