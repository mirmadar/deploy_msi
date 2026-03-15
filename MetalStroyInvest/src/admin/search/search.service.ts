import { Injectable } from '@nestjs/common';
import { elasticClient } from './elastic.client';

@Injectable()
export class SearchService {
  private getTotalFromResult(result: any): number {
    const t = result.hits.total;
    if (!t) return 0;
    return typeof t === 'number' ? t : t.value;
  }

  private readonly CATEGORIES_AGG = {
    categories: {
      terms: {
        field: 'category.name.keyword',
        size: 50,
        order: { _count: 'desc' as const },
      },
      aggs: {
        sample: {
          top_hits: {
            size: 1,
            _source: ['category'],
          },
        },
      },
    },
  };

  private extractCategoriesFromAggs(result: any): { id: number; name: string; slug?: string }[] {
    const aggs = (result as any).aggregations;
    if (!aggs?.categories?.buckets?.length) return [];
    return aggs.categories.buckets.map((b: any) => {
      const cat = b.sample?.hits?.hits?.[0]?._source?.category;
      return {
        id: cat?.id ?? b.key,
        name: typeof b.key === 'string' ? b.key : (cat?.name ?? ''),
        slug: cat?.slug,
      };
    });
  }

  private extractSuggestedQuery(result: any): string | undefined {
    const suggest = (result as any).suggest;
    if (!suggest) return undefined;

    const nameSuggest = suggest.name_suggest;
    if (!Array.isArray(nameSuggest) || nameSuggest.length === 0) return undefined;

    const options = nameSuggest[0]?.options;
    if (!Array.isArray(options) || options.length === 0) return undefined;

    const first = options[0];
    const text = first?.text;
    return typeof text === 'string' && text.trim().length > 0 ? text.trim() : undefined;
  }

  private buildSearchQuery(
    {
      query,
      categories,
      categoryIds,
      minPrice,
      maxPrice,
      status,
      isNew,
      unit,
      excludeArchive,
    }: {
      query?: string;
      categories?: string[];
      categoryIds?: number[];
      minPrice?: number;
      maxPrice?: number;
      status?: string;
      isNew?: boolean;
      unit?: string;
      excludeArchive?: boolean;
    },
    withFuzziness: boolean,
  ) {
    const must: any[] = [];
    const should: any[] = [];
    const filter: any[] = [];
    const mustNot: any[] = [];

    const trimmedQuery = query?.trim();

    if (trimmedQuery) {
      if (withFuzziness) {
        // Фаззи-режим: требуем все слова запроса, но допускаем опечатки
        must.push({
          multi_match: {
            query: trimmedQuery,
            fields: ['name^4', 'category.name^2', 'categoryPath^2', 'characteristics.*'],
            type: 'best_fields',
            fuzziness: 'AUTO',
            operator: 'and',
          },
        });

        // Почти точное вхождение фразы дополнительно бустим
        should.push({
          match_phrase: {
            name: {
              query: trimmedQuery,
              boost: 5,
              slop: 2,
            },
          },
        });
      } else {
        // Строгий режим: все слова должны входить в названии товара
        must.push({
          match: {
            name: {
              query: trimmedQuery,
              operator: 'and',
            },
          },
        });

        // Дополнительно учитываем совпадения по названию категории и полному пути
        should.push(
          {
            match_phrase: {
              name: {
                query: trimmedQuery,
                boost: 5,
              },
            },
          },
          {
            match: {
              'category.name': {
                query: trimmedQuery,
                operator: 'and',
              },
            },
          },
          {
            match: {
              categoryPath: {
                query: trimmedQuery,
                operator: 'and',
              },
            },
          },
        );
      }
    } else {
      must.push({ match_all: {} });
    }

    if (categories && categories.length > 0) {
      if (categories.length === 1) {
        filter.push({
          match_phrase: {
            'category.name': categories[0],
          },
        });
      } else {
        filter.push({
          bool: {
            should: categories.map((categoryName) => ({
              match_phrase: {
                'category.name': categoryName,
              },
            })),
            minimum_should_match: 1,
          },
        });
      }
    }

    if (categoryIds && categoryIds.length > 0) {
      filter.push({
        terms: {
          'category.id': categoryIds,
        },
      });
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceRange: any = {};
      if (minPrice !== undefined) {
        priceRange.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        priceRange.lte = maxPrice;
      }
      filter.push({
        range: {
          price: priceRange,
        },
      });
    }

    if (status) {
      filter.push({
        match: {
          status: status,
        },
      });
    }

    if (isNew !== undefined) {
      filter.push({
        term: {
          isNew: isNew,
        },
      });
    }

    if (unit) {
      filter.push({
        match: {
          unit: unit,
        },
      });
    }

    // Опционально исключаем архивные товары (используется в публичном поиске)
    if (excludeArchive) {
      mustNot.push({
        term: {
          status: 'ARCHIVE',
        },
      });
    }

    const esQuery: any = {
      bool: {
        must,
      },
    };

    if (should.length > 0) {
      esQuery.bool.should = should;
      esQuery.bool.minimum_should_match = 1;
    }

    if (filter.length > 0) {
      esQuery.bool.filter = filter;
    }

    if (mustNot.length > 0) {
      esQuery.bool.must_not = mustNot;
    }

    return esQuery;
  }

