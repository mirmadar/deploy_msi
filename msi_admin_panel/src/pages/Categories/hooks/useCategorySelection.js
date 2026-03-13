import { useState, useCallback } from "react";

export const useCategorySelection = () => {
  const [selectedCategories, setSelectedCategories] = useState([]);

  const handleSelect = useCallback((categoryId, checked) => {
    setSelectedCategories((prev) =>
      checked ? [...prev, categoryId] : prev.filter((id) => id !== categoryId)
    );
  }, []);

  const handleSelectAll = useCallback((categoryIds, checked) => {
    setSelectedCategories(checked ? categoryIds : []);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedCategories([]);
  }, []);

  return {
    selectedCategories,
    handleSelect,
    handleSelectAll,
    clearSelection,
    setSelectedCategories,
  };
};

