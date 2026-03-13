import { useState, useEffect, useCallback } from "react";
import { CitiesApi } from "../../../api/cities.api";

export const useCities = (initialPage = 0, initialRowsPerPage = 25) => {
  const [cities, setCities] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const [sortOrder, setSortOrder] = useState('asc');

  const fetchCities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: String(page + 1),
        pageSize: String(rowsPerPage),
        sortOrder: sortOrder,
      };
      
      const res = await CitiesApi.list(params);
      // Бэкенд возвращает { data: [...], total, page, pageSize }
      const data = res?.data?.data || [];
      const totalCount = res?.data?.total || 0;
      
      setCities(data);
      setTotal(totalCount);
    } catch (err) {
      console.error(err);
      setError("Не удалось загрузить города");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, sortOrder]);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  const handlePageChange = (_, newPage) => setPage(newPage);

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleSortOrderChange = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    setPage(0);
  };

  const refresh = () => fetchCities();

  return {
    cities,
    total,
    loading,
    error,
    page,
    rowsPerPage,
    sortOrder,
    handlePageChange,
    handleRowsPerPageChange,
    handleSortOrderChange,
    refresh,
  };
};

