import React from "react";
import { Box, Typography, Chip } from "@mui/material";
import { styles } from "./styles/OrderPageHeader.styles";

export const OrderPageHeader = ({ total }) => {
  return (
    <Box sx={styles.container}>
      <Typography variant="h5" sx={styles.title}>
        Журнал заказов
      </Typography>
      {total > 0 && <Chip label={total} size="small" sx={styles.chip} />}
    </Box>
  );
};








