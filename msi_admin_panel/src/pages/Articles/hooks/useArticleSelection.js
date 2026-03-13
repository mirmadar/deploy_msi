import { useState, useCallback } from "react";

export const useArticleSelection = () => {
  const [selectedArticles, setSelectedArticles] = useState([]);

  const handleSelect = useCallback((articleId, checked) => {
    setSelectedArticles((prev) =>
      checked ? [...prev, articleId] : prev.filter((id) => id !== articleId)
    );
  }, []);

  const handleSelectAll = useCallback((articleIds, checked) => {
    setSelectedArticles(checked ? articleIds : []);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedArticles([]);
  }, []);

  return {
    selectedArticles,
    handleSelect,
    handleSelectAll,
    clearSelection,
  };
};


