import React, { useState } from "react";
import {
  Dialog,
  Button,
  Autocomplete,
  TextField,
  FormHelperText,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import { ServicesApi } from "../../../api/services.api";
import { styles } from "./styles/BulkServiceMoveModal.styles";

export const BulkServiceMoveModal = ({
  open,
  onClose,
  selectedServiceIds,
  categoryOptions,
  onSuccess,
}) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    if (!selectedCategory?.id) {
      setError("Выберите категорию услуг");
      return;
    }
    try {
      setError("");
      setLoading(true);
      await ServicesApi.bulkMove({
        serviceIds: selectedServiceIds,
        newServiceCategoryId: selectedCategory.id,
      });
      onSuccess();
      onClose();
      setSelectedCategory(null);
    } catch (err) {
      console.error("Ошибка при переносе услуг:", err);
      setError(
        err?.response?.data?.message ?? "Ошибка при переносе услуг"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedCategory(null);
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: styles.dialogPaper }}>
      <Box sx={styles.dialogContent}>
        <Typography sx={styles.title}>
          Перенести выбранные услуги
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={styles.subtitle}>
          Выбрано услуг: <strong>{selectedServiceIds.length}</strong>
        </Typography>

        <Box sx={styles.formContainer}>
          <Autocomplete
            options={categoryOptions}
            getOptionLabel={(option) => option.displayPath ?? option.name ?? ""}
            value={selectedCategory}
            onChange={(_, newValue) => {
              setSelectedCategory(newValue);
              setError("");
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Категория назначения"
                placeholder="Выберите категорию услуг"
                helperText="В какую категорию перенести выбранные услуги"
              />
            )}
            fullWidth
            noOptionsText="Категории услуг не найдены"
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            sx={styles.autocompleteField}
          />
        </Box>

        {error && (
          <FormHelperText error sx={styles.errorText}>
            {error}
          </FormHelperText>
        )}

        <Box sx={styles.buttonsContainer}>
          <Button onClick={handleClose} disabled={loading}>
            Отмена
          </Button>
          <Button
            variant="contained"
            onClick={handleApply}
            disabled={loading || !selectedCategory}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? "Перенос..." : "Перенести"}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};
