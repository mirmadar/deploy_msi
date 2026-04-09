import React from "react";
import {
  Table,
  TableBody,
  Box,
  CircularProgress,
  Typography,
  Chip,
  Link,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { OrderTableHeader } from "./OrderTableHeader";
import { OrderTableRow } from "./OrderTableRow";
import { styles } from "./styles/OrderTable.styles";

export const OrderTable = ({
  orders,
  loading,
  onResendClientEmail,
  onResendCompanyEmail,
  onResendBitrix,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading && orders.length === 0) {
    return (
      <Box sx={styles.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  if (orders.length === 0) {
    return (
      <Box sx={styles.emptyContainer}>
        <Typography variant="body1" color="text.secondary">
          Заказы не найдены
        </Typography>
      </Box>
    );
  }

  if (isMobile) {
    return (
      <Box sx={styles.mobileList}>
        {orders.map((order) => (
          <Box key={order.orderNumber} sx={styles.mobileCard}>
            <Box sx={styles.mobileHeaderRow}>
              <Typography variant="body2" sx={styles.mobileOrderNumber}>
                Заказ #{order.orderNumber}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDate(order.createdAt)}
              </Typography>
            </Box>

            <Typography variant="body2" sx={styles.mobileClientName}>
              {order.clientName || "—"}
            </Typography>
            <Typography sx={styles.mobileContactText}>
              {order.clientEmail || "—"}
            </Typography>
            <Typography sx={styles.mobileContactText}>
              {order.clientPhone || "—"}
            </Typography>

            <Box sx={styles.mobileStatusRow}>
              <Chip label="Клиенту" size="small" color={order.clientEmailSent ? "success" : "default"} />
              <Chip label="Компании" size="small" color={order.companyEmailSent ? "success" : "default"} />
              <Chip label="Bitrix" size="small" color={order.bitrixSent ? "success" : "default"} />
            </Box>
            <Typography sx={styles.mobileContactText}>
              ID лида Bitrix: {order.bitrixLeadId || "—"}
            </Typography>

            <Box sx={styles.mobileActions}>
              <Link component="button" variant="body2" onClick={() => onResendClientEmail(order.orderNumber)}>
                Отправить email клиенту
              </Link>
              <Link component="button" variant="body2" onClick={() => onResendCompanyEmail(order.orderNumber)}>
                Отправить email компании
              </Link>
              <Link component="button" variant="body2" onClick={() => onResendBitrix(order.orderNumber)}>
                Отправить в Bitrix
              </Link>
            </Box>
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Table sx={styles.table}>
      <OrderTableHeader />
      <TableBody>
        {orders.map((order) => (
          <OrderTableRow
            key={order.orderNumber}
            order={order}
            onResendClientEmail={onResendClientEmail}
            onResendCompanyEmail={onResendCompanyEmail}
            onResendBitrix={onResendBitrix}
          />
        ))}
      </TableBody>
    </Table>
  );
};

