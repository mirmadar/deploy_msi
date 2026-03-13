'use client';

import { useState, FormEvent } from 'react';
import { getErrorMessage } from '@/lib/api';

interface StickyOrderFormProps {
  title?: string;
  description?: string;
  onSubmit: (data: { name: string; phone: string }) => Promise<void>;
  className?: string;
}

export default function StickyOrderForm({
  title = 'Узнать цену и условия',
  description = 'Оставьте контакты — перезвоним и обсудим заказ лично.',
  onSubmit,
  className = '',
}: StickyOrderFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !phone.trim()) {
      setError('Укажите имя и телефон');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({ name: name.trim(), phone: phone.trim() });
      setSuccess(true);
      setName('');
      setPhone('');
    } catch (err) {
      setError(getErrorMessage(err, 'Ошибка отправки'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <aside
      className={`
        w-full
        lg:max-w-[340px]
        lg:sticky lg:top-40
        ${className}
      `}
    >
      <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
        <h3 className="text-lg font-semibold text-slate-900 mb-1">
          {title}
        </h3>

        <p className="text-sm text-gray-500 mb-5">
          {description}
        </p>

        {success ? (
          <p className="text-teal-600 font-medium">
            Заявка отправлена. Мы свяжемся с вами в ближайшее время.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">
                Имя
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ваше имя"
                className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">
                Телефон
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 (___) ___-__-__"
                className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="py-3 rounded-lg bg-gradient-to-r from-teal-600 to-teal-400 text-white font-semibold disabled:opacity-60 hover:opacity-90 transition"
            >
              {submitting ? 'Отправка...' : 'Оставить заявку'}
            </button>
          </form>
        )}
      </div>
    </aside>
  );
}
