import { useState, useCallback } from "react";

export const useServiceSelection = () => {
  const [selectedServices, setSelectedServices] = useState([]);

  const handleSelect = useCallback((serviceId, checked) => {
    setSelectedServices((prev) =>
      checked ? [...prev, serviceId] : prev.filter((id) => id !== serviceId)
    );
  }, []);

  const handleSelectAll = useCallback((serviceIds, checked) => {
    setSelectedServices(checked ? serviceIds : []);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedServices([]);
  }, []);

  return {
    selectedServices,
    handleSelect,
    handleSelectAll,
    clearSelection,
    setSelectedServices,
  };
};
