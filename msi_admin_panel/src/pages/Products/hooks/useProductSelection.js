import { useState, useCallback } from "react";

export const useProductSelection = () => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [expandedProductId, setExpandedProductId] = useState(null);

  const handleSelect = useCallback((productId, checked) => {
    setSelectedProducts((prev) =>
      checked ? [...prev, productId] : prev.filter((id) => id !== productId)
    );
  }, []);

  const handleSelectAll = useCallback((productIds, checked) => {
    setSelectedProducts(checked ? productIds : []);
  }, []);

  const toggleExpand = useCallback((id) => {
    setExpandedProductId((prev) => (prev === id ? null : id));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedProducts([]);
  }, []);

  return {
    selectedProducts,
    expandedProductId,
    handleSelect,
    handleSelectAll,
    toggleExpand,
    clearSelection,
    setSelectedProducts,
  };
};
