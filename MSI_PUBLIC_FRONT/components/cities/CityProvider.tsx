'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import type { City } from '@/types/api';
import CitySelector from './CitySelector';
import Header from '@/components/Header';
import CartProvider from '@/components/CartProvider';

type CityContextType = {
  city: City | null;
  setCity: (city: City) => void;
};

const CityContext = createContext<CityContextType | null>(null);

export const useCity = () => {
  const ctx = useContext(CityContext);
  if (!ctx) throw new Error('useCity outside provider');
  return ctx;
};

/** Slug текущего города; при отсутствии города — 'default' (безопасно для ROUTES.*). */
export const useCitySlug = (): string => useCity().city?.slug ?? 'default';

/** Имя и телефон города с fallback на пустую строку (для контактов и т.п.). */
export const useCityName = (): string => useCity().city?.name ?? '';
export const useCityPhone = (): string => useCity().city?.phone ?? '';

export default function CityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [cities, setCities] = useState<City[]>([]);
  const [city, setCityState] = useState<City | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      const list = await apiClient.getCities();
      setCities(list);

      const slug = pathname.split('/')[1];
      const found = list.find(c => c.slug === slug);

      if (found) {
        setCity(found);
      } else {
        setModalOpen(true);
      }

      setReady(true);
    };

    init();
  }, []);

  const setCity = (city: City) => {
    setCityState(city);

    document.cookie = `citySlug=${city.slug}; path=/; max-age=2592000`;

    const rest = pathname.split('/').slice(2).join('/');
    router.push(`/${city.slug}/${rest}`);
  };

  if (!ready) return null;

  return (
    <CityContext.Provider value={{ city, setCity }}>
      <CartProvider>
        <CitySelector
          isOpen={modalOpen}
          cities={cities}
          selectedCity={city}
          onSelect={c => {
            setCity(c);
            setModalOpen(false);
          }}
          onClose={() => setModalOpen(false)}
        />

        <Header
          phone={city?.phone || ''}
          cityName={city?.name || ''}
          citySlug={city?.slug || ''}
          onCityClick={() => setModalOpen(true)}
        />

        {children}
      </CartProvider>
    </CityContext.Provider>
  );
}
