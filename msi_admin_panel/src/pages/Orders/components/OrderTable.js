import React from "react";
import {
  Table,
  TableBody,
  Box,
  CircularProgress,
  Typography,
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

