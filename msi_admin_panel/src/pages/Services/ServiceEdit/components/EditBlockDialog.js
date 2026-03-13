import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import { BLOCK_TYPE_LABELS } from "../constants/blockTypes";
import { BlockPayloadForm } from "./BlockPayloadForm";

export const EditBlockDialog = ({ open, block, onClose, onSave }) => {
  const [payload, setPayload] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (block) {
      setPayload(block.payload ?? {});
      setError(null);
    }
  }, [block]);

  const handleSubmit = async () => {
    if (!block) return;
    const blockId = block.serviceBlockId ?? block.id;
    setSaving(true);
    setError(null);
    try {
      await onSave(blockId, payload);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message ?? "Ошибка при сохранении");
    } finally {
      setSaving(false);
    }
  };

  if (!block) return null;

  const typeLabel = BLOCK_TYPE_LABELS[block.type] ?? block.type;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Редактировать блок: {typeLabel}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        <Box sx={{ mt: 1 }}>
          <BlockPayloadForm
            type={block.type}
            payload={payload}
            onChange={setPayload}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Отмена
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={20} /> : null}
        >
          {saving ? "Сохранение..." : "Сохранить"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
