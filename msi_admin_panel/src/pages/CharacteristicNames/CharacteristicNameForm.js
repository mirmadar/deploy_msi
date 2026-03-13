import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Save as SaveIcon, Close as CloseIcon } from "@mui/icons-material";
import { CharacteristicNamesApi } from "../../api/characteristic-names.api";
import { styles } from "./styles/CharacteristicNameForm.styles";

export const CharacteristicNameForm = ({ id, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [name, setName] = useState("");
  const [valueType, setValueType] = useState("text");

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        // Если id - это число, используем get по ID
        // Если id - это строка (name), ищем в списке всех
        if (typeof id === "number" || !isNaN(Number(id))) {
          const res = await CharacteristicNamesApi.get(Number(id));
          const data = res?.data || res;
          setName(data.name || "");
          setValueType(data.valueType || "text");
        } else {
          // Если id - это name, загружаем все и ищем по имени
          const res = await CharacteristicNamesApi.getAll();
          const all = res?.data || res || [];
          const found = all.find((item) => item.name === id);
          if (found) {
            setName(found.name || "");
            setValueType(found.valueType || "text");
          } else {
            setError("Название характеристики не найдено");
          }
        }
      } catch (err) {
        console.error(err);
        setError("Не удалось загрузить данные");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Название обязательно");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const data = { name: name.trim(), valueType };

      if (id) {
        await CharacteristicNamesApi.update(id, data);
      } else {
        await CharacteristicNamesApi.create(data);
      }

      onSuccess();
    } catch (err) {
      console.error(err);
      const errorMessage =
        err?.response?.data?.message || "Ошибка при сохранении";
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={styles.loadingBox}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={styles.header}>
        <Typography variant="h5" fontWeight={600}>
          {id ? "Редактирование" : "Создание"} названия характеристики
        </Typography>
        <Button onClick={onClose} size="small">
          <CloseIcon />
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={styles.errorAlert}>
          {error}
        </Alert>
      )}

      <Box sx={styles.form}>
        <TextField
          label="Название"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          required
          sx={styles.textField}
          placeholder="Например: Материал, Размер, Вес"
        />

        <FormControl fullWidth sx={styles.textField}>
          <InputLabel>Тип значения</InputLabel>
          <Select
            value={valueType}
            onChange={(e) => setValueType(e.target.value)}
            label="Тип значения"
          >
            <MenuItem value="text">Текст</MenuItem>
            <MenuItem value="number">Число</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={styles.actions}>
        <Button variant="outlined" onClick={onClose} disabled={saving}>
          Отмена
        </Button>
        <Button
          type="submit"
          variant="contained"
          startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
          disabled={saving || !name.trim()}
        >
          Сохранить
        </Button>
      </Box>
    </form>
  );
};

