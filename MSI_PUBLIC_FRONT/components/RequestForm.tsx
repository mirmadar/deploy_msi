'use client';

import { useState, FormEvent, ChangeEvent, use } from 'react';
import { ActionButton } from './ui/ActionButton';
import { ROUTES } from '@/lib/constants';
import { getErrorMessage } from '@/lib/api';
import { useCitySlug } from './cities/CityProvider';

interface RequestFormProps {
  onSubmit: (data: { name: string; phone: string; document?: File }) => Promise<void>;
  buttonColor?: string;
  buttonText?: string;
}

export default function RequestForm({ onSubmit, buttonColor = 'var(--color-green)', buttonText = 'var(--color-white)' }: RequestFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [document, setDocument] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const citySlug = useCitySlug();

  const truncate = (text: string, max = 24) =>
  text.length > max ? text.slice(0, max) + '…' : text;

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
      setError(getErrorMessage(err, 'Произошла ошибка при отправке'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}>
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
          flexWrap: 'wrap',
          marginBottom: '16px',
        }}
      >
        {/* Name input */}
        <div style={{ flex: '1', minWidth: '200px' }}>
          <input
            className='name_input'
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
            className='phone_input'
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
          className='upload-label'
          style={{
            padding: '14px 24px',
            borderRadius: '8px',
            color: 'var(--color-green)',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>
            {document ? truncate(document.name, 14) : 'Загрузить документ'}
          </span>
          <input
            type="file"
            id="document"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            disabled={isSubmitting}
          />
        </label>
      </div>

      {/* Consent text */}
      <p
        style={{
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: '12px',
          marginBottom: '16px',
        }}
      >
        Нажимая на кнопку «Заказать звонок», Вы даете <a
          href={ROUTES.PRIVACY(citySlug)}
          className="small"
        >Согласие на обработку данных</a> и соглашаетесь с <a
          href={ROUTES.PRIVACY(citySlug)}
          className="small"
        >Политикой конфиденциальности
        </a>
      </p>

      {/* Submit button */}
      <ActionButton 
        text= {isSubmitting ? 'Отправка...' : 'Заказать звонок'}
        type="submit" 
        disabled={isSubmitting}
        background={buttonColor}
        color={buttonText}
      />

    </form>
  );
}
