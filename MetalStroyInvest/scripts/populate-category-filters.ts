import { PrismaClient, ProductStatus } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Находит все уникальные характеристики для конечной категории
 */
async function getCategoryCharacteristics(categoryId: number): Promise<
  Array<{
    characteristicNameId: number;
    name: string;
    usageCount: number; // Сколько товаров имеют эту характеристику
  }>
> {
  // Фильтруем по связи product (categoryId + status), без списка productIds — иначе при большом числе товаров превышается лимит bind-переменных (32767)
  const productFilter = {
    product: {
      categoryId: categoryId,
      status: { not: ProductStatus.ARCHIVE },
    },
  };

  // Количество уникальных значений по каждой характеристике (только те, где >= 2 значений)
  const valueGroups = await prisma.productCharacteristic.groupBy({
    by: ['characteristicNameId', 'value'],
    where: productFilter,
  });
  const distinctValueCountByCharId = new Map<number, number>();
  for (const row of valueGroups) {
    const count = distinctValueCountByCharId.get(row.characteristicNameId) ?? 0;
    distinctValueCountByCharId.set(row.characteristicNameId, count + 1);
  }
  const characteristicIdsWithAtLeastTwoValues = [...distinctValueCountByCharId.entries()]
    .filter(([, count]) => count >= 2)
    .map(([id]) => id);

  if (characteristicIdsWithAtLeastTwoValues.length === 0) {
    return [];
  }

  // Частота использования характеристики (для сортировки) — тоже через связь product, без списка ID
  const usageCounts = await prisma.productCharacteristic.groupBy({
    by: ['characteristicNameId'],
    where: productFilter,
    _count: { value: true },
  });
  const characteristicCounts = new Map(
    usageCounts.map((row) => [row.characteristicNameId, row._count.value]),
  );

  // Получаем информацию о характеристиках
  const characteristicNames = await prisma.characteristicName.findMany({
    where: {
      characteristicNameId: { in: characteristicIdsWithAtLeastTwoValues },
    },
    select: {
      characteristicNameId: true,
      name: true,
    },
  });

  const result = characteristicNames.map((cn) => ({
    characteristicNameId: cn.characteristicNameId,
    name: cn.name,
    usageCount: characteristicCounts.get(cn.characteristicNameId) ?? 0,
  }));

  // Сортируем по частоте использования (самые частые первыми), затем по алфавиту
  result.sort((a, b) => {
    if (b.usageCount !== a.usageCount) {
      return b.usageCount - a.usageCount;
    }
    return a.name.localeCompare(b.name);
  });

  return result;
}

/**
 * Заполняет фильтры только для конечных категорий (без дочерних)
 */
async function populateCategoryFilters() {
  console.log('🚀 Начало заполнения фильтров категорий...\n');

  // Получаем все категории
  const allCategories = await prisma.category.findMany({
    select: {
      categoryId: true,
      name: true,
      level: true,
      parentId: true,
    },
  });

  // Находим все категории, которые являются родителями (имеют дочерние категории)
  const parentCategoryIds = new Set(
    allCategories
      .filter((cat) => cat.parentId !== null)
      .map((cat) => cat.parentId!)
      .filter((id): id is number => id !== null),
  );

  // Фильтруем только конечные категории (те, у которых нет дочерних)
  const categories = allCategories.filter(
    (cat) => !parentCategoryIds.has(cat.categoryId),
  );

  console.log(`📦 Найдено категорий: ${categories.length}\n`);

  let processed = 0;
  let skipped = 0;
  let errors = 0;

  for (const category of categories) {
    try {
      console.log(
        `[${processed + skipped + errors + 1}/${categories.length}] Обработка категории: ${category.name} (ID: ${category.categoryId})`,
      );

      // Получаем характеристики для категории
      const characteristics = await getCategoryCharacteristics(category.categoryId);

      if (characteristics.length === 0) {
        console.log(`   ⚠️  Нет товаров или характеристик, пропускаем\n`);
        skipped++;
        continue;
      }

      // Удаляем старые фильтры для этой категории (если есть)
      await prisma.categoryFilter.deleteMany({
        where: { categoryId: category.categoryId },
      });

      // Создаем новые фильтры
      const filtersToCreate = characteristics.map((char, index) => ({
        categoryId: category.categoryId,
        characteristicNameId: char.characteristicNameId,
        displayOrder: index + 1, // Порядок от 1 до N
      }));

      await prisma.categoryFilter.createMany({
        data: filtersToCreate,
        skipDuplicates: true,
      });

      console.log(
        `   ✅ Добавлено фильтров: ${characteristics.length} (${characteristics.map((c) => c.name).join(', ')})\n`,
      );
      processed++;
    } catch (error) {
      console.error(`   ❌ Ошибка при обработке категории ${category.name}:`, error);
      errors++;
    }
  }

  console.log('\n📊 Итоги:');
  console.log(`   ✅ Обработано: ${processed}`);
  console.log(`   ⚠️  Пропущено: ${skipped}`);
  console.log(`   ❌ Ошибок: ${errors}`);
  console.log(`\n✨ Заполнение завершено!`);
}

// Запуск скрипта
populateCategoryFilters()
  .catch((error) => {
    console.error('❌ Критическая ошибка:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

