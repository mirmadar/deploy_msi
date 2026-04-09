import React from "react";
import {
  TableRow,
  TableCell,
  Box,
  Typography,
  Chip,
  Link,
  Tooltip,
} from "@mui/material";
import { styles } from "./styles/OrderTableRow.styles";

export const OrderTableRow = ({
  order,
  onResendClientEmail,
  onResendCompanyEmail,
  onResendBitrix,
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPhone = (phone) => {
    if (!phone) return "—";
    return phone;
  };

  return (
    <TableRow hover sx={styles.tableRow}>
      <TableCell sx={styles.orderNumberCell}>
        <Box sx={styles.cellContent}>
          <Typography variant="body2" sx={styles.orderNumberText}>
            {order.orderNumber}
          </Typography>
        </Box>
      </TableCell>
      <TableCell sx={styles.clientNameCell}>
        <Box sx={styles.cellContent}>
          <Typography variant="body2" sx={styles.clientNameText}>
            {order.clientName || "—"}
          </Typography>
        </Box>
      </TableCell>
      <TableCell sx={{ ...styles.contactCell, display: { xs: "none", md: "table-cell" } }}>
        <Box sx={styles.cellContent}>
          <Typography variant="body2" sx={styles.contactText}>
            {order.clientEmail || "—"}
          </Typography>
          <Typography variant="caption" sx={styles.phoneText}>
            {formatPhone(order.clientPhone)}
          </Typography>
        </Box>
      </TableCell>
      <TableCell sx={styles.statusCell}>
        <Box sx={styles.statusContainer}>
          {order.clientEmailSent ? (
            <Chip
              label="Клиенту"
              size="small"
              color="success"
              sx={styles.statusChip}
            />
          ) : (
            <Chip
              label="Клиенту"
              size="small"
              color="default"
              sx={styles.statusChip}
            />
          )}
          {order.companyEmailSent ? (
            <Chip
              label="Компании"
              size="small"
              color="success"
              sx={styles.statusChip}
            />
          ) : (
            <Chip
              label="Компании"
              size="small"
              color="default"
              sx={styles.statusChip}
            />
          )}
          <Tooltip
            title={
              order.bitrixLeadId
                ? `ID лида: ${order.bitrixLeadId}`
                : "ID лида пока отсутствует"
            }
          >
            <Chip
              label="Bitrix"
              size="small"
              color={order.bitrixSent ? "success" : "default"}
              sx={styles.statusChip}
            />
          </Tooltip>
        </Box>
      </TableCell>
      <TableCell sx={{ ...styles.bitrixLeadCell, display: { xs: "none", lg: "table-cell" } }}>
        <Box sx={styles.cellContent}>
          <Typography variant="body2" sx={styles.bitrixLeadText}>
            {order.bitrixLeadId || "—"}
          </Typography>
        </Box>
      </TableCell>
      <TableCell sx={{ ...styles.dateCell, display: { xs: "none", lg: "table-cell" } }}>
        <Box sx={styles.cellContent}>
          <Typography variant="body2" sx={styles.dateText}>
            {formatDate(order.createdAt)}
          </Typography>
        </Box>
      </TableCell>
      <TableCell sx={styles.actionsCell}>
        <Box sx={styles.actionsContainer}>
          <Link
            component="button"
            variant="body2"
            onClick={() => onResendClientEmail(order.orderNumber)}
            sx={styles.actionLink(order.clientEmailSent)}
          >
            Отправить email клиенту
          </Link>
          <Link
            component="button"
            variant="body2"
            onClick={() => onResendCompanyEmail(order.orderNumber)}
            sx={styles.actionLink(order.companyEmailSent)}
          >
            Отправить email компании
          </Link>
          <Link
            component="button"
            variant="body2"
            onClick={() => onResendBitrix(order.orderNumber)}
            sx={styles.actionLink(order.bitrixSent)}
          >
            Отправить в Bitrix
          </Link>
        </Box>
      </TableCell>
    </TableRow>
  );
};

