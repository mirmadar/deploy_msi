import React from "react";
import {
  Table,
  TableBody,
  Box,
  CircularProgress,
  Typography,
  Checkbox,
  Avatar,
  Chip,
  Collapse,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { ProductForm } from "../ProductForm";
import { ProductTableActions } from "./ProductTableActions";
import { getUnitLabel } from "../../../utils/productUnits";
import { ProductTableHeader } from "./ProductTableHeader";
import { ProductTableRow } from "./ProductTableRow";
import { styles } from "./styles/ProductTable.styles";

export const ProductTable = ({
  products,
  loading,
  selectedProducts,
  expandedProductId,
  onSelectAll,
  onSelect,
  onExpand,
  onEdit,
  onDelete,
  sortBy,
  sortOrder,
  onSort,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const allSelected =
    products.length > 0 && selectedProducts.length === products.length;
  const someSelected =
    selectedProducts.length > 0 && selectedProducts.length < products.length;

  if (loading && products.length === 0) {
    return (
      <Box sx={styles.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  if (products.length === 0) {
    return (
      <Box sx={styles.emptyContainer}>
        <Typography variant="body1" color="text.secondary">
          Товары не найдены
        </Typography>
      </Box>
    );
  }

  if (isMobile) {
    return (
      <Box sx={styles.mobileList}>
        <Box sx={styles.mobileSelectAllRow}>
          <Typography sx={styles.mobileSelectAllLabel}>Выбрать все на странице</Typography>
          <Checkbox
            indeterminate={someSelected}
            checked={allSelected}
            onChange={(e) => onSelectAll(e.target.checked)}
            size="small"
          />
        </Box>
        {products.map((product) => {
          const productId = product.productId;
          const isSelected = selectedProducts.includes(productId);
          const isExpanded = expandedProductId === productId;
          const statusLabel =
            product.status === "ARCHIVE"
              ? "Архив"
              : product.status === "IN_STOCK"
              ? "В наличии"
              : "Не в наличии";

          return (
            <Box key={productId} sx={styles.mobileCard}>
              <Box sx={styles.mobileTopRow}>
                <Checkbox
                  checked={isSelected}
                  onChange={(e) => onSelect(productId, e.target.checked)}
                  size="small"
                />
                <Typography variant="caption" color="text.secondary">
                  #{productId}
                </Typography>
              </Box>

              <Box sx={styles.mobileNameRow}>
                <Avatar
                  src={product.imageUrl || product.image}
                  sx={styles.mobileAvatar}
                >
                  {product.name?.charAt(0)?.toUpperCase()}
                </Avatar>
                <Typography sx={styles.mobileNameText}>{product.name}</Typography>
              </Box>

              <Box sx={styles.mobileMetaRow}>
                <Typography variant="body2" sx={styles.mobilePriceText}>
                  {Number(product.price).toLocaleString("ru-RU")} ₽
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {getUnitLabel(product.unit || product.unitOfMeasurement)}
                </Typography>
              </Box>

              <Box sx={styles.mobileMetaRow}>
                <Typography variant="body2">{statusLabel}</Typography>
                {product.isNew && <Chip label="Новинка" color="success" size="small" />}
              </Box>

              <Typography sx={styles.mobileCategoryText}>
                {product.category?.name || "Без категории"}
              </Typography>

              <Box sx={styles.mobileActionsRow}>
                <ProductTableActions
                  isExpanded={isExpanded}
                  onExpand={() => onExpand(productId)}
                  onEdit={() => onEdit(productId)}
                  onDelete={() => onDelete(productId)}
                />
              </Box>

              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <Box sx={styles.mobileCollapse}>
                  <ProductForm productId={productId} readOnly />
                </Box>
              </Collapse>
            </Box>
          );
        })}
      </Box>
    );
  }

  return (
    <Table sx={styles.table}>
      <ProductTableHeader
        allSelected={allSelected}
        someSelected={someSelected}
        onSelectAll={onSelectAll}
        hasProducts={products.length > 0}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={onSort}
      />
      <TableBody>
        {products.map((product) => (
          <ProductTableRow
            key={product.productId}
            product={product}
            isSelected={selectedProducts.includes(product.productId)}
            isExpanded={expandedProductId === product.productId}
            onSelect={(checked) => onSelect(product.productId, checked)}
            onExpand={() => onExpand(product.productId)}
            onEdit={() => onEdit(product.productId)}
            onDelete={() => onDelete(product.productId)}
          />
        ))}
      </TableBody>
    </Table>
  );
};
