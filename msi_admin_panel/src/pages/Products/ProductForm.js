import React, { useEffect, useState } from "react";
import { Box, Typography, Avatar, Chip } from "@mui/material";
import { ProductsApi } from "../../api/products.api";
import ImageIcon from "@mui/icons-material/Image";
import { styles } from "./styles/ProductForm.styles";
import { getUnitLabel } from "../../utils/productUnits";

export const ProductForm = ({ productId, readOnly = true }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!productId) return;
      try {
        setLoading(true);
        const res = await ProductsApi.get(productId);
        setProduct(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [productId]);

  if (loading) return <Typography>Загрузка...</Typography>;
  if (!product) return <Typography>Товар не найден</Typography>;

  return (
    <Box sx={styles.container}>
      {/* Заголовок с изображением */}
      <Box sx={styles.header}>
        <Avatar src={product.imageUrl || product.image} sx={styles.avatar}>
          <ImageIcon />
        </Avatar>
        <Box flex={1}>
          <Typography sx={styles.title}>{product.name}</Typography>
          <Typography sx={styles.idText}>ID: {product.productId}</Typography>
        </Box>
      </Box>

      {/* Основная информация - компактный список */}
      <Box sx={styles.infoList}>
        <Box sx={styles.infoItem}>
          <Typography sx={styles.infoLabel}>Цена</Typography>
          <Typography sx={styles.infoValue}>
            {Number(product.price).toLocaleString("ru-RU")} ₽
          </Typography>
        </Box>
        {(product.unit || product.unitOfMeasurement) && (
          <Box sx={styles.infoItem}>
            <Typography sx={styles.infoLabel}>Ед. изм.</Typography>
            <Typography sx={styles.infoValue}>
              {getUnitLabel(product.unit || product.unitOfMeasurement)}
            </Typography>
          </Box>
        )}
        <Box sx={styles.infoItem}>
          <Typography sx={styles.infoLabel}>Статусы</Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip
              label={
                product.status === "ARCHIVE"
                  ? "Архив"
                  : product.status === "OUT_OF_STOCK"
                  ? "Не в наличии"
                  : "В наличии"
              }
              color={
                product.status === "ARCHIVE"
                  ? "default"
                  : product.status === "OUT_OF_STOCK"
                  ? "default"
                  : "success"
              }
              size="small"
              sx={styles.statusChip}
            />
            {product.status !== "ARCHIVE" && product.isNew && (
              <Chip
                label="Новинка"
                color="success"
                size="small"
                sx={styles.statusChip}
              />
            )}
          </Box>
        </Box>
        <Box sx={styles.infoItem}>
          <Typography sx={styles.infoLabel}>Категория</Typography>
          <Typography sx={styles.infoValue}>
            {product.category?.pathItems?.length
              ? product.category.pathItems.map((c) => c.name).join(" / ")
              : "Без категории"}
          </Typography>
        </Box>
      </Box>

      {/* Характеристики - простой список */}
      {product.characteristics?.length > 0 && (
        <Box sx={styles.characteristicsSection}>
          <Box sx={styles.characteristicsList}>
            {product.characteristics.map((c) => (
              <Box key={c.id} sx={styles.characteristicItem}>
                <Typography sx={styles.characteristicName}>{c.name}</Typography>
                <Typography sx={styles.characteristicValue}>
                  {c.value || "—"}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};
