'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/lib/api';
import { ProductUnitOption } from '@/types/api';

export function useProductUnits(citySlug: string) {
  const [units, setUnits] = useState<ProductUnitOption[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadUnits = async () => {
      try {
        const data = await apiClient.getProductUnits(citySlug);
        if (isMounted && Array.isArray(data)) {
          setUnits(
            data
              .filter((item) => item?.value)
              .map((item) => ({
                value: item.value,
                label: item.label || item.value,
              })),
          );
        }
      } catch {
        // If endpoint is unavailable, fallback in formatter will show raw unit value.
      }
    };

    if (citySlug) {
      loadUnits();
    }

    return () => {
      isMounted = false;
    };
  }, [citySlug]);

  const unitLabels = useMemo(() => {
    return units.reduce<Record<string, string>>((acc, item) => {
      acc[item.value] = item.label;
      return acc;
    }, {});
  }, [units]);

  return { units, unitLabels };
}
