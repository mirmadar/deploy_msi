import { useEffect, useState } from "react";
import { ProductsApi } from "../api/products.api";
import { FALLBACK_PRODUCT_UNITS } from "../utils/productUnits";

export const useProductUnits = () => {
  const [units, setUnits] = useState(FALLBACK_PRODUCT_UNITS);

  useEffect(() => {
    let isMounted = true;

    const fetchUnits = async () => {
      try {
        const response = await ProductsApi.getUnits();
        const data = response?.data;
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setUnits(
            data
              .filter((item) => item?.value)
              .map((item) => ({
                value: item.value,
                label: item.label || item.value,
              })),
          );
        }
      } catch (error) {
        // Keep fallback values if API is unavailable.
      }
    };

    fetchUnits();

    return () => {
      isMounted = false;
    };
  }, []);

  return units;
};
