import React from "react";
import { Box, Typography } from "@mui/material";
import { BLOCK_TYPES } from "../constants/blockTypes";

/**
 * Рендерит блок так, как он будет выглядеть на странице услуги.
 */
export const BlockPreviewContent = ({ block }) => {
  const p = block?.payload ?? {};
  const type = block?.type;

  if (type === BLOCK_TYPES.HEADING) {
    const text = p.text ?? "";
    const hasHtml = /<[a-z][\s\S]*>/i.test(text);
    return (
      <Typography
        component="h3"
        variant="subtitle1"
        sx={{ fontWeight: 600, mb: 0, "& strong": { fontWeight: 700 }, "& em": { fontStyle: "italic" } }}
        {...(hasHtml ? { dangerouslySetInnerHTML: { __html: text || "Заголовок" } } : { children: text || "Заголовок" })}
      />
    );
  }

  if (type === BLOCK_TYPES.TEXT) {
    const html = p.content ?? "";
    return (
      <Box
        component="div"
        sx={{
          "& p": { margin: "0 0 0.5em" },
          "& p:last-child": { marginBottom: 0 },
          "& strong": { fontWeight: 600 },
          "& em": { fontStyle: "italic" },
        }}
        dangerouslySetInnerHTML={{ __html: html || "<p>Текст</p>" }}
      />
    );
  }

  if (type === BLOCK_TYPES.LIST) {
    const items = Array.isArray(p.items) ? p.items.filter(Boolean) : [];
    const ListTag = p.ordered ? "ol" : "ul";
    return (
      <Box
        component={ListTag}
        sx={{
          margin: 0,
          pl: 2.5,
          "& li": { mb: 0.25 },
        }}
      >
        {items.length
          ? items.map((item, i) => <li key={i}>{item}</li>)
          : <li>Пункт списка</li>}
      </Box>
    );
  }

  if (type === BLOCK_TYPES.IMAGE) {
    const url = p.imageUrl ?? "";
    const caption = p.caption ?? "";
    const width = p.width ?? "100%";
    return (
      <Box sx={{ my: 1 }}>
        {url ? (
          <Box
            component="img"
            src={url}
            alt={caption || "Изображение"}
            sx={{ maxWidth: width, height: "auto", display: "block", borderRadius: 1 }}
          />
        ) : (
          <Box
            sx={{
              height: 120,
              bgcolor: "action.hover",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 1,
              color: "text.secondary",
            }}
          >
            Изображение
          </Box>
        )}
        {caption && (
          <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
            {caption}
          </Typography>
        )}
      </Box>
    );
  }

  if (type === BLOCK_TYPES.DOCUMENTS) {
    const items = Array.isArray(p.items) ? p.items : [];
    return (
      <Box component="ul" sx={{ margin: 0, pl: 2.5, "& li": { mb: 0.5 } }}>
        {items.length
          ? items.map((item, i) => (
              <li key={i}>
                {item?.fileUrl ? (
                  <Typography component="a" href={item.fileUrl} target="_blank" rel="noopener noreferrer" sx={{ color: "primary.main" }}>
                    {item?.title || "Документ"}
                  </Typography>
                ) : (
                  <Typography color="text.secondary">{item?.title || "Документ"}</Typography>
                )}
              </li>
            ))
          : <li>Документы</li>}
      </Box>
    );
  }

  return null;
};
