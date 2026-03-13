import React from "react";
import {
  Table,
  TableBody,
  Box,
  CircularProgress,
  Typography,
} from "@mui/material";
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
