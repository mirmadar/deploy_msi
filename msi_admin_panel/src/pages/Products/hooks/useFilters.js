// src/pages/Products/hooks/useFilters.js
import { useState, useEffect } from "react";
import { getFilters } from "src/api/search.api";

export const useFilters = () => {
  const [filters, setFilters] = useState(null);

  useEffect(() => {
    getFilters().then(setFilters);
  }, []);

  return filters;
};
