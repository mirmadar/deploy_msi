import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from "@mui/material";
import {
  Send as SendIcon,
} from "@mui/icons-material";
import { styles } from "./styles/SendConfirmDialog.styles";

export const SendConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  orderNumber,
  actionType,
  isProcessing = false,
}) => {
  const getActionText = () => {
    switch (actionType) {
      case "clientEmail":
        return "Отправить email клиенту";
      case "companyEmail":
        return "Отправить email компании";
      case "bitrix":
        return "Отправить в Bitrix24";
      default:
        return "Выполнить действие";
    }
  };

  const getMessage = () => {
    switch (actionType) {
      case "clientEmail":
        return "Вы уверены, что хотите отправить email клиенту?";
      case "companyEmail":
        return "Вы уверены, что хотите отправить email компании?";
      case "bitrix":
        return "Вы уверены, что хотите отправить лид в Bitrix24?";
      default:
        return "Вы уверены, что хотите выполнить это действие?";
    }
  };

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
            Подтверждение отправки
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={styles.dialogContent}>
        <Typography variant="body1" sx={styles.message}>
          {getMessage()}
        </Typography>
        {orderNumber && (
          <Box sx={styles.orderNumberBox}>
            <Typography variant="body2" sx={styles.orderNumberLabel}>
              Номер заказа:
            </Typography>
            <Typography variant="body1" sx={styles.orderNumberText}>
              {orderNumber}
            </Typography>
          </Box>
        )}
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
          startIcon={<SendIcon />}
          disabled={isProcessing}
          sx={styles.sendButton}
        >
          {isProcessing ? "Отправка..." : getActionText()}
        </Button>
      </DialogActions>
    </Dialog>
  );
};








