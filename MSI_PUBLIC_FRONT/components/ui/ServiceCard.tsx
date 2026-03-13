import Image from 'next/image';
import Link from 'next/link';
import { ReactNode } from 'react';

interface ServiceCardProps {
  href?: string;
  number: string;
  title: string;
  imageSrc: string;
  imageAlt: string;
  items: ReactNode[];
}

export function ServiceCard({
  href,
  number,
  title,
  imageSrc,
  imageAlt,
  items,
}: ServiceCardProps) {
  return (
    <Link
      href={href || '#'}
      className="no-underline service-card"
      style={{ textDecoration: 'none' }}
    >
      <div
        style={{
          backgroundColor: 'var(--color-light-green)',
          borderRadius: '12px',
          padding: '24px',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        {/* Number */}
        <div className="h4-regular" style={{ color: 'var(--color-blue)' }}>
          {number}
        </div>

        {/* Content */}
        <div
          style={{
            display: 'flex',
            gap: '24px',
            maxWidth: '680px',
          }}
        >
          {/* Image */}
          <div
            style={{
              width: '328px',
              borderRadius: '12px',
              flexShrink: 0,
              overflow: 'hidden',
            }}
          >
            <Image
              src={imageSrc}
              alt={imageAlt}
              width={328}
              height={206}
              style={{ objectFit: 'cover' }}
            />
          </div>

          {/* Text */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              flex: 1,
              minWidth: 0,
            }}
          >
            <h3 className="h3-bold" style={{ color: 'var(--color-dark)' }}>
              {title}
            </h3>

            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              {items.map((item, index) => (
                <li
                  key={index}
                  style={{
                    paddingLeft: '20px',
                    position: 'relative',
                    color: 'var(--color-dark)',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: '6px',
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-dark)',
                    }}
                  />
                  <p>{item}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ====== Arrow icon ====== */}
          <div
          style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
          }}
          >
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1.20625 8.00499L6.79125 2.41999L6.79125 7.29999C6.79125 7.68999 7.11125 8.00999 7.50125 8.00999C7.89125 8.00999 8.20625 7.69499 8.20625 7.30499L8.20625 0.714989C8.20625 0.324989 7.89125 0.00998932 7.50125 0.00998966L0.911254 -1.01736e-05C0.521254 -9.84695e-06 0.206254 0.31499 0.206254 0.70499C0.206254 1.09499 0.521254 1.40999 0.911254 1.40999L5.79125 1.41999L0.206254 7.00499C-0.0687463 7.27999 -0.0687462 7.72999 0.206254 8.00499C0.481254 8.27999 0.931253 8.27999 1.20625 8.00499Z" fill="white"/>
          </svg>
          </div>
      </div>
    </Link>
  );
}
