import { useState, useEffect, useCallback } from "react";
import { ShipmentsApi } from "../../../api/shipments.api";

export const useShipments = (initialPage = 0, initialRowsPerPage = 25, categoryId) => {
  const [shipments, setShipments] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  const fetchShipments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: String(page + 1),
        pageSize: String(rowsPerPage),
      };

      if (categoryId) {
        params.categoryId = String(categoryId);
      }

      const res = await ShipmentsApi.list(params);
      // Бэкенд возвращает { data: [...], total: ... }
      const data = res?.data?.data || res?.data || [];
      const totalCount = res?.data?.total || data.length;

      setShipments(data);
      setTotal(totalCount);
    } catch (err) {
      console.error(err);
      setError("Не удалось загрузить посты отгрузок");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, categoryId]);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  const handlePageChange = (_, newPage) => setPage(newPage);

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const refresh = () => fetchShipments();

  return {
    shipments,
    total,
    loading,
    error,
    page,
    rowsPerPage,
    setPage,
    setRowsPerPage,
    handlePageChange,
    handleRowsPerPageChange,
    refresh,
  };
};







