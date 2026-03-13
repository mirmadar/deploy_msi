import React from "react";
import { TableHead, TableRow, TableCell, Typography } from "@mui/material";
import { styles } from "./styles/OrderTableHeader.styles";

export const OrderTableHeader = () => {
  return (
    <TableHead>
      <TableRow sx={styles.tableRow}>
        <TableCell sx={styles.orderNumberHeaderCell}>
          <Typography variant="subtitle2">Номер заказа</Typography>
        </TableCell>
        <TableCell sx={styles.clientNameHeaderCell}>
          <Typography variant="subtitle2">Имя</Typography>
        </TableCell>
        <TableCell sx={styles.contactHeaderCell}>
          <Typography variant="subtitle2">Данные клиента</Typography>
        </TableCell>
        <TableCell sx={styles.statusHeaderCell}>
          <Typography variant="subtitle2">Статус отправки</Typography>
        </TableCell>
        <TableCell sx={styles.dateHeaderCell}>
          <Typography variant="subtitle2">Дата создания</Typography>
        </TableCell>
        <TableCell sx={styles.actionsHeaderCell}>
          <Typography variant="subtitle2">Отправить повторно</Typography>
        </TableCell>
      </TableRow>
    </TableHead>
  );
};

