'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { COOKIE_CONSENT_PDF_URL, YANDEX_METRIKA_ID } from '@/lib/constants';

const STORAGE_KEY = 'msi-cookie-consent';

export default function CookieConsent() {
  const [choice, setChoice] = useState<'accepted' | 'declined' | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'accepted' || stored === 'declined') {
      setChoice(stored);
    }
    setReady(true);
  }, []);

  const saveChoice = (next: 'accepted' | 'declined') => {
    window.localStorage.setItem(STORAGE_KEY, next);
    setChoice(next);
  };

  return (
    <>
      {choice === 'accepted' && (
        <>
          <Script id="yandex-metrika" strategy="afterInteractive">
            {`(function(m,e,t,r,i,k,a){
        m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
    })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=${YANDEX_METRIKA_ID}', 'ym');

    ym(${YANDEX_METRIKA_ID}, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});`}
          </Script>
          <noscript>
            <div>
              <img
                src={`https://mc.yandex.ru/watch/${YANDEX_METRIKA_ID}`}
                style={{ position: 'absolute', left: '-9999px' }}
                alt=""
              />
            </div>
          </noscript>
        </>
      )}

      {ready && choice === null && (
        <div
          role="dialog"
          aria-label="Уведомление о файлах cookie"
          className="cookie-consent"
        >
          <div className="cookie-consent__inner">
            <div className="cookie-consent__content">
              <p className="cookie-consent__text">
                Мы используем файлы cookie и «Яндекс.Метрику», чтобы улучшать работу сайта.
              </p>
              <p className="cookie-consent__details">
                Подробности — в{' '}
                <a
                  href={COOKIE_CONSENT_PDF_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  согласии на использование cookie
                </a>
              </p>
            </div>
            <div className="cookie-consent__actions">
              <button
                type="button"
                className="cookie-consent__btn cookie-consent__btn--ghost"
                onClick={() => saveChoice('declined')}
              >
                Отклонить
              </button>
              <button
                type="button"
                className="cookie-consent__btn cookie-consent__btn--primary"
                onClick={() => saveChoice('accepted')}
              >
                Принять
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
