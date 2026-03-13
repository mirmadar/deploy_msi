import { useState, useEffect, useCallback } from "react";
import { ServicesApi } from "../../../api/services.api";

const normalizeItem = (item) =>
  item
    ? {
        ...item,
        id: item.id ?? item.serviceId,
      }
    : null;

export const useServices = (initialPage = 0, initialRowsPerPage = 25) => {
  const [services, setServices] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const [serviceCategoryId, setServiceCategoryId] = useState(null);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
      };
      if (serviceCategoryId != null && serviceCategoryId !== "") {
        params.serviceCategoryId = serviceCategoryId;
      }
      const res = await ServicesApi.list(params);
      const data = (res?.data?.data ?? res?.data ?? []).map(normalizeItem);
      const totalCount = res?.data?.total ?? 0;
      const sorted = [...data].sort((a, b) => {
        const orderA = a.sortOrder ?? 999;
        const orderB = b.sortOrder ?? 999;
        if (orderA !== orderB) return orderA - orderB;
        return (b.id ?? 0) - (a.id ?? 0);
      });
      setServices(sorted);
      setTotal(totalCount);
    } catch (err) {
      console.error(err);
      setError("Не удалось загрузить услуги");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, serviceCategoryId]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handlePageChange = (_, newPage) => setPage(newPage);

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const setCategoryFilter = (categoryId) => {
    setServiceCategoryId(categoryId ?? null);
    setPage(0);
  };

  const refresh = () => fetchServices();

  return {
    services,
    total,
    loading,
    error,
    page,
    rowsPerPage,
    serviceCategoryId,
    setCategoryFilter,
    handlePageChange,
    handleRowsPerPageChange,
    refresh,
  };
};
