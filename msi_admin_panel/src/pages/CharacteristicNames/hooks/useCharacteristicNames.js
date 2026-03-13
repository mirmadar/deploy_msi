import { useState, useEffect, useCallback } from "react";
import { CharacteristicNamesApi } from "../../../api/characteristic-names.api";

export const useCharacteristicNames = (initialPage = 0, initialRowsPerPage = 25) => {
  const [characteristicNames, setCharacteristicNames] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState('asc');

  const fetchCharacteristicNames = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: String(page + 1),
        limit: String(rowsPerPage),
        sortOrder: sortOrder,
      };
      
      if (search && search.trim()) {
        params.search = search.trim();
      }
      
      const res = await CharacteristicNamesApi.list(params);
      // Бэкенд может возвращать { data: [...], total: ... } или просто массив
      const data = res?.data?.data || res?.data || [];
      const totalCount = res?.data?.total || data.length;
      
      // Бэкенд уже сортирует по алфавиту (orderBy: { name: 'asc' }), используем данные как есть
      setCharacteristicNames(data);
      setTotal(totalCount);
    } catch (err) {
      console.error(err);
      setError("Не удалось загрузить названия характеристик");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, sortOrder]);

  useEffect(() => {
    fetchCharacteristicNames();
  }, [fetchCharacteristicNames]);

  const handlePageChange = (_, newPage) => setPage(newPage);

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(0);
  };

  const handleSortOrderChange = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    setPage(0);
  };

  const refresh = () => fetchCharacteristicNames();

  return {
    characteristicNames,
    total,
    loading,
    error,
    page,
    rowsPerPage,
    search,
    sortOrder,
    setPage,
    setRowsPerPage,
    setSearch: handleSearchChange,
    handleSortOrderChange,
    handlePageChange,
    handleRowsPerPageChange,
    refresh,
  };
};

