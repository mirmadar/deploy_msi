import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";

export const DeleteBlockConfirmDialog = ({
  open,
  blockId,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Удалить блок?</DialogTitle>
      <DialogContent>
        <Typography>
          Блок будет удалён из контента страницы. Это действие нельзя отменить.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button
          variant="contained"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={onConfirm}
        >
          Удалить
        </Button>
      </DialogActions>
    </Dialog>
  );
};
