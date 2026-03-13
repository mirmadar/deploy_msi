import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { CreateCategoryFilterDto } from './dto/create-category-filter.dto';
import { UpdateCategoryFilterDto } from './dto/update-category-filter.dto';

@Injectable()
export class CategoryFiltersService {
  constructor(private prisma: PrismaService) {}

  private async ensureCategoryIsLeaf(categoryId: number): Promise<void> {
    const children = await this.prisma.category.findMany({
      where: { parentId: categoryId },
      select: { categoryId: true },
    });

    if (children.length > 0) {
      throw new HttpException(
        'Фильтры можно настраивать только для конечных категорий (без дочерних)',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getCategoryFilters(categoryId: number) {
    const category = await this.prisma.category.findUnique({
      where: { categoryId },
      select: { categoryId: true },
    });

    if (!category) {
      throw new HttpException('Категория не найдена', HttpStatus.NOT_FOUND);
    }

    const filters = await this.prisma.categoryFilter.findMany({
      where: { categoryId },
      include: {
        characteristicName: {
          select: {
            characteristicNameId: true,
            name: true,
            valueType: true,
          },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });

    return filters.map((filter) => ({
      categoryFilterId: filter.categoryFilterId,
      categoryId: filter.categoryId,
      characteristicName: filter.characteristicName,
      displayOrder: filter.displayOrder,
    }));
  }

  async createCategoryFilter(dto: CreateCategoryFilterDto) {
    const category = await this.prisma.category.findUnique({
      where: { categoryId: dto.categoryId },
      select: { categoryId: true },
    });

    if (!category) {
      throw new HttpException('Категория не найдена', HttpStatus.NOT_FOUND);
    }

    await this.ensureCategoryIsLeaf(dto.categoryId);

    const characteristic = await this.prisma.characteristicName.findUnique({
      where: { characteristicNameId: dto.characteristicNameId },
      select: { characteristicNameId: true },
    });

    if (!characteristic) {
      throw new HttpException('Характеристика не найдена', HttpStatus.NOT_FOUND);
    }

    const existingFilter = await this.prisma.categoryFilter.findUnique({
      where: {
        categoryId_characteristicNameId: {
          categoryId: dto.categoryId,
          characteristicNameId: dto.characteristicNameId,
        },
      },
    });

    if (existingFilter) {
      throw new HttpException(
        'Этот фильтр уже существует для данной категории',
        HttpStatus.CONFLICT,
      );
    }

    // Если порядок не указан, ставим в конец
    let displayOrder = dto.displayOrder;
    if (!displayOrder) {
      const maxOrder = await this.prisma.categoryFilter.findFirst({
        where: { categoryId: dto.categoryId },
        orderBy: { displayOrder: 'desc' },
        select: { displayOrder: true },
      });
      displayOrder = (maxOrder?.displayOrder || 0) + 1;
    } else {
      // Если порядок указан, сдвигаем остальные фильтры
      await this.shiftFiltersOrder(dto.categoryId, displayOrder, 'increment');
    }

    const filter = await this.prisma.categoryFilter.create({
      data: {
        categoryId: dto.categoryId,
        characteristicNameId: dto.characteristicNameId,
        displayOrder,
      },
      include: {
        characteristicName: {
          select: {
            characteristicNameId: true,
            name: true,
            valueType: true,
          },
        },
      },
    });

    return {
      categoryFilterId: filter.categoryFilterId,
      categoryId: filter.categoryId,
      characteristicName: filter.characteristicName,
      displayOrder: filter.displayOrder,
    };
  }

  async updateCategoryFilter(filterId: number, dto: UpdateCategoryFilterDto) {
    const filter = await this.prisma.categoryFilter.findUnique({
      where: { categoryFilterId: filterId },
      select: {
        categoryFilterId: true,
        categoryId: true,
        displayOrder: true,
      },
    });

    if (!filter) {
      throw new HttpException('Фильтр не найден', HttpStatus.NOT_FOUND);
    }

    if (dto.displayOrder === undefined) {
      throw new HttpException('Необходимо указать порядок отображения', HttpStatus.BAD_REQUEST);
    }

    const oldOrder = filter.displayOrder;
    const newOrder = dto.displayOrder;

    if (oldOrder === newOrder) {
      // Порядок не изменился, просто возвращаем фильтр
      return this.getCategoryFilterById(filterId);
    }

    // Сдвигаем другие фильтры
    if (newOrder > oldOrder) {
      // Сдвигаем вниз - уменьшаем порядок фильтров между старым и новым
      await this.prisma.categoryFilter.updateMany({
        where: {
          categoryId: filter.categoryId,
          displayOrder: { gt: oldOrder, lte: newOrder },
          categoryFilterId: { not: filterId },
        },
        data: {
          displayOrder: { decrement: 1 },
        },
      });
    } else {
      // Сдвигаем вверх - увеличиваем порядок фильтров между новым и старым
      await this.prisma.categoryFilter.updateMany({
        where: {
          categoryId: filter.categoryId,
          displayOrder: { gte: newOrder, lt: oldOrder },
          categoryFilterId: { not: filterId },
        },
        data: {
          displayOrder: { increment: 1 },
        },
      });
    }

    const updatedFilter = await this.prisma.categoryFilter.update({
      where: { categoryFilterId: filterId },
      data: { displayOrder: newOrder },
      include: {
        characteristicName: {
          select: {
            characteristicNameId: true,
            name: true,
            valueType: true,
          },
        },
      },
    });

    return {
      categoryFilterId: updatedFilter.categoryFilterId,
      categoryId: updatedFilter.categoryId,
      characteristicName: updatedFilter.characteristicName,
      displayOrder: updatedFilter.displayOrder,
    };
  }

  async deleteCategoryFilter(filterId: number) {
    const filter = await this.prisma.categoryFilter.findUnique({
      where: { categoryFilterId: filterId },
      select: {
        categoryFilterId: true,
        categoryId: true,
        displayOrder: true,
      },
    });

    if (!filter) {
      throw new HttpException('Фильтр не найден', HttpStatus.NOT_FOUND);
    }

    await this.prisma.categoryFilter.delete({
      where: { categoryFilterId: filterId },
    });

    // Уменьшаем порядок всех фильтров, которые были после удаленного
    await this.prisma.categoryFilter.updateMany({
      where: {
        categoryId: filter.categoryId,
        displayOrder: { gt: filter.displayOrder },
      },
      data: {
        displayOrder: { decrement: 1 },
      },
    });

    return { message: 'Фильтр удален' };
  }

  private async getCategoryFilterById(filterId: number) {
    const filter = await this.prisma.categoryFilter.findUnique({
      where: { categoryFilterId: filterId },
      include: {
        characteristicName: {
          select: {
            characteristicNameId: true,
            name: true,
            valueType: true,
          },
        },
      },
    });

    if (!filter) {
      throw new HttpException('Фильтр не найден', HttpStatus.NOT_FOUND);
    }

    return {
      categoryFilterId: filter.categoryFilterId,
      categoryId: filter.categoryId,
      characteristicName: filter.characteristicName,
      displayOrder: filter.displayOrder,
    };
  }

  private async shiftFiltersOrder(
    categoryId: number,
    fromOrder: number,
    direction: 'increment' | 'decrement',
  ) {
    const updateData =
      direction === 'increment'
        ? { displayOrder: { increment: 1 } }
        : { displayOrder: { decrement: 1 } };

    await this.prisma.categoryFilter.updateMany({
      where: {
        categoryId,
        displayOrder: { gte: fromOrder },
      },
      data: updateData,
    });
  }

  async bulkUpdateCategoryFilters(
    categoryId: number,
    operations: {
      create?: Array<{ characteristicNameId: number; displayOrder?: number }>;
      delete?: number[];
      update?: Array<{ filterId: number; displayOrder: number }>;
    },
  ) {
    const category = await this.prisma.category.findUnique({
      where: { categoryId },
      select: { categoryId: true },
    });

    if (!category) {
      throw new HttpException('Категория не найдена', HttpStatus.NOT_FOUND);
    }

    await this.ensureCategoryIsLeaf(categoryId);

    if (
      (!operations.create || operations.create.length === 0) &&
      (!operations.delete || operations.delete.length === 0) &&
      (!operations.update || operations.update.length === 0)
    ) {
      throw new HttpException(
        'Необходимо указать хотя бы одну операцию (create, delete, update)',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Выполняем все операции в транзакции
    const result = await this.prisma.$transaction(async (tx) => {
      const results = {
        created: 0,
        deleted: 0,
        updated: 0,
      };

      if (operations.delete && operations.delete.length > 0) {
        const filtersToDelete = await tx.categoryFilter.findMany({
          where: {
            categoryFilterId: { in: operations.delete },
            categoryId,
          },
          select: {
            categoryFilterId: true,
            displayOrder: true,
          },
        });

        if (filtersToDelete.length !== operations.delete.length) {
          const foundIds = new Set(filtersToDelete.map((f) => f.categoryFilterId));
          const notFoundIds = operations.delete.filter((id) => !foundIds.has(id));
          throw new HttpException(
            `Фильтры с ID ${notFoundIds.join(', ')} не найдены`,
            HttpStatus.NOT_FOUND,
          );
        }

        const maxDeletedOrder = Math.max(...filtersToDelete.map((f) => f.displayOrder));

        await tx.categoryFilter.deleteMany({
          where: {
            categoryFilterId: { in: operations.delete },
            categoryId,
          },
        });

        await tx.categoryFilter.updateMany({
          where: {
            categoryId,
            displayOrder: { gt: maxDeletedOrder },
          },
          data: {
            displayOrder: { decrement: filtersToDelete.length },
          },
        });

        results.deleted = filtersToDelete.length;
      }

      if (operations.update && operations.update.length > 0) {
        const filterIds = operations.update.map((u) => u.filterId);
        const existingFilters = await tx.categoryFilter.findMany({
          where: {
            categoryFilterId: { in: filterIds },
            categoryId,
          },
          select: {
            categoryFilterId: true,
            displayOrder: true,
          },
        });

        if (existingFilters.length !== filterIds.length) {
          const foundIds = new Set(existingFilters.map((f) => f.categoryFilterId));
          const notFoundIds = filterIds.filter((id) => !foundIds.has(id));
          throw new HttpException(
            `Фильтры с ID ${notFoundIds.join(', ')} не найдены`,
            HttpStatus.NOT_FOUND,
          );
        }

        for (const updateItem of operations.update) {
          const filter = existingFilters.find((f) => f.categoryFilterId === updateItem.filterId);
          if (!filter) continue;

          const oldOrder = filter.displayOrder;
          const newOrder = updateItem.displayOrder;

          if (oldOrder === newOrder) continue;

          if (newOrder > oldOrder) {
            await tx.categoryFilter.updateMany({
              where: {
                categoryId,
                displayOrder: { gt: oldOrder, lte: newOrder },
                categoryFilterId: { not: updateItem.filterId },
              },
              data: {
                displayOrder: { decrement: 1 },
              },
            });
          } else {
            await tx.categoryFilter.updateMany({
              where: {
                categoryId,
                displayOrder: { gte: newOrder, lt: oldOrder },
                categoryFilterId: { not: updateItem.filterId },
              },
              data: {
                displayOrder: { increment: 1 },
              },
            });
          }

          await tx.categoryFilter.update({
            where: { categoryFilterId: updateItem.filterId },
            data: { displayOrder: newOrder },
          });
        }

        results.updated = operations.update.length;
      }

      if (operations.create && operations.create.length > 0) {
        const characteristicIds = operations.create.map((c) => c.characteristicNameId);
        const existingCharacteristics = await tx.characteristicName.findMany({
          where: {
            characteristicNameId: { in: characteristicIds },
          },
          select: { characteristicNameId: true },
        });

        if (existingCharacteristics.length !== characteristicIds.length) {
          const foundIds = new Set(existingCharacteristics.map((c) => c.characteristicNameId));
          const notFoundIds = characteristicIds.filter((id) => !foundIds.has(id));
          throw new HttpException(
            `Характеристики с ID ${notFoundIds.join(', ')} не найдены`,
            HttpStatus.NOT_FOUND,
          );
        }

        const maxOrderResult = await tx.categoryFilter.findFirst({
          where: { categoryId },
          orderBy: { displayOrder: 'desc' },
          select: { displayOrder: true },
        });
        let currentMaxOrder = maxOrderResult?.displayOrder || 0;

        const existingFilters = await tx.categoryFilter.findMany({
          where: {
            categoryId,
            characteristicNameId: { in: characteristicIds },
          },
          select: {
            characteristicNameId: true,
          },
        });

        const existingCharIds = new Set(existingFilters.map((f) => f.characteristicNameId));
        const duplicateIds = characteristicIds.filter((id) => existingCharIds.has(id));

        if (duplicateIds.length > 0) {
          throw new HttpException(
            `Фильтры для характеристик с ID ${duplicateIds.join(', ')} уже существуют`,
            HttpStatus.CONFLICT,
          );
        }

        for (const createItem of operations.create) {
          let displayOrder = createItem.displayOrder;

          if (!displayOrder) {
            currentMaxOrder += 1;
            displayOrder = currentMaxOrder;
          } else {
            await tx.categoryFilter.updateMany({
              where: {
                categoryId,
                displayOrder: { gte: displayOrder },
              },
              data: {
                displayOrder: { increment: 1 },
              },
            });
            currentMaxOrder = Math.max(currentMaxOrder, displayOrder);
          }

          await tx.categoryFilter.create({
            data: {
              categoryId,
              characteristicNameId: createItem.characteristicNameId,
              displayOrder,
            },
          });
        }

        results.created = operations.create.length;
      }

      return results;
    });

    return {
      message: `Обновлено фильтров: создано ${result.created}, удалено ${result.deleted}, обновлено ${result.updated}`,
      created: result.created,
      deleted: result.deleted,
      updated: result.updated,
      categoryId,
    };
  }
}
