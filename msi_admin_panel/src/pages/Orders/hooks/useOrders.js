import { useState, useEffect, useCallback } from "react";
import { OrdersApi } from "../../../api/orders.api";

export const useOrders = (initialPage = 0, initialRowsPerPage = 20) => {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const [filters, setFilters] = useState({});

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Сначала фильтруем пустые значения, но сохраняем boolean и даты
      const filteredFilters = Object.fromEntries(
        Object.entries(filters).filter(([key, v]) => {
          // Сохраняем boolean значения (даже false)
          if (key === 'companyEmailSent' || key === 'clientEmailSent' || key === 'bitrixSent') {
            return v !== undefined && v !== null;
          }
          // Сохраняем даты
          if (key === 'dateFrom' || key === 'dateTo') {
            return v !== undefined && v !== null;
          }
          // Для остальных - фильтруем пустые
          return v !== undefined && v !== null && v !== "";
        })
      );

      const params = {
        page: String(page + 1),
        pageSize: String(rowsPerPage),
        ...filteredFilters,
      };

      // Преобразуем boolean значения в строки
      if (params.companyEmailSent !== undefined) {
        params.companyEmailSent = String(params.companyEmailSent);
      }
      if (params.clientEmailSent !== undefined) {
        params.clientEmailSent = String(params.clientEmailSent);
      }
      if (params.bitrixSent !== undefined) {
        params.bitrixSent = String(params.bitrixSent);
      }

      // Преобразуем даты в ISO строки
      if (params.dateFrom instanceof Date) {
        params.dateFrom = params.dateFrom.toISOString();
      }
      if (params.dateTo instanceof Date) {
        params.dateTo = params.dateTo.toISOString();
      }

      const res = await OrdersApi.list(params);
      // Бэкенд возвращает { data: [...], total: ... }
      const data = res?.data?.data || res?.data || [];
      const totalCount = res?.data?.total || data.length;

      setOrders(data);
      setTotal(totalCount);
    } catch (err) {
      console.error(err);
      setError("Не удалось загрузить заказы");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filters]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handlePageChange = (_, newPage) => setPage(newPage);

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const refresh = () => fetchOrders();

  return {
    orders,
    total,
    loading,
    error,
    page,
    rowsPerPage,
    filters,
    setFilters,
    handlePageChange,
    handleRowsPerPageChange,
    refresh,
  };
};