  /** Макс. длина поискового запроса — защита от перегрузки и некорректного ввода. */
  private static readonly MAX_QUERY_LENGTH = 200;

  async searchProducts({
    query,
    page,
    pageSize,
    categories,
    categoryIds,
    minPrice,
    maxPrice,
    status,
    isNew,
    unit,
    excludeArchive,
    sortBy = 'productId',
    sortOrder = 'desc',
  }: {
    query?: string;
    page: number;
    pageSize: number;
    categories?: string[];
    categoryIds?: number[];
    minPrice?: number;
    maxPrice?: number;
    status?: string;
    isNew?: boolean;
    unit?: string;
    excludeArchive?: boolean;
    sortBy?: 'price' | 'productId';
    sortOrder?: 'asc' | 'desc';
  }) {
    // Elasticsearch ограничивает from + size <= 10000
    const MAX_FROM = 10000;
    const maxFrom = MAX_FROM - pageSize;
    const calculatedFrom = (page - 1) * pageSize;
    const from = Math.min(calculatedFrom, maxFrom);

    const rawTrimmed = query?.trim() ?? '';
    const trimmedQuery =
      rawTrimmed.length > SearchService.MAX_QUERY_LENGTH
        ? rawTrimmed.slice(0, SearchService.MAX_QUERY_LENGTH)
        : rawTrimmed;

    const sort: any[] = [];
    sort.push({
      [sortBy]: {
        order: sortOrder,
      },
    });

    // 1. Строгий поиск без fuzziness (query уже ограничен по длине)
    const exactQuery = this.buildSearchQuery(
      {
        query: trimmedQuery,
        categories,
        categoryIds,
        minPrice,
        maxPrice,
        status,
        isNew,
        unit,
        excludeArchive,
      },
      false,
    );

    const exactResult = await elasticClient.search({
      index: 'products',
      from,
      size: pageSize,
      query: exactQuery,
      sort,
      track_total_hits: true,
      aggs: this.CATEGORIES_AGG,
    });

    const exactTotal = this.getTotalFromResult(exactResult);

    // Если нет запроса или строгий поиск по названию нашел что-то — возвращаем эти результаты
    if (!trimmedQuery || exactTotal > 0) {
      return {
        data: exactResult.hits.hits.map((h: any) => h._source),
        total: exactTotal,
        page,
        pageSize,
        isFuzzy: false,
        categories: this.extractCategoriesFromAggs(exactResult),
      };
    }

    // 1.1. Попытка найти товары по названию / пути категории,
    // если по названию товара ничего не найдено
    const categoryQuery: any = {
      bool: {
        must: [
          {
            multi_match: {
              query: trimmedQuery,
              fields: ['category.name^2', 'categoryPath^3'],
              type: 'best_fields',
              fuzziness: 'AUTO',
              operator: 'and',
            },
          },
        ],
      },
    };

    // В публичном поиске исключаем архивные товары и для поиска по категориям
    if (excludeArchive) {
      categoryQuery.bool.must_not = [
        {
          term: {
            status: 'ARCHIVE',
          },
        },
      ];
    }

    const categoryResult = await elasticClient.search({
      index: 'products',
      from,
      size: pageSize,
      query: categoryQuery,
      track_total_hits: true,
      aggs: this.CATEGORIES_AGG,
    });

    const categoryTotal = this.getTotalFromResult(categoryResult);

    if (categoryTotal > 0) {
      return {
        data: categoryResult.hits.hits.map((h: any) => h._source),
        total: categoryTotal,
        page,
        pageSize,
        isFuzzy: false,
        categories: this.extractCategoriesFromAggs(categoryResult),
      };
    }

    // 2. Запасной поиск с fuzziness, если ни по названию товара,
    // ни по названию категории ничего не нашлось
    const fuzzyQuery = this.buildSearchQuery(
      {
        query: trimmedQuery,
        categories,
        categoryIds,
        minPrice,
        maxPrice,
        status,
        isNew,
        unit,
        excludeArchive,
      },
      true,
    );

    const fuzzyResult = await elasticClient.search({
      index: 'products',
      from,
      size: pageSize,
      query: fuzzyQuery,
      track_total_hits: true,
      aggs: this.CATEGORIES_AGG,
    });

    const fuzzyTotal = this.getTotalFromResult(fuzzyResult);

    // Если фаззи что-то нашел — возвращаем эти результаты
    if (fuzzyTotal > 0) {
      return {
        data: fuzzyResult.hits.hits.map((h: any) => h._source),
        total: fuzzyTotal,
        page,
        pageSize,
        isFuzzy: true,
        categories: this.extractCategoriesFromAggs(fuzzyResult),
      };
    }

    // 3. Попытка исправить запрос (did-you-mean), если ничего не найдено
    const suggestResult = await elasticClient.search({
      index: 'products',
      size: 0,
      suggest: {
        name_suggest: {
          text: trimmedQuery,
          phrase: {
            field: 'name',
            size: 1,
            max_errors: 2,
            gram_size: 3,
            highlight: {
              pre_tag: '<em>',
              post_tag: '</em>',
            },
          },
        },
      },
    });

    const suggestedQuery = this.extractSuggestedQuery(suggestResult);

    // Если предложить нечего — просто возвращаем пустой результат
    if (!suggestedQuery || suggestedQuery === trimmedQuery) {
      return {
        data: [],
        total: 0,
        page,
        pageSize,
        isFuzzy: true,
        categories: [],
      };
    }

    // Пробуем выполнить поиск по предложенному запросу (с fuzziness)
    const suggestedEsQuery = this.buildSearchQuery(
      {
        query: suggestedQuery,
        categories,
        categoryIds,
        minPrice,
        maxPrice,
        status,
        isNew,
        unit,
        excludeArchive,
      },
      true,
    );

    const suggestedResult = await elasticClient.search({
      index: 'products',
      from,
      size: pageSize,
      query: suggestedEsQuery,
      track_total_hits: true,
      aggs: this.CATEGORIES_AGG,
    });

    const suggestedTotal = this.getTotalFromResult(suggestedResult);

    return {
      data: suggestedResult.hits.hits.map((h: any) => h._source),
      total: suggestedTotal,
      page,
      pageSize,
      isFuzzy: true,
      suggestedQuery,
      usedSuggestedQuery: true,
      categories: this.extractCategoriesFromAggs(suggestedResult),
    };
  }

