import { useState, useEffect, useCallback } from "react";
import { CategoriesApi } from "../../../api/categories.api";

export const useCategories = (initialPage = 0, initialRowsPerPage = 25) => {
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  // Кэш загруженных дочерних категорий: { parentId: [children] }
  const [childrenCache, setChildrenCache] = useState({});
  // Флаги загрузки дочерних категорий: { parentId: boolean }
  const [loadingChildren, setLoadingChildren] = useState({});

  // Загрузка корневых категорий (parentId = null)
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Загружаем только корневые категории (parentId = null)
      // parentId: null будет преобразован в "null" в API
      const res = await CategoriesApi.list({
        page: page + 1,
        limit: rowsPerPage,
        parentId: null, // Только корневые категории
      });

      // Бэкенд возвращает { data: [...], total: ... }
      const data = res?.data?.data || [];
      const totalCount = res?.data?.total || 0;

      // Бэкенд отдаёт уже по sortOrder; сохраняем порядок
      const sorted = [...data].sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));

      setCategories(sorted);
      setTotal(totalCount);
    } catch (err) {
      console.error(err);
      setError("Не удалось загрузить категории товаров");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  // Загрузка дочерних категорий для конкретной категории
  // forceRefetch = true — игнорировать кэш и загрузить заново (после move)
  const fetchChildren = useCallback(
    async (parentId, forceRefetch = false) => {
      if (!forceRefetch && childrenCache[parentId]) {
        return childrenCache[parentId];
      }

      if (loadingChildren[parentId]) {
        return null;
      }

      setLoadingChildren((prev) => ({ ...prev, [parentId]: true }));

      try {
        const res = await CategoriesApi.getChildren(parentId, {
          limit: 200,
        });
        const data = res?.data?.data || [];

        // Бэкенд отдаёт уже по sortOrder; локальная сортировка по hasChildren для совместимости
        const sorted = [...data].sort((a, b) => {
          const aHasChildren = a.hasChildren || false;
          const bHasChildren = b.hasChildren || false;
          if (aHasChildren && !bHasChildren) return 1;
          if (!aHasChildren && bHasChildren) return -1;
          return (a.sortOrder ?? 999) - (b.sortOrder ?? 999);
        });

        setChildrenCache((prev) => ({ ...prev, [parentId]: sorted }));
        return sorted;
      } catch (err) {
        console.error("Ошибка загрузки дочерних категорий:", err);
        return [];
      } finally {
        setLoadingChildren((prev) => {
          const newState = { ...prev };
          delete newState[parentId];
          return newState;
        });
      }
    },
    [childrenCache, loadingChildren]
  );

  // Принудительно перезагрузить дочерние категории (после сдвига порядка)
  const refetchChildren = useCallback(
    async (parentId) => {
      setChildrenCache((prev) => {
        const next = { ...prev };
        delete next[parentId];
        return next;
      });
      return fetchChildren(parentId, true);
    },
    [fetchChildren]
  );

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handlePageChange = (_, newPage) => setPage(newPage);

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const refresh = () => {
    setChildrenCache({});
    fetchCategories();
  };

  return {
    categories,
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
    fetchChildren,
    refetchChildren,
    childrenCache,
    loadingChildren,
  };
};
