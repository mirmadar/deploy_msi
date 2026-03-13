import React, { useRef, useEffect } from "react";
import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { FormatBold as FormatBoldIcon, FormatItalic as FormatItalicIcon } from "@mui/icons-material";

/**
 * Простой редактор с кнопками «Жирный» и «Курсив».
 * value/onChange — HTML-строка. Админам не нужно знать HTML.
 */
export const RichTextEditor = ({ value = "", onChange, placeholder = "Введите текст...", minRows = 3, label }) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.innerHTML !== value) {
      el.innerHTML = value || "";
    }
  }, [value]);

  const handleInput = () => {
    const html = ref.current?.innerHTML ?? "";
    onChange?.(html);
  };

  const handleToolbar = (command) => {
    document.execCommand(command, false, null);
    ref.current?.focus();
    const html = ref.current?.innerHTML ?? "";
    onChange?.(html);
  };

  return (
    <Box>
      <ToggleButtonGroup size="small" sx={{ mb: 0.5 }}>
        <ToggleButton value="bold" onClick={() => handleToolbar("bold")} aria-label="Жирный">
          <FormatBoldIcon fontSize="small" />
        </ToggleButton>
        <ToggleButton value="italic" onClick={() => handleToolbar("italic")} aria-label="Курсив">
          <FormatItalicIcon fontSize="small" />
        </ToggleButton>
      </ToggleButtonGroup>
      <Box
        ref={ref}
        component="div"
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        data-placeholder={placeholder}
        sx={{
          minHeight: minRows * 24,
          px: 1.5,
          py: 1,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          bgcolor: "background.paper",
          outline: "none",
          "&:focus": { borderColor: "primary.main" },
          "&:empty::before": {
            content: "attr(data-placeholder)",
            color: "text.disabled",
          },
          "& p": { margin: "0 0 0.5em" },
          "& p:last-child": { marginBottom: 0 },
        }}
      />
      {label && (
        <Box component="span" sx={{ fontSize: "0.75rem", color: "text.secondary", mt: 0.5, display: "block" }}>
          {label}
        </Box>
      )}
    </Box>
  );
};
