import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from "@mui/material";
import { BLOCK_TYPES, BLOCK_TYPE_LABELS } from "../constants/blockTypes";
import { BlockPayloadForm } from "./BlockPayloadForm";

export const AddBlockDialog = ({ open, onClose, onSuccess, onAdd, initialType = null }) => {
  const [step, setStep] = useState(1);
  const [type, setType] = useState(BLOCK_TYPES.HEADING);
  const [payload, setPayload] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const skipTypeStep = !!initialType;

  useEffect(() => {
    if (open && initialType) {
      setType(initialType);
      setPayload({});
      setStep(2);
    } else if (open && !initialType) {
      setStep(1);
      setType(BLOCK_TYPES.HEADING);
      setPayload({});
    }
  }, [open, initialType]);

  const handleClose = () => {
    setStep(1);
    setType(BLOCK_TYPES.HEADING);
    setPayload({});
    setError(null);
    onClose();
  };

  const handleNext = () => {
    setStep(2);
    setError(null);
  };

  const handleBack = () => {
    setStep(1);
    setError(null);
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      await onAdd(type, payload);
      handleClose();
      onSuccess?.();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message ?? "Ошибка при добавлении блока");
    } finally {
      setSaving(false);
    }
  };

  const showForm = step === 2 || skipTypeStep;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {showForm ? `Добавить: ${BLOCK_TYPE_LABELS[type] ?? type}` : "Тип блока"}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {!showForm ? (
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Тип блока</InputLabel>
            <Select
              value={type}
              label="Тип блока"
              onChange={(e) => setType(e.target.value)}
            >
              {Object.entries(BLOCK_TYPE_LABELS).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <Box sx={{ mt: 1 }}>
            <BlockPayloadForm type={type} payload={payload} onChange={setPayload} />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {showForm ? (
          <>
            {!skipTypeStep && (
              <Button onClick={handleBack} disabled={saving}>
                Назад
              </Button>
            )}
            <Box sx={{ flex: 1 }} />
            <Button onClick={handleClose} disabled={saving}>
              Отмена
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={20} /> : null}
            >
              {saving ? "Добавление..." : "Добавить"}
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleClose}>Отмена</Button>
            <Button variant="contained" onClick={handleNext}>
              Далее
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};
