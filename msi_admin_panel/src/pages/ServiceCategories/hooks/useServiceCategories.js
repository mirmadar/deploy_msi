import { useState, useEffect, useCallback } from "react";
import { ServiceCategoriesApi } from "../../../api/service-categories.api";

// Нормализуем элемент: бэкенд может вернуть id или serviceCategoryId
const normalizeItem = (item) =>
  item
    ? {
        ...item,
        id: item.id ?? item.serviceCategoryId,
      }
    : null;

export const useServiceCategories = (
  initialPage = 0,
  initialRowsPerPage = 25
) => {
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  const [childrenCache, setChildrenCache] = useState({});
  const [loadingChildren, setLoadingChildren] = useState({});

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ServiceCategoriesApi.list({
        page: page + 1,
        limit: rowsPerPage,
        parentId: null,
      });

      const data = (res?.data?.data ?? res?.data ?? []).map(normalizeItem);
      const totalCount = res?.data?.total ?? 0;

      const sorted = [...data].sort((a, b) => {
        const orderA = a.sortOrder ?? 999;
        const orderB = b.sortOrder ?? 999;
        if (orderA !== orderB) return orderA - orderB;
        return (b.id ?? 0) - (a.id ?? 0);
      });

      setCategories(sorted);
      setTotal(totalCount);
    } catch (err) {
      console.error(err);
      setError("Не удалось загрузить категории услуг");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  const fetchChildren = useCallback(
    async (parentId) => {
      if (childrenCache[parentId]) return childrenCache[parentId];
      if (loadingChildren[parentId]) return null;

      setLoadingChildren((prev) => ({ ...prev, [parentId]: true }));

      try {
        const res = await ServiceCategoriesApi.getChildren(parentId, {
          limit: 200,
        });
        const data = (res?.data?.data ?? res?.data ?? []).map(normalizeItem);

        const sorted = [...data].sort((a, b) => {
          const orderA = a.sortOrder ?? 999;
          const orderB = b.sortOrder ?? 999;
          if (orderA !== orderB) return orderA - orderB;
          return (b.id ?? 0) - (a.id ?? 0);
        });

        setChildrenCache((prev) => ({ ...prev, [parentId]: sorted }));
        return sorted;
      } catch (err) {
        console.error("Ошибка загрузки дочерних категорий услуг:", err);
        return [];
      } finally {
        setLoadingChildren((prev) => {
          const next = { ...prev };
          delete next[parentId];
          return next;
        });
      }
    },
    [childrenCache, loadingChildren]
  );

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handlePageChange = (_, newPage) => setPage(newPage);

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const refresh = useCallback(() => {
    setChildrenCache({});
    return fetchCategories();
  }, [fetchCategories]);

  // Только перезапросить корневой список, не трогая кэш детей (после смены порядка)
  const refreshRootOnly = useCallback(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Принудительно перезагрузить детей одного родителя (после смены порядка и т.п.)
  const refetchChildren = useCallback(async (parentId) => {
    setLoadingChildren((prev) => ({ ...prev, [parentId]: true }));
    try {
      const res = await ServiceCategoriesApi.getChildren(parentId, {
        limit: 200,
      });
      const data = (res?.data?.data ?? res?.data ?? []).map(normalizeItem);
      const sorted = [...data].sort((a, b) => {
        const orderA = a.sortOrder ?? 999;
        const orderB = b.sortOrder ?? 999;
        if (orderA !== orderB) return orderA - orderB;
        return (b.id ?? 0) - (a.id ?? 0);
      });
      setChildrenCache((prev) => ({ ...prev, [parentId]: sorted }));
      return sorted;
    } catch (err) {
      console.error("Ошибка загрузки дочерних категорий услуг:", err);
      return [];
    } finally {
      setLoadingChildren((prev) => {
        const next = { ...prev };
        delete next[parentId];
        return next;
      });
    }
  }, []);

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
    refreshRootOnly,
    fetchChildren,
    refetchChildren,
    childrenCache,
    loadingChildren,
  };
};
