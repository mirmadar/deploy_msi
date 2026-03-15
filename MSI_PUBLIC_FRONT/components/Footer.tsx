'use client';

import { ROUTES, CONSENT_PERSONAL_DATA_PDF_URL } from '@/lib/constants';
import Image from 'next/image';
import { useCitySlug } from './cities/CityProvider';

export default function Footer() {
  const citySlug = useCitySlug();

  return (
    <footer className="w-full bg-white bg-[url('/backgrounds/footer-background.png')] bg-center bg-cover rounded-t-3xl overflow-hidden p-8 md:p-14">
      <div className="flex flex-col gap-6 md:gap-10 w-full">
        {/* Logo */}
        <div className="inline-flex items-center gap-2 bg-[var(--color-light-green)] rounded-lg p-2 w-fit">
          <Image
            src="/logo_transparent.png"
            alt="Логотип МеталлСтройИнвест"
            width={47}
            height={31}
          />
          <span className="text-[var(--color-green)] font-extrabold text-xl md:text-2xl whitespace-nowrap">
            МеталлСтройИнвест
          </span>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 md:gap-20">
          {/* Contacts */}
          <div className="flex flex-col gap-4 text-white">
            <h4 className="text-lg font-semibold">Контакты</h4>
            <div className="flex flex-col gap-2">
              <p>
                Эл. почта: <a href="mailto:INFO.PO-MSR@mail.ru" className="underline">INFO.PO-MSR@mail.ru</a>
              </p>
              <p>
                Телефон: <a href="tel:+79101422687" className="underline">+7 (910) 142-26-87</a>
              </p>
              <p>Адрес: 603001, г. Нижний Новгород, наб. Нижне-Волжская, дом 5/2, офис 8</p>
            </div>
          </div>

          {/* Requisites */}
          <div className="flex flex-col gap-4 text-white">
            <h4 className="text-lg font-semibold">Реквизиты</h4>
            <div className="flex flex-col gap-2">
              <p>ООО «МЕТАЛЛСТРОЙИНВЕСТ»</p>
              <p>ИНН: 5260477690 | ОГРН: 1215200015799</p>
            </div>
          </div>
        </div>

        {/* Legal and Disclaimer */}
        <div className="border-t border-white/20 pt-6 mt-6">
          {/* Links */}
          <div className="flex flex-col md:flex-row gap-2 md:gap-6 mb-5">
            <a href={ROUTES.PRIVACY(citySlug)} className="text-white/90 underline decoration-white/50">
              Пользовательское соглашение
            </a>
            <a href={CONSENT_PERSONAL_DATA_PDF_URL} target="_blank" rel="noopener noreferrer" className="text-white/90 underline decoration-white/50">
              Согласие на обработку персональных данных
            </a>
            <a href={ROUTES.PRIVACY(citySlug)} className="text-white/90 underline decoration-white/50">
              Политика конфиденциальности
            </a>
          </div>

          {/* Disclaimer */}
          <p className="text-white/70 text-xs mb-5 max-w-[900px]">
            Информация о товарах, услугах и ценах, предоставленная на сайте, носит исключительно
            информационный характер и ни при каких условиях не является публичной офертой,
            определяемой положениями ст. 437 ГК РФ.
          </p>

          {/* Copyright */}
          <div className="flex flex-col md:flex-row justify-between items-center text-white/70 text-xs gap-2">
            <div>&copy; {new Date().getFullYear()} МеталлСтройИнвест. Все права защищены.</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
