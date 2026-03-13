import React from "react";
import {
  Box,
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
} from "@mui/icons-material";
import { BLOCK_TYPES } from "../constants/blockTypes";
import { RichTextEditor } from "./RichTextEditor";
import { http } from "../../../../api/http";

export const emptyPayloadByType = {
  [BLOCK_TYPES.HEADING]: { text: "" },
  [BLOCK_TYPES.TEXT]: { content: "" },
  [BLOCK_TYPES.LIST]: { ordered: false, items: [""] },
  [BLOCK_TYPES.IMAGE]: { imageUrl: "", caption: "", width: "100%" },
  [BLOCK_TYPES.DOCUMENTS]: { items: [{ title: "", fileUrl: "" }] },
};

export const getEmptyPayload = (type) => ({ ...emptyPayloadByType[type] });

export const BlockPayloadForm = ({ type, payload = {}, onChange }) => {
  const p = { ...emptyPayloadByType[type], ...payload };

  if (type === BLOCK_TYPES.HEADING) {
    return (
      <RichTextEditor
        label="Текст заголовка. Выделите фрагмент и нажмите Жирный или Курсив."
        value={p.text ?? ""}
        onChange={(html) => onChange({ ...p, text: html })}
        placeholder="Введите заголовок..."
        minRows={2}
      />
    );
  }

  if (type === BLOCK_TYPES.TEXT) {
    return (
      <RichTextEditor
        label="Текст. Выделите фрагмент и нажмите Жирный или Курсив."
        value={p.content ?? ""}
        onChange={(html) => onChange({ ...p, content: html })}
        placeholder="Введите текст..."
        minRows={5}
      />
    );
  }

  if (type === BLOCK_TYPES.LIST) {
    const items = Array.isArray(p.items) ? p.items : [""];
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={!!p.ordered}
              onChange={(e) => onChange({ ...p, ordered: e.target.checked })}
            />
          }
          label="Нумерованный список"
        />
        {items.map((item, i) => (
          <Box key={i} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <TextField
              label={`Пункт ${i + 1}`}
              value={item}
              onChange={(e) => {
                const next = [...items];
                next[i] = e.target.value;
                onChange({ ...p, items: next });
              }}
              fullWidth
              size="small"
            />
            <Button
              size="small"
              color="error"
              onClick={() => {
                const next = items.filter((_, j) => j !== i);
                onChange({ ...p, items: next.length ? next : [""] });
              }}
            >
              <DeleteIcon />
            </Button>
          </Box>
        ))}
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={() => onChange({ ...p, items: [...items, ""] })}
        >
          Добавить пункт
        </Button>
      </Box>
    );
  }

  if (type === BLOCK_TYPES.IMAGE) {
    const widthOptions = [
          { value: "100%", label: "На всю ширину" },
          { value: "80%", label: "Большое" },
          { value: "50%", label: "Среднее" },
          { value: "30%", label: "Маленькое" },
          { value: "20%", label: "Очень маленькое" },
        ];
    const handleImageUpload = async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("image", file);

      try {
        const res = await http.post("/admin/upload/image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const urlFromResponse = res?.data?.imageUrl;
        if (urlFromResponse) {
          onChange({ ...p, imageUrl: urlFromResponse });
        }
      } catch (err) {
        console.error("Ошибка при загрузке изображения блока", err);
      } finally {
        event.target.value = "";
      }
    };

    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="Изображение"
          value={p.imageUrl ?? ""}
          onChange={(e) => onChange({ ...p, imageUrl: e.target.value })}
          fullWidth
          placeholder="Вставьте URL изображения или загрузите файл"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title="Можно вставить URL изображения или загрузить файл с компьютера">
                  <IconButton
                    component="label"
                    size="small"
                    edge="end"
                    aria-label="Загрузить изображение"
                  >
                    <CloudUploadIcon fontSize="small" />
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleImageUpload}
                    />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          }}
          helperText="Вставьте ссылку на изображение или используйте загрузку справа"
        />
        <FormControl fullWidth>
          <InputLabel>Размер изображения</InputLabel>
          <Select
            value={p.width ?? "100%"}
            label="Размер изображения"
            onChange={(e) => onChange({ ...p, width: e.target.value })}
          >
            {widthOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Подпись (необязательно)"
          value={p.caption ?? ""}
          onChange={(e) => onChange({ ...p, caption: e.target.value })}
          fullWidth
        />
      </Box>
    );
  }

  if (type === BLOCK_TYPES.DOCUMENTS) {
    const items = Array.isArray(p.items) ? p.items : [{ title: "", fileUrl: "" }];
    const handleDocumentUpload = async (event, itemIndex) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const formData = new FormData();
      formData.append("document", file);
      try {
        const res = await http.post("/admin/upload/document", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const urlFromResponse = res?.data?.fileUrl;
        if (urlFromResponse) {
          const next = items.map((it, j) =>
            j === itemIndex ? { ...it, fileUrl: urlFromResponse } : it
          );
          onChange({ ...p, items: next });
        }
      } catch (err) {
        console.error("Ошибка при загрузке документа", err);
      } finally {
        event.target.value = "";
      }
    };
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {items.map((item, i) => (
          <Box
            key={i}
            sx={{
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <TextField
              label="Название документа"
              value={item.title ?? ""}
              onChange={(e) => {
                const next = items.map((it, j) =>
                  j === i ? { ...it, title: e.target.value } : it
                );
                onChange({ ...p, items: next });
              }}
              fullWidth
              size="small"
            />
            <TextField
              label="URL файла"
              value={item.fileUrl ?? ""}
              onChange={(e) => {
                const next = items.map((it, j) =>
                  j === i ? { ...it, fileUrl: e.target.value } : it
                );
                onChange({ ...p, items: next });
              }}
              fullWidth
              size="small"
              placeholder="Вставьте ссылку или загрузите файл с компьютера"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Загрузить документ с компьютера (PDF, DOC, DOCX и др.)">
                      <IconButton
                        component="label"
                        size="small"
                        edge="end"
                        aria-label="Загрузить документ"
                      >
                        <CloudUploadIcon fontSize="small" />
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip,.rar"
                          hidden
                          onChange={(e) => handleDocumentUpload(e, i)}
                        />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              size="small"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => {
                const next = items.filter((_, j) => j !== i);
                onChange({ ...p, items: next.length ? next : [{ title: "", fileUrl: "" }] });
              }}
            >
              Удалить
            </Button>
          </Box>
        ))}
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={() =>
            onChange({ ...p, items: [...items, { title: "", fileUrl: "" }] })
          }
        >
          Добавить документ
        </Button>
      </Box>
    );
  }

  return null;
};
