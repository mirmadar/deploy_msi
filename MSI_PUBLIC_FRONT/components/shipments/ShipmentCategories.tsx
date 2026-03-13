'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ShipmentCategory } from '@/types/api';

// Хук для медиа-запросов
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

export function ShipmentCategories({
  categories,
  active,
  onSelect,
}: {
  categories: ShipmentCategory[];
  active?: string;
  onSelect: (slug?: string) => void;
}) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isOpen, setIsOpen] = useState(false);

  const baseButton =
    'card-shadow relative group text-left bg-white px-4 py-2 rounded-lg transition-all duration-200 hover:text-[var(--color-green)] hover:bg-[var(--color-light-green)]';

  const activeButton =
    'bg-[var(--color-light-green)] text-[var(--color-green)] font-semibold';

  // На десктопе рендерим обычный список
  if (!isMobile) {
    return (
      <div className="flex flex-col gap-2">
        <button
          onClick={() => onSelect(undefined)}
          className={`${baseButton} ${!active ? activeButton : ''}`}
        >
          Все
        </button>

        {categories.map((c) => (
          <button
            key={c.slug}
            onClick={() => onSelect(c.slug)}
            className={`${baseButton} ${
              active === c.slug ? activeButton : ''
            }`}
          >
            <p className="truncate">{c.name}</p>
            <span
              className="
                pointer-events-none
                absolute
                bottom-full
                left-1/2
                -translate-x-1/2
                mb-2
                z-[9999]
                whitespace-nowrap
                rounded-md
                bg-black
                px-3
                py-1.5
                text-xs
                text-white
                opacity-0
                shadow-xl
                transition-all
                duration-200
                scale-95
                group-hover:opacity-100
                group-hover:scale-100
              "
            >
              {c.name}
            </span>
          </button>
        ))}
      </div>
    );
  }

  // Мобильная версия: кнопка и модалка
  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  // Название активной категории для отображения на кнопке (опционально)
  const activeCategory = categories.find((c) => c.slug === active);

  return (
    <>
      <button
        onClick={handleOpen}
        className="
          flex items-center justify-between gap-2 w-full px-4 py-3
          bg-white border border-[var(--color-light-gray)] rounded-lg shadow-lg
          text-left text-[var(--color-dark)] font-medium
          hover:bg-[var(--color-light-green)] transition-colors
        "
      >
        <span className="flex items-center gap-2">
          Категории
        </span>
        {activeCategory && (
          <span className="text-sm text-[var(--color-gray)] truncate max-w-[150px]">
            {activeCategory.name}
          </span>
        )}
      </button>

      {isOpen &&
        createPortal(
          <MobileCategories
            categories={categories}
            active={active}
            onSelect={(slug) => {
              onSelect(slug);
              handleClose();
            }}
            onClose={handleClose}
          />,
          document.body
        )}
    </>
  );
}

// Мобильная модалка со списком категорий
function MobileCategories({
  categories,
  active,
  onSelect,
  onClose,
}: {
  categories: ShipmentCategory[];
  active?: string;
  onSelect: (slug?: string) => void;
  onClose: () => void;
}) {
  // Блокируем прокрутку body при открытой модалке
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const baseButton =
    'w-full text-left px-4 py-3 rounded-lg transition-colors hover:bg-[var(--color-light-green)]';
  const activeButton = 'bg-[var(--color-light-green)] text-[var(--color-green)] font-semibold';

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[1000] flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-h-[90vh] rounded-t-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Заголовок */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-light-gray)]">
          <h3 className="text-lg font-semibold text-[var(--color-dark)]">Категории</h3>
          <button onClick={onClose} className="p-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Список категорий с прокруткой */}
        <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-1">
          <button
            onClick={() => onSelect(undefined)}
            className={`${baseButton} ${!active ? activeButton : ''}`}
          >
            Все
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              onClick={() => onSelect(c.slug)}
              className={`${baseButton} ${active === c.slug ? activeButton : ''}`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Кнопка "Готово" для закрытия */}
        <div className="p-4 border-t border-[var(--color-light-gray)]">
          <button
            onClick={onClose}
            className="w-full py-3 bg-[var(--color-green)] text-white font-semibold rounded-lg"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
}