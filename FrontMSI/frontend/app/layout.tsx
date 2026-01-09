import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/components/Header';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'MetalStroy - Металлические изделия',
  description: 'Каталог металлических изделий и конструкций',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <Header />
        <main>{children}</main>
        <footer
          style={{
            background: 'linear-gradient(90deg, #0d9488 0%, #0284c7 100%)',
            padding: '60px 40px 40px',
            color: '#ffffff',
          }}
        >
          <div
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              width: '100%',
            }}
          >
            {/* Logo and Main Content */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr 1fr',
                gap: '60px',
                marginBottom: '40px',
                alignItems: 'start',
              }}
            >
              {/* Logo */}
              <div>
                <div
                  style={{
                    backgroundColor: '#bfdbfe',
                    borderRadius: '12px',
                    padding: '16px 24px',
                    border: '2px solid #3b82f6',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 32 32"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8 8 L16 4 L24 8 L24 16 L16 20 L8 16 Z"
                        fill="#1e40af"
                      />
                      <path
                        d="M8 16 L16 20 L24 16 L24 24 L16 28 L8 24 Z"
                        fill="#1e40af"
                        opacity="0.8"
                      />
                    </svg>
                  </div>
                  <span
                    style={{
                      color: '#1e40af',
                      fontWeight: 'bold',
                      fontSize: '16px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    МеталлСтройИнвест
                  </span>
                </div>
              </div>

              {/* Contacts Column */}
              <div>
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#ffffff',
                    marginBottom: '20px',
                  }}
                >
                  Контакты
                </h3>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '14px',
                      color: 'rgba(255, 255, 255, 0.9)',
                    }}
                  >
                    <strong style={{ color: '#ffffff' }}>Эл. почта:</strong>{' '}
                    <a
                      href="mailto:INFO.PO-MSR@mail.ru"
                      style={{
                        color: 'rgba(255, 255, 255, 0.9)',
                        textDecoration: 'none',
                      }}
                    >
                      INFO.PO-MSR@mail.ru
                    </a>
                  </div>
                  <div
                    style={{
                      fontSize: '14px',
                      color: 'rgba(255, 255, 255, 0.9)',
                    }}
                  >
                    <strong style={{ color: '#ffffff' }}>Номер телефона:</strong>{' '}
                    <a
                      href="tel:+79101422687"
                      style={{
                        color: 'rgba(255, 255, 255, 0.9)',
                        textDecoration: 'none',
                      }}
                    >
                      +7 (910) 142-26-87
                    </a>
                  </div>
                  <div
                    style={{
                      fontSize: '14px',
                      color: 'rgba(255, 255, 255, 0.9)',
                      lineHeight: '1.6',
                    }}
                  >
                    <strong style={{ color: '#ffffff' }}>Адрес:</strong> 603001, г. Нижний Новгород, наб.
                    Нижне-Волжская, дом 5/2, офис 8
                  </div>
                </div>
              </div>

              {/* Requisites Column */}
              <div>
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#ffffff',
                    marginBottom: '20px',
                  }}
                >
                  Реквизиты
                </h3>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '14px',
                      color: 'rgba(255, 255, 255, 0.9)',
                    }}
                  >
                    ООО «МЕТАЛЛСТРОЙИНВЕСТ»
                  </div>
                  <div
                    style={{
                      fontSize: '14px',
                      color: 'rgba(255, 255, 255, 0.9)',
                    }}
                  >
                    <strong style={{ color: '#ffffff' }}>ИНН:</strong> 5260477690 |{' '}
                    <strong style={{ color: '#ffffff' }}>ОГРН:</strong> 1215200015799
                  </div>
                </div>
              </div>
            </div>

            {/* Legal Links and Disclaimer */}
            <div
              style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                paddingTop: '30px',
                marginTop: '30px',
              }}
            >
              {/* Legal Links */}
              <div
                style={{
                  display: 'flex',
                  gap: '24px',
                  marginBottom: '20px',
                }}
              >
                <a
                  href="#"
                  style={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    textDecoration: 'underline',
                    fontSize: '14px',
                    textDecorationColor: 'rgba(255, 255, 255, 0.5)',
                  }}
                >
                  Пользовательское соглашение
                </a>
                <a
                  href="#"
                  style={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    textDecoration: 'underline',
                    fontSize: '14px',
                    textDecorationColor: 'rgba(255, 255, 255, 0.5)',
                  }}
                >
                  Политика конфиденциальности
                </a>
              </div>

              {/* Disclaimer */}
              <p
                style={{
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  lineHeight: '1.6',
                  marginBottom: '20px',
                  maxWidth: '900px',
                }}
              >
                Информация о товарах, услугах и ценах, предоставленная на сайте, носит исключительно
                информационный характер и ни при каких условиях не является публичной офертой,
                определяемой положениями ст. 437 ГК РФ.
              </p>

              {/* Copyright */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.7)',
                }}
              >
                <div>
                  &copy; {new Date().getFullYear()} МеталлСтройИнвест. Все права защищены.
                </div>
                <a
                  href="#"
                  style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    textDecoration: 'underline',
                    textDecorationColor: 'rgba(255, 255, 255, 0.5)',
                  }}
                >
                  Сайт сделан командой ginseng
                </a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
