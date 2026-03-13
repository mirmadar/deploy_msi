/**
 * Скрипт переиндексации всех товаров в Elasticsearch.
 * Запуск после старта контейнера: npm run reindex
 *
 * Требования: запущен контейнер Elasticsearch (docker compose up -d в папке ElasticSearch),
 *             настроенная БД (переменные в .env для Prisma).
 */
import { PrismaClient } from '@prisma/client';
import { Client } from '@elastic/elasticsearch';

const BATCH_SIZE = 500;
const ES_NODE = process.env.ELASTICSEARCH_NODE  //  || 'http://localhost:9200';

const prisma = new PrismaClient();
const elasticClient = new Client({ node: ES_NODE });

async function reindexAllProducts() {
  console.log('Индексация товаров в Elasticsearch...');
  console.log('ES node:', ES_NODE);

  const categories = await prisma.category.findMany({
    select: {
      categoryId: true,
      name: true,
      parentId: true,
    },
  });

  const categoryMap = new Map<number, { categoryId: number; name: string; parentId: number | null }>();
  for (const c of categories) {
    categoryMap.set(c.categoryId, c);
  }

  const buildCategoryPath = (categoryId: number | null): string | null => {
    if (categoryId == null) return null;
    const names: string[] = [];
    let currentId: number | null = categoryId;

    while (currentId != null) {
      const cat = categoryMap.get(currentId);
      if (!cat) break;
      names.unshift(cat.name);
      currentId = cat.parentId;
    }

    return names.length > 0 ? names.join(' > ') : null;
  };

  let lastId = 0;

  while (true) {
    const products = await prisma.product.findMany({
      take: BATCH_SIZE,
      where: { productId: { gt: lastId } },
      orderBy: { productId: 'asc' },
      include: {
        category: true,
        characteristics: { include: { characteristicName: true } },
      },
    });

    if (products.length === 0) break;

    const body = products.flatMap((product) => {
      const characteristics: Record<string, string> = {};
      for (const c of product.characteristics) {
        characteristics[c.characteristicName.name] = c.value;
      }
      const categoryPath =
        product.category && product.category.categoryId
          ? buildCategoryPath(product.category.categoryId)
          : null;
      return [
        { index: { _index: 'products', _id: product.productId } },
        {
          productId: product.productId,
          name: product.name,
          price: product.price,
          isNew: product.isNew,
          status: product.status,
          unit: product.unit,
          slug: product.slug,
          category:
            product.category && {
              id: product.category.categoryId,
              name: product.category.name,
              slug: product.category.slug,
            },
          categoryPath,
          characteristics,
        },
      ];
    });

    const result = await elasticClient.bulk({ refresh: false, body });
    if (result.errors) {
      console.error('Ошибки при bulk-индексации');
    }

    lastId = products[products.length - 1].productId;
    console.log(`Проиндексировано до productId=${lastId}`);

    await new Promise((r) => setTimeout(r, 10));
  }

  console.log('Индексация завершена.');
}

reindexAllProducts()
  .catch((err) => {
    console.error('Ошибка:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