  async getFilters() {
    const result = await elasticClient.search({
      index: 'products',
      size: 0,
      aggs: {
        categories: {
          terms: {
            field: 'category.name.keyword',
            size: 1000,
          },
        },
        price_range: {
          stats: {
            field: 'price',
          },
        },
      },
    });

    const aggregations = result.aggregations as any;

    const categories =
      aggregations?.categories?.buckets?.map((bucket: any) => ({
        name: bucket.key,
        count: bucket.doc_count,
      })) || [];

    const priceStats = aggregations?.price_range || {};
    const minPrice = priceStats.min !== undefined ? Math.floor(priceStats.min) : 0;
    const maxPrice = priceStats.max !== undefined ? Math.ceil(priceStats.max) : 0;

    return {
      categories,
      priceRange: {
        min: minPrice,
        max: maxPrice,
      },
    };
  }

  async countProductsByFilters(filters: {
    categories?: string[];
    categoryIds?: number[];
    minPrice?: number;
    maxPrice?: number;
    status?: string;
    isNew?: boolean;
    unit?: string;
    categoryId?: number;
  }): Promise<number> {
    const filter: any[] = [];

    if (filters.categories && filters.categories.length > 0) {
      if (filters.categories.length === 1) {
        filter.push({
          match_phrase: {
            'category.name': filters.categories[0],
          },
        });
      } else {
        filter.push({
          bool: {
            should: filters.categories.map((categoryName) => ({
              match_phrase: {
                'category.name': categoryName,
              },
            })),
            minimum_should_match: 1,
          },
        });
      }
    }

    if (filters.categoryIds && filters.categoryIds.length > 0) {
      filter.push({
        terms: {
          'category.id': filters.categoryIds,
        },
      });
    }

    if (filters.categoryId !== undefined) {
      filter.push({
        term: {
          'category.id': filters.categoryId,
        },
      });
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      const priceRange: any = {};
      if (filters.minPrice !== undefined) {
        priceRange.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        priceRange.lte = filters.maxPrice;
      }
      filter.push({
        range: {
          price: priceRange,
        },
      });
    }

    if (filters.status) {
      filter.push({
        match: {
          status: filters.status,
        },
      });
    }

    if (filters.isNew !== undefined) {
      filter.push({
        term: {
          isNew: filters.isNew,
        },
      });
    }

    if (filters.unit) {
      filter.push({
        match: {
          unit: filters.unit,
        },
      });
    }

    const esQuery: any = {
      bool: {
        must: [{ match_all: {} }],
      },
    };

    if (filter.length > 0) {
      esQuery.bool.filter = filter;
    }

    const result = await elasticClient.count({
      index: 'products',
      query: esQuery,
    });

    return result.count;
  }

