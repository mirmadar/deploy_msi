import React from "react";
import {
  TableRow,
  TableCell,
  Checkbox,
  Box,
  Avatar,
  Chip,
  Collapse,
  Typography,
} from "@mui/material";
import { ProductForm } from "../ProductForm";
import { ProductTableActions } from "./ProductTableActions";
import { styles } from "./styles/ProductTableRow.styles";
import { getUnitLabel } from "../../../utils/productUnits";

export const ProductTableRow = ({
  product,
  isSelected,
  isExpanded,
  onSelect,
  onExpand,
  onEdit,
  onDelete,
}) => {
  return (
    <>
      <TableRow
        hover={!isExpanded}
        selected={isSelected}
        sx={{
          ...styles.tableRow,
          ...(product.status === "ARCHIVE" ? styles.archiveRow : {}),
        }}
      >
        <TableCell padding="checkbox">
          <Checkbox
            checked={isSelected}
            onChange={(e) => onSelect(e.target.checked)}
            size="small"
          />
        </TableCell>
        <TableCell sx={styles.idCell}>
          <Box sx={styles.cellContent}>
            <Typography variant="body2" sx={styles.idText}>
              #{product.productId}
            </Typography>
          </Box>
        </TableCell>
        <TableCell sx={styles.nameCell}>
          <Box sx={styles.nameCellWrapper}>
            <Box sx={styles.nameBox}>
              <Avatar src={product.imageUrl || product.image} sx={styles.avatar}>
                {product.name?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Typography variant="body2" sx={styles.nameText}>
                {product.name}
              </Typography>
            </Box>
          </Box>
        </TableCell>
        <TableCell sx={styles.unitCell}>
          <Box sx={styles.cellContent}>
            <Typography variant="body2" sx={styles.unitText}>
              {getUnitLabel(product.unit || product.unitOfMeasurement)}
            </Typography>
          </Box>
        </TableCell>
        <TableCell sx={styles.priceCell}>
          <Box sx={styles.cellContent}>
            <Typography variant="body2" sx={styles.priceText}>
              {Number(product.price).toLocaleString("ru-RU")} ₽
            </Typography>
          </Box>
        </TableCell>
        <TableCell sx={styles.statusCell}>
          <Box sx={styles.cellContent}>
            <Typography variant="body2" sx={styles.statusText}>
              {product.status === "ARCHIVE"
                ? "Архив"
                : product.status === "IN_STOCK"
                ? "В наличии"
                : "Не в наличии"}
            </Typography>
          </Box>
        </TableCell>
        <TableCell sx={styles.categoryCell}>
          <Box sx={styles.cellContent}>
            <Typography variant="body2" sx={styles.categoryText}>
              {product.category?.name || "Без категории"}
            </Typography>
          </Box>
        </TableCell>
        <TableCell sx={styles.isNewCell}>
          <Box sx={styles.cellContent}>
            {product.isNew && (
              <Chip
                label="Новинка"
                color="success"
                size="small"
                sx={styles.isNewChip}
              />
            )}
          </Box>
        </TableCell>
        <TableCell sx={styles.actionsCell}>
          <Box sx={styles.cellContent}>
            <ProductTableActions
              isExpanded={isExpanded}
              onExpand={onExpand}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </Box>
        </TableCell>
      </TableRow>

      <TableRow sx={styles.collapseRow}>
        <TableCell colSpan={9} sx={styles.collapseCell}>
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Box sx={styles.collapseContent}>
              <ProductForm productId={product.productId} readOnly />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};
