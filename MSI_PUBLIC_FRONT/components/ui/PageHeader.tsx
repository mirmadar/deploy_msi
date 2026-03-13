'use client';

import Link from 'next/link';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  breadcrumbs?: Breadcrumb[];
}

export function PageHeader({ title, breadcrumbs = [] }: PageHeaderProps) {
  return (
    <div className="flex flex-col lg:gap-6 gap-3">
      {breadcrumbs.length > 0 && (
        <nav
          aria-label="Breadcrumb"
          style={{
            fontSize: '14px',
          }}
        >
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;

            return (
              <span key={index}>
                {crumb.href && !isLast ? (
                  <Link
                    href={crumb.href}
                    style={{
                      color: 'var(--color-gray)',
                      textDecoration: 'none',
                    }}
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    style={{
                      color: isLast
                        ? 'var(--color-green)' // ✅ текущая страница
                        : 'var(--color-gray)',
                      fontWeight: isLast ? 600 : 400,
                    }}
                  >
                    {crumb.label}
                  </span>
                )}

                {!isLast && (
                  <span
                    style={{
                      margin: '0 8px',
                      color: 'var(--color-gray)',
                    }}
                  >
                    /
                  </span>
                )}
              </span>
            );
          })}
        </nav>
      )}

      {title != '' && <h2 className="h2-bold text-[var(--color-dark)]">
        {title}
      </h2>}
    </div>
  );
}