  async findProductIdsByFilters(filters: {
    categories?: string[];
    minPrice?: number;
    maxPrice?: number;
    status?: string;
    isNew?: boolean;
    unit?: string;
    categoryId?: number;
  }): Promise<number[]> {
    const filter: any[] = [];

    if (filters.categories && filters.categories.length > 0) {
      if (filters.categories.length === 1) {
        filter.push({
          match_phrase: {
            'category.name': filters.categories[0],
          },
        });
      } else {
        filter.push({
          bool: {
            should: filters.categories.map((categoryName) => ({
              match_phrase: {
                'category.name': categoryName,
              },
            })),
            minimum_should_match: 1,
          },
        });
      }
    }

    if (filters.categoryId !== undefined) {
      filter.push({
        term: {
          'category.id': filters.categoryId,
        },
      });
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      const priceRange: any = {};
      if (filters.minPrice !== undefined) {
        priceRange.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        priceRange.lte = filters.maxPrice;
      }
      filter.push({
        range: {
          price: priceRange,
        },
      });
    }

    if (filters.status) {
      filter.push({
        match: {
          status: filters.status,
        },
      });
    }

    if (filters.isNew !== undefined) {
      filter.push({
        term: {
          isNew: filters.isNew,
        },
      });
    }

    if (filters.unit) {
      filter.push({
        match: {
          unit: filters.unit,
        },
      });
    }

    const esQuery: any = {
      bool: {
        must: [{ match_all: {} }],
      },
    };

    if (filter.length > 0) {
      esQuery.bool.filter = filter;
    }

    const productIds: number[] = [];
    const scrollSize = 1000;

    const initialResponse = await elasticClient.search({
      index: 'products',
      size: scrollSize,
      query: esQuery,
      _source: ['productId'],
      scroll: '1m',
    });

    initialResponse.hits.hits.forEach((hit: any) => {
      if (hit._source?.productId) {
        productIds.push(hit._source.productId);
      }
    });

    let scrollId = initialResponse._scroll_id;

    while (scrollId) {
      const scrollResponse = await elasticClient.scroll({
        scroll_id: scrollId,
        scroll: '1m',
      });

      if (scrollResponse.hits.hits.length === 0) {
        break;
      }

      scrollResponse.hits.hits.forEach((hit: any) => {
        if (hit._source?.productId) {
          productIds.push(hit._source.productId);
        }
      });

      scrollId = scrollResponse._scroll_id;

      if (scrollResponse.hits.hits.length < scrollSize) {
        break;
      }
    }

    if (scrollId) {
      try {
        await elasticClient.clearScroll({ scroll_id: scrollId });
      } catch (error) {
      }
    }

    return productIds;
  }
}
