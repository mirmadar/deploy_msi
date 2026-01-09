'use client';

import { useState, FormEvent, ChangeEvent } from 'react';

interface RequestFormProps {
  onSubmit: (data: { name: string; phone: string; document?: File }) => Promise<void>;
}

export default function RequestForm({ onSubmit }: RequestFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [document, setDocument] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
      if (validTypes.includes(file.type)) {
        setDocument(file);
        setError(null);
      } else {
        setError('Пожалуйста, загрузите PDF или DOCX файл');
        setDocument(null);
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Имя обязательно для заполнения');
      return;
    }

    if (!phone.trim()) {
      setError('Телефон обязателен для заполнения');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        phone: phone.trim(),
        document: document || undefined,
      });
      // Reset form
      setName('');
      setPhone('');
      setDocument(null);
      if (typeof window !== 'undefined') {
        const fileInput = window.document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при отправке');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div
          style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            color: '#991b1b',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
          }}
        >
          {error}
        </div>
      )}

      {/* Inputs in a row */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}
      >
        {/* Name input */}
        <div style={{ flex: '1', minWidth: '200px' }}>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Имя*"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '14px 16px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              fontSize: '16px',
              color: '#0f172a',
              outline: 'none',
            }}
          />
        </div>

        {/* Phone input */}
        <div style={{ flex: '1', minWidth: '200px' }}>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Номер телефона*"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '14px 16px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              fontSize: '16px',
              color: '#0f172a',
              outline: 'none',
            }}
          />
        </div>

        {/* Upload document button */}
        <label
          htmlFor="document"
          style={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
          }}
        >
          <input
            type="file"
            id="document"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            disabled={isSubmitting}
          />
          <button
            type="button"
            style={{
              padding: '14px 24px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: '#bfdbfe',
              color: '#1e40af',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <svg
              style={{ width: '20px', height: '20px' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            Загрузить документ
          </button>
        </label>
        {document && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#ffffff',
              fontSize: '14px',
            }}
          >
            <svg
              style={{ width: '20px', height: '20px' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {document.name}
          </div>
        )}
      </div>

      {/* Consent text */}
      <p
        style={{
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: '12px',
          marginBottom: '24px',
          lineHeight: '1.5',
        }}
      >
        Нажимая на кнопку «Заказать звонок», Вы даете Согласие на обработку данных и соглашаетесь с{' '}
        <a
          href="#"
          style={{
            color: '#ffffff',
            textDecoration: 'underline',
            textDecorationColor: 'rgba(255, 255, 255, 0.5)',
          }}
        >
          Политикой конфиденциальности
        </a>
      </p>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          width: '100%',
          padding: '16px 32px',
          border: 'none',
          borderRadius: '8px',
          backgroundColor: '#14b8a6',
          color: '#ffffff',
          fontSize: '18px',
          fontWeight: '600',
          cursor: isSubmitting ? 'not-allowed' : 'pointer',
          opacity: isSubmitting ? 0.7 : 1,
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          if (!isSubmitting) {
            e.currentTarget.style.backgroundColor = '#0d9488';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#14b8a6';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        {isSubmitting ? 'Отправка...' : 'Заказать звонок'}
      </button>
    </form>
  );
}
