import { useState, useEffect, useCallback } from "react";
import { ProductsApi } from "../../../api/products.api";

export const useProducts = (initialPage = 0, initialRowsPerPage = 25) => {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getInitialStateFromUrl = () => {
    if (typeof window === "undefined") {
      return {
        page: initialPage,
        rowsPerPage: initialRowsPerPage,
        search: "",
        sortBy: "productId",
        sortOrder: "desc",
        filters: {
          categories: [],
          price: null,
          isNew: undefined,
          status: undefined,
          unit: undefined,
        },
      };
    }

    const params = new URLSearchParams(window.location.search);

    const pageParam = parseInt(params.get("page") || "", 10);
    const rowsParam = parseInt(params.get("pageSize") || "", 10);

    const searchParam = params.get("search") || "";
    const sortByParam = params.get("sortBy") || "productId";
    const sortOrderParam = params.get("sortOrder") === "asc" ? "asc" : "desc";

    const categoriesParam = params.get("categories");
    const categories =
      categoriesParam && categoriesParam.trim()
        ? categoriesParam.split(",").map((c) => c.trim()).filter(Boolean)
        : [];

    const minPriceParam = params.get("minPrice");
    const maxPriceParam = params.get("maxPrice");
    const price =
      minPriceParam !== null && maxPriceParam !== null
        ? [Number(minPriceParam), Number(maxPriceParam)]
        : null;

    const isNewParam = params.get("isNew");
    const isNew =
      isNewParam === "true" ? true : isNewParam === "false" ? false : undefined;

    const statusParam = params.get("status") || undefined;
    const unitParam = params.get("unit") || undefined;

    return {
      page: !isNaN(pageParam) && pageParam > 0 ? pageParam - 1 : initialPage,
      rowsPerPage:
        !isNaN(rowsParam) && rowsParam > 0 ? rowsParam : initialRowsPerPage,
      search: searchParam,
      sortBy: sortByParam,
      sortOrder: sortOrderParam,
      filters: {
        categories,
        price,
        isNew,
        status: statusParam,
        unit: unitParam,
      },
    };
  };

  const initialState = getInitialStateFromUrl();

  const [page, setPage] = useState(initialState.page);
  const [rowsPerPage, setRowsPerPage] = useState(initialState.rowsPerPage);
  const [search, setSearch] = useState(initialState.search);
  const [sortBy, setSortBy] = useState(initialState.sortBy);
  const [sortOrder, setSortOrder] = useState(initialState.sortOrder);
  const [filters, setFilters] = useState(initialState.filters);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: page + 1,
        pageSize: rowsPerPage,
        search: search || undefined,
      };

      // Добавляем фильтры по категориям
      console.log("fetchProducts: текущие фильтры:", filters);
      if (filters.categories && filters.categories.length > 0) {
        params.categories = filters.categories;
        console.log("fetchProducts: добавлены категории в параметры:", filters.categories);
      }

      // Добавляем фильтры по цене
      if (filters.price && Array.isArray(filters.price) && filters.price.length === 2) {
        params.minPrice = filters.price[0];
        params.maxPrice = filters.price[1];
      }

      // Добавляем фильтр по новинке
      if (filters.isNew !== undefined) {
        params.isNew = filters.isNew;
      }

      // Добавляем фильтр по статусу
      if (filters.status) {
        params.status = filters.status;
        console.log("useProducts: добавлен статус в параметры:", filters.status);
      }

      // Добавляем фильтр по единице измерения
      if (filters.unit) {
        params.unit = filters.unit;
        console.log("useProducts: добавлена единица измерения в параметры:", filters.unit);
      }

      // Добавляем параметры сортировки
      params.sortBy = sortBy;
      params.sortOrder = sortOrder;

      console.log("useProducts: отправка запроса с параметрами:", params);
      const res = await ProductsApi.list(params);
      console.log("useProducts: получен ответ, товаров:", res.data.data?.length || 0, "всего:", res.data.total || 0);
      setProducts(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error(err);
      setError("Ошибка при загрузке товаров");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, filters, sortBy, sortOrder]);

  // Синхронизация состояния фильтров/поиска/страницы с URL,
  // чтобы при обновлении страницы сохранялись параметры.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);

    params.set("page", String(page + 1));
    params.set("pageSize", String(rowsPerPage));

    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }

    if (filters.categories && filters.categories.length > 0) {
      params.set("categories", filters.categories.join(","));
    } else {
      params.delete("categories");
    }

    if (filters.price && Array.isArray(filters.price) && filters.price.length === 2) {
      params.set("minPrice", String(filters.price[0]));
      params.set("maxPrice", String(filters.price[1]));
    } else {
      params.delete("minPrice");
      params.delete("maxPrice");
    }

    if (filters.isNew !== undefined) {
      params.set("isNew", String(filters.isNew));
    } else {
      params.delete("isNew");
    }

    if (filters.status) {
      params.set("status", filters.status);
    } else {
      params.delete("status");
    }

    if (filters.unit) {
      params.set("unit", filters.unit);
    } else {
      params.delete("unit");
    }

    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", newUrl);
  }, [page, rowsPerPage, search, filters, sortBy, sortOrder]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handlePageChange = (_, newPage) => setPage(newPage);

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(0);
  };

  const handleFiltersChange = (newFilters) => {
    console.log("handleFiltersChange: получены новые фильтры:", newFilters);
    setFilters(newFilters);
    setPage(0);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      // Если уже сортируем по этому полю, меняем порядок
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Если новое поле, устанавливаем его и порядок по умолчанию
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(0);
  };

  const refresh = () => fetchProducts();

  return {
    products,
    total,
    loading,
    error,
    page,
    rowsPerPage,
    search,
    filters,
    sortBy,
    sortOrder,
    setPage,
    setRowsPerPage,
    setSearch: handleSearchChange,
    setFilters: handleFiltersChange,
    handleSort,
    handlePageChange,
    handleRowsPerPageChange,
    refresh,
  };
};
