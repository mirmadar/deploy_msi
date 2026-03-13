//Параметры для пагинации
export interface PaginationParams {
  page: number;
  pageSize: number;
}

//Результат пагинации
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export function getPaginationSkip(page: number, pageSize: number): number {
  return (page - 1) * pageSize;
}

export interface PaginatedQueryOptions<T, Where = unknown, OrderBy = unknown, Select = unknown> {
  findMany: (args: {
    skip: number;
    take: number;
    where?: Where;
    orderBy?: OrderBy;
    select?: Select;
  }) => Promise<T[]> | { then: (onfulfilled?: (value: T[]) => unknown) => unknown };
  count: (args?: { where?: Where }) => Promise<number> | { then: (onfulfilled?: (value: number) => unknown) => unknown };
  where?: Where;
  orderBy?: OrderBy;
  select?: Select;
  pagination: PaginationParams;
}

export async function paginateQuery<T, Where = unknown, OrderBy = unknown, Select = unknown>(
  options: PaginatedQueryOptions<T, Where, OrderBy, Select>,
): Promise<PaginatedResult<T>> {
  const { findMany, count, where, orderBy, select, pagination } = options;
  const { page, pageSize } = pagination;
  const skip = getPaginationSkip(page, pageSize);

  const [data, total] = await Promise.all([
    findMany({
      skip,
      take: pageSize,
      where,
      orderBy,
      select,
    }),
    count({ where }),
  ]);

  return {
    data,
    total,
    page,
    pageSize,
  };
}

