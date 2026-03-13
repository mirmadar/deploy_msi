import { useState, useCallback } from "react";

export const useShipmentSelection = () => {
  const [selectedShipments, setSelectedShipments] = useState([]);

  const handleSelect = useCallback((shipmentPostId, checked) => {
    setSelectedShipments((prev) =>
      checked ? [...prev, shipmentPostId] : prev.filter((id) => id !== shipmentPostId)
    );
  }, []);

  const handleSelectAll = useCallback((shipmentPostIds, checked) => {
    setSelectedShipments(checked ? shipmentPostIds : []);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedShipments([]);
  }, []);

  return {
    selectedShipments,
    handleSelect,
    handleSelectAll,
    clearSelection,
  };
};







