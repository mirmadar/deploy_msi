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
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { styles } from "./styles/DeleteConfirmDialog.styles";

export const DeleteConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  itemName,
  message,
  warningMessage,
  isDeleting = false,
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
        <Box sx={styles.titleContainer}>
          <Typography variant="h6" sx={styles.title}>
            Подтверждение удаления
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={styles.dialogContent}>
        <Typography variant="body1" sx={styles.message}>
          {message}
        </Typography>
        <Box sx={styles.nameBox}>
          <Typography variant="body1" sx={styles.nameText}>
            {itemName}
          </Typography>
        </Box>

        <Alert
          severity="warning"
          sx={styles.warningAlert}
          icon={<WarningIcon />}
        >
          <Typography variant="body2" sx={styles.warningText}>
            {warningMessage}
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions sx={styles.dialogActions}>
        <Button
          onClick={onClose}
          disabled={isDeleting}
          sx={styles.cancelButton}
        >
          Отмена
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          startIcon={<DeleteIcon />}
          disabled={isDeleting}
          sx={styles.deleteButton}
        >
          {isDeleting ? "Удаление..." : "Удалить"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};


