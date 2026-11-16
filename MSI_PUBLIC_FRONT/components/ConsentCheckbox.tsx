'use client';

import { useId } from 'react';
import {
  CONSENT_PERSONAL_DATA_PDF_URL,
  PRIVACY_POLICY_PDF_URL,
  USER_AGREEMENT_PDF_URL,
} from '@/lib/constants';

interface ConsentCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  tone?: 'light' | 'dark';
}

export default function ConsentCheckbox({
  checked,
  onChange,
  disabled = false,
  tone = 'dark',
}: ConsentCheckboxProps) {
  const id = useId();
  const textColor = tone === 'light' ? 'rgba(255, 255, 255, 0.95)' : '#475569';
  const linkColor = tone === 'light' ? '#ffffff' : 'var(--color-green)';

  return (
    <label
      htmlFor={id}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        margin: 0,
      }}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        style={{
          marginTop: '2px',
          width: '16px',
          height: '16px',
          flexShrink: 0,
          accentColor: tone === 'light' ? '#ffffff' : 'var(--color-green)',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      />
      <span style={{ color: textColor, fontSize: '12px', lineHeight: 1.45 }}>
        Я даю{' '}
        <a
          href={CONSENT_PERSONAL_DATA_PDF_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: linkColor, textDecoration: 'underline' }}
        >
          согласие на обработку персональных данных
        </a>{' '}
        и подтверждаю, что ознакомлен(а) с{' '}
        <a
          href={PRIVACY_POLICY_PDF_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: linkColor, textDecoration: 'underline' }}
        >
          политикой обработки персональных данных
        </a>{' '}
        и{' '}
        <a
          href={USER_AGREEMENT_PDF_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: linkColor, textDecoration: 'underline' }}
        >
          пользовательским соглашением
        </a>
      </span>
    </label>
  );
}
