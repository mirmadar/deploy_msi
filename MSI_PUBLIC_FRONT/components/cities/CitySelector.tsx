'use client';

import type { City } from '@/types/api';

interface CitySelectorProps {
  isOpen: boolean;
  cities: City[];
  selectedCity: City | null;
  onSelect: (city: City) => void;
  onClose: () => void;
}

export default function CitySelector({
  isOpen,
  cities,
  selectedCity,
  onSelect,
  onClose,
}: CitySelectorProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-md max-h-[80vh] flex flex-col">
        
        {/* Заголовок + крестик */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold m-0">Вы в этом городе?</h2>
          <button
            onClick={onClose}
            className="text-gray-500 leading-none hover:text-gray-700"
          >
            &times;
          </button>
        </div>

        {/* Список городов */}
        <div className="overflow-y-auto max-h-[60vh]">
          <ul className="grid gap-2 auto-rows-max 
                         sm:grid-cols-1 
                         md:grid-cols-2">
            {cities.map(city => (
              <li key={city.cityId}>
                <button
                  onClick={() => onSelect(city)}
                  className={`px-3 py-2 rounded-lg border border-[var(--color-light-gray)] cursor-pointer whitespace-nowrap w-full text-left 
                    ${city.slug === selectedCity?.slug ? 'bg-[var(--color-light-green)] border-transparent' : 'bg-white'}`}
                >
                  {city.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
