import { useState, useEffect, useCallback } from "react";
import { ArticlesApi } from "../../../api/articles.api";

export const useArticles = (initialPage = 0, initialRowsPerPage = 25) => {
  const [articles, setArticles] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: String(page + 1),
        pageSize: String(rowsPerPage),
      };

      const res = await ArticlesApi.list(params);
      // Бэкенд возвращает { data: [...], total: ... }
      const data = res?.data?.data || res?.data || [];
      const totalCount = res?.data?.total || data.length;

      setArticles(data);
      setTotal(totalCount);
    } catch (err) {
      console.error(err);
      setError("Не удалось загрузить статьи");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handlePageChange = (_, newPage) => setPage(newPage);

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const refresh = () => fetchArticles();

  return {
    articles,
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


