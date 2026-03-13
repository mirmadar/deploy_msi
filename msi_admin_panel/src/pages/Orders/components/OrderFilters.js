import React, { useState } from "react";
import {
  Box,
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
  Typography,
  Drawer,
  IconButton,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { styles } from "./styles/OrderFilters.styles";

export const OrderFilters = ({ open, onClose, filters, onFiltersChange }) => {
  const [localFilters, setLocalFilters] = useState(filters || {});

  React.useEffect(() => {
    setLocalFilters(filters || {});
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value === "" ? undefined : value,
    }));
  };

  const handleBooleanFilterChange = (key, checked) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: checked ? true : undefined,
    }));
  };

  const handleDateFilterChange = (key, value) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value ? new Date(value) : undefined,
    }));
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleReset = () => {
    const emptyFilters = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={styles.drawer}
      PaperProps={{
        sx: styles.drawerPaper,
      }}
    >
      <Box sx={styles.container}>
        <Box sx={styles.header}>
          <Typography variant="h6" sx={styles.title}>
            Фильтры
          </Typography>
          <IconButton
            onClick={onClose}
            size="small"
            sx={styles.closeButton}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <Box sx={styles.content}>
        <Typography variant="subtitle2" sx={styles.sectionTitle}>
              Данные клиента
            </Typography>
          <TextField
            label="Email клиента"
            placeholder="Введите email"
            value={localFilters.clientEmail || ""}
            onChange={(e) => handleFilterChange("clientEmail", e.target.value)}
            fullWidth
            size="small"
            type="email"
            sx={styles.field}
          />

          <TextField
            label="Телефон клиента"
            placeholder="Введите телефон"
            value={localFilters.clientPhone || ""}
            onChange={(e) => handleFilterChange("clientPhone", e.target.value)}
            fullWidth
            size="small"
            sx={styles.field}
          />

          <Box sx={styles.section}>
            <Typography variant="subtitle2" sx={styles.sectionTitle}>
              Статус отправки
            </Typography>

            <FormControlLabel
              control={
                <Checkbox
                  checked={localFilters.clientEmailSent === true}
                  onChange={(e) =>
                    handleBooleanFilterChange("clientEmailSent", e.target.checked)
                  }
                  size="small"
                />
              }
              label="Email клиенту отправлен"
              sx={styles.checkbox}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={localFilters.companyEmailSent === true}
                  onChange={(e) =>
                    handleBooleanFilterChange("companyEmailSent", e.target.checked)
                  }
                  size="small"
                />
              }
              label="Email компании отправлен"
              sx={styles.checkbox}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={localFilters.bitrixSent === true}
                  onChange={(e) =>
                    handleBooleanFilterChange("bitrixSent", e.target.checked)
                  }
                  size="small"
                />
              }
              label="Отправлено в Bitrix24"
              sx={styles.checkbox}
            />
          </Box>

          <Box sx={styles.section}>
            <Typography variant="subtitle2" sx={styles.sectionTitle}>
              Дата создания
            </Typography>

            <TextField
              label="От"
              type="date"
              value={
                localFilters.dateFrom
                  ? localFilters.dateFrom.toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) =>
                handleDateFilterChange("dateFrom", e.target.value)
              }
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={styles.field}
            />

            <TextField
              label="До"
              type="date"
              value={
                localFilters.dateTo
                  ? localFilters.dateTo.toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) => handleDateFilterChange("dateTo", e.target.value)}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={styles.field}
            />
          </Box>
        </Box>

        <Box sx={styles.actions}>
          <Button
            variant="contained"
            onClick={handleApply}
            fullWidth
            sx={styles.applyButton}
          >
            Применить
          </Button>
          <Button
            variant="outlined"
            onClick={handleReset}
            fullWidth
            sx={styles.resetButton}
          >
            Сбросить
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

