'use client';

import '@/styles/globals.css';
import { PageHeader } from '@/components/ui/PageHeader';
import { useCitySlug, useCityName, useCityPhone } from '@/components/cities/CityProvider';
import { ROUTES } from '@/lib/constants';

export default function ContactsPage() {
    const cityName = useCityName();
    const cityPhone = useCityPhone();
    const citySlug = useCitySlug();
    return (
        <div>
            <section className="standart">
                    {/* ===== Навигация и Заголовок ===== */}
                    <PageHeader
                        title={`Контакты для города ${cityName}`}
                        breadcrumbs={[
                        { label: 'Главная', href: `${ROUTES.HOME(citySlug)}` },
                        { label: 'Контакты' },
                        ]}
                    />

                    {/* ===== Номер телефона и email ===== */}
                    <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '24px',
                    }}>
                        {/* ===== Номер телефона ===== */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            padding: '16px',
                            borderRadius: '16px',
                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                            width: '100%',
                            justifyContent: 'center', 
                            alignItems: 'center',
                            flex: '1 1 300px',
                        }}>
                            <p style={{
                                color: 'var(--color-gray)',
                            }}>
                                Номер телефона
                            </p>

                            <p className='h4-regular' style={{
                                color: 'var(--color-green)',
                            }}>
                                {cityPhone}
                            </p>
                        </div>

                        {/* ===== Номер телефона ===== */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            padding: '16px',
                            borderRadius: '16px',
                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                            width: '100%',
                            justifyContent: 'center', 
                            alignItems: 'center',
                            flex: '1 1 300px',
                        }}>
                            <p style={{
                                color: 'var(--color-gray)',
                            }}>
                                Электронная почта
                            </p>

                            <p className='h4-regular' style={{
                                color: 'var(--color-green)',
                            }}>
                                INFO.PO-MSR@mail.ru
                            </p>
                        </div>
                    </div>

                    <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '24px',
                            marginTop: '32px',
                            padding: '24px',
                            borderRadius: '16px',
                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                            width: '100%',
                    }}>
                        <p className='h4-regular'>Реквизиты компании</p>

                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                        }}>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'row',
                                gap: '8px',
                            }}>
                                <p style={{ color: 'var(--color-gray)' }}>Название организации:</p>
                                <p>ОБЩЕСТВО С ОГРАНИЧЕННОЙ ОТВЕТСТВЕННОСТЬЮ ПРОИЗВОДСТВЕННОЕ ОБЪЕДИНЕНИЕ "МЕТАЛЛСТРОЙИНВЕСТ"</p>
                            </div>

                            <div style={{
                                display: 'flex',
                                flexDirection: 'row',
                                gap: '8px',
                            }}>
                                <p style={{ color: 'var(--color-gray)' }}>Юридический адрес:</p>
                                <p>603001, г.  Нижний Новгород , наб.Нижне-Волжская, дом 5/2, офис 8</p>
                            </div>

                            <div style={{
                                display: 'flex',
                                flexDirection: 'row',
                                gap: '8px',
                            }}>
                                <p style={{ color: 'var(--color-gray)' }}>ИНН:</p>
                                <p>5260477690</p>
                            </div>

                            <div style={{
                                display: 'flex',
                                flexDirection: 'row',
                                gap: '8px',
                            }}>
                                <p style={{ color: 'var(--color-gray)' }}>КПП:</p>
                                <p>526001001</p>
                            </div>

                            <div style={{
                                display: 'flex',
                                flexDirection: 'row',
                                gap: '8px',
                            }}>
                                <p style={{ color: 'var(--color-gray)' }}>ОГРН:</p>
                                <p>1215200015799</p>
                            </div>

                            <div style={{
                                display: 'flex',
                                flexDirection: 'row',
                                gap: '8px',
                            }}>
                                <p style={{ color: 'var(--color-gray)' }}>Почтовый адрес:</p>
                                <p>603001, г. Нижний Новгород, наб.Нижне-Волжская, дом 5/2, офис 8</p>
                            </div>

                            <div style={{
                                display: 'flex',
                                flexDirection: 'row',
                                gap: '8px',
                            }}>
                                <p style={{ color: 'var(--color-gray)' }}>Р/с:</p>
                                <p>40702810829050007753</p>
                            </div>

                            <div style={{
                                display: 'flex',
                                flexDirection: 'row',
                                gap: '8px',
                            }}>
                                <p style={{ color: 'var(--color-gray)' }}>К/с:</p>
                                <p>30101810200000000824</p>
                            </div>

                            <div style={{
                                display: 'flex',
                                flexDirection: 'row',
                                gap: '8px',
                            }}>
                                <p style={{ color: 'var(--color-gray)' }}>БИК:</p>
                                <p>042202824</p>
                            </div>

                            <div style={{
                                display: 'flex',
                                flexDirection: 'row',
                                gap: '8px',
                            }}>
                                <p style={{ color: 'var(--color-gray)' }}>Банк:</p>
                                <p>ФИЛИАЛ "НИЖЕГОРОДСКИЙ" АО "АЛЬФА-БАНК"</p>
                            </div>

                            <div style={{
                                display: 'flex',
                                flexDirection: 'row',
                                gap: '8px',
                            }}>
                                <p style={{ color: 'var(--color-gray)' }}>Директор:</p>
                                <p>Сурчалов Артем Валерьевич</p>
                            </div>
                        </div>
                    </div>
            </section>
        </div>
    );
}