'use client';

import type { ReactNode } from 'react';
import localFont from 'next/font/local';
import Footer from '@/components/Footer';
import CityProvider from '@/components/cities/CityProvider';

import '@/styles/globals.css';

const inter = localFont({
  src: [
    {
      path: '../public/fonts/Inter/Inter-VariableFont_opsz,wght.ttf',
      style: 'normal',
    },
    {
      path: '../public/fonts/Inter/Inter-Italic-VariableFont_opsz,wght.ttf',
      style: 'italic',
    },
  ],
  display: 'swap',
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <CityProvider>
          <main>{children}</main>
          <Footer />
        </CityProvider>
      </body>
    </html>
  );
}

