'use client';

import '@/styles/globals.css';
import { PageHeader } from '@/components/ui/PageHeader';
import { ROUTES } from '@/lib/constants';
import { useCitySlug } from '@/components/cities/CityProvider';
import { PaginatedResponse, ShipmentCategory, ShipmentPost } from '@/types/api';
import { ShipmentCategories } from '@/components/shipments/ShipmentCategories';
import { ShipmentCard } from '@/components/shipments/ShipmentCard';
import { apiClient } from '@/lib/api';
import { useEffect, useState } from 'react';


export default function ShipmentsPage() {
    const citySlug = useCitySlug();

    const [categories, setCategories] = useState<ShipmentCategory[]>([]);
    const [posts, setPosts] = useState<ShipmentPost[]>([]);
    const [active, setActive] = useState<string>();
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<PaginatedResponse<ShipmentPost>>();
    const totalPages =
        pagination?.totalPages ??
        Math.ceil(pagination?.total! / (pagination?.pageSize ?? 1));


    useEffect(() => {
        apiClient.getShipmentCategories(citySlug).then(setCategories);
    }, []);

    useEffect(() => {
        const load = async () => {
        const res = active
            ? await apiClient.getShipmentPosts(citySlug, { categorySlug: active, page })
            : await apiClient.getShipmentPosts(citySlug, { page });

        setPosts(res.data);
        setPagination(res);
        };

        load();
    }, [active, page]);

    
    return (
        <div>
            <section className='standart'>

                {/* ===== Навигация и Заголовок ===== */}
                <PageHeader
                    title="Отгрузки"
                    breadcrumbs={[
                    { label: 'Главная', href: `${ROUTES.HOME(citySlug)}` },
                    { label: 'Отгрузки' },
                    ]}
                />

                <div className="flex flex-col lg:flex-row gap-8">
                {/* Категории */}
                <aside className="lg:w-64">
                <ShipmentCategories
                    categories={categories}
                    active={active}
                    onSelect={(slug) => {
                    setActive(slug);
                    setPage(1);
                    }}
                />
                </aside>

                {/* Посты */}
                <main className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {posts.map((p) => (
                    <ShipmentCard key={p.shipmentPostId} post={p} />
                    ))}
                </div>
                
                {/* Пагинация */}
                {pagination && totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                    {/* Назад */}
                    <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className={`
                        px-4 py-2 rounded-lg text-sm font-medium transition-all
                        border border-slate-300
                        ${
                        page === 1
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50'
                            : 'bg-white border border-[var(--color-light-gray)]  text-slate-900 hover:bg-slate-50'
                        }
                    `}
                    >
                    Назад
                    </button>

                    {/* Номера страниц */}
                    <div className="flex gap-1">
                    {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                        let pageNum;

                        if (totalPages <= 5) {
                            pageNum = i + 1;
                        } else if (page <= 3) {
                            pageNum = i + 1;
                        } else if (page >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                        } else {
                            pageNum = page - 2 + i;
                        }

                        const isActive = page === pageNum;

                        return (
                            <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`
                                px-4 py-2 rounded-lg text-sm font-medium transition-all
                                ${
                                isActive
                                    ? 'bg-[var(--color-green)] text-white'
                                    : 'bg-white border border-[var(--color-light-gray)] text-slate-900 hover:bg-slate-50'
                                }
                            `}
                            >
                            {pageNum}
                            </button>
                        );
                        }
                    )}
                    </div>

                    {/* Вперед */}
                    <button
                    onClick={() =>
                        setPage((p) =>
                        Math.min(totalPages, p + 1)
                        )
                    }
                    disabled={page === totalPages}
                    className={`
                        px-4 py-2 rounded-lg text-sm font-medium transition-all
                        border border-slate-300
                        ${
                        page === totalPages
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50'
                            : 'bg-white border border-[var(--color-light-gray)]  text-slate-900 hover:bg-slate-50'
                        }
                    `}
                    >
                    Вперед
                    </button>
                </div>
                )}

                </main>
            </div>
            </section>
        </div>
    );
}