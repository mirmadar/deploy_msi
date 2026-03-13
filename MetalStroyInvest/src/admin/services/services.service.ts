import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { CreateServiceBlockDto } from './dto/create-service-block.dto';
import { UpdateServiceBlockDto } from './dto/update-service-block.dto';
import { ReorderServiceBlocksDto } from './dto/reorder-service-blocks.dto';
import { SlugUtil } from 'src/shared/common/utils/slug.util';
import { paginateQuery, PaginatedResult } from 'src/shared/common/utils/pagination.util';
import { Prisma } from '@prisma/client';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  /** Проверить существование категории услуг */
  private async ensureCategoryExists(serviceCategoryId: number): Promise<void> {
    const category = await this.prisma.serviceCategory.findUnique({
      where: { serviceCategoryId },
      select: { serviceCategoryId: true },
    });
    if (!category) {
      throw new HttpException('Категория услуг не найдена', HttpStatus.NOT_FOUND);
    }
  }

  async create(dto: CreateServiceDto) {
    await this.ensureCategoryExists(dto.serviceCategoryId);

    const baseSlug = SlugUtil.generateSlug(dto.name);
    const slug = await SlugUtil.generateUniqueServiceSlug(this.prisma, baseSlug);

    const max = await this.prisma.service.aggregate({
      where: { serviceCategoryId: dto.serviceCategoryId },
      _max: { sortOrder: true },
    });
    const sortOrder = (max._max.sortOrder ?? -1) + 1;

    return this.prisma.service.create({
      data: {
        name: dto.name,
        slug,
        serviceCategoryId: dto.serviceCategoryId,
        sortOrder,
      },
    });
  }

  async getAll(page = 1, limit = 25, serviceCategoryId?: number) {
    const where: Prisma.ServiceWhereInput =
      serviceCategoryId !== undefined ? { serviceCategoryId } : {};

    const select = {
      serviceId: true,
      name: true,
      slug: true,
      serviceCategoryId: true,
      sortOrder: true,
      category: {
        select: { name: true, slug: true },
      },
    } as const;

    type SelectType = typeof select;
    type WithCategory = Prisma.ServiceGetPayload<{ select: SelectType }>;

    const result = await paginateQuery({
      findMany: (args) => this.prisma.service.findMany(args as Prisma.ServiceFindManyArgs),
      count: (args) => this.prisma.service.count(args as Prisma.ServiceCountArgs | undefined),
      where,
      orderBy: [{ sortOrder: 'asc' as const }, { name: 'asc' as const }] as Prisma.ServiceOrderByWithRelationInput[],
      select,
      pagination: { page, pageSize: limit },
    }) as unknown as PaginatedResult<WithCategory>;

    return { ...result, limit: result.pageSize };
  }

  async getById(serviceId: number) {
    const service = await this.prisma.service.findUnique({
      where: { serviceId },
      select: {
        serviceId: true,
        name: true,
        slug: true,
        serviceCategoryId: true,
        sortOrder: true,
        category: {
          select: {
            serviceCategoryId: true,
            name: true,
            slug: true,
            description: true,
            parentId: true,
            level: true,
            sortOrder: true,
          },
        },
        blocks: {
          select: {
            serviceBlockId: true,
            type: true,
            payload: true,
            sortOrder: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!service) {
      throw new HttpException('Услуга не найдена', HttpStatus.NOT_FOUND);
    }

    return service;
  }

  async update(serviceId: number, dto: UpdateServiceDto) {
    const service = await this.prisma.service.findUnique({
      where: { serviceId },
      select: { serviceId: true, name: true },
    });

    if (!service) {
      throw new HttpException('Услуга не найдена', HttpStatus.NOT_FOUND);
    }

    if (dto.serviceCategoryId !== undefined) {
      await this.ensureCategoryExists(dto.serviceCategoryId);
    }

    const updateData: Prisma.ServiceUncheckedUpdateInput = {};

    if (dto.name !== undefined) {
      updateData.name = dto.name;
      const baseSlug = SlugUtil.generateSlug(dto.name);
      updateData.slug = await SlugUtil.generateUniqueServiceSlug(this.prisma, baseSlug, serviceId);
    }
    if (dto.serviceCategoryId !== undefined) updateData.serviceCategoryId = dto.serviceCategoryId;

    return this.prisma.service.update({
      where: { serviceId },
      data: updateData,
    });
  }

  async delete(serviceId: number) {
    const service = await this.prisma.service.findUnique({
      where: { serviceId },
      select: { serviceId: true },
    });

    if (!service) {
      throw new HttpException('Услуга не найдена', HttpStatus.NOT_FOUND);
    }

    await this.prisma.service.delete({
      where: { serviceId },
    });

    return { message: 'Услуга удалена' };
  }

  async bulkMove(serviceIds: number[], newServiceCategoryId: number) {
    if (serviceIds.length === 0) {
      throw new HttpException(
        'Необходимо выбрать хотя бы одну услугу',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.ensureCategoryExists(newServiceCategoryId);

    const existing = await this.prisma.service.findMany({
      where: { serviceId: { in: serviceIds } },
      select: { serviceId: true },
    });
    const existingIds = new Set(existing.map((s) => s.serviceId));
    const notFound = serviceIds.filter((id) => !existingIds.has(id));
    if (notFound.length > 0) {
      throw new HttpException(
        `Услуги с ID ${notFound.join(', ')} не найдены`,
        HttpStatus.NOT_FOUND,
      );
    }

    await this.prisma.service.updateMany({
      where: { serviceId: { in: serviceIds } },
      data: { serviceCategoryId: newServiceCategoryId },
    });

    return {
      message: `Перемещено услуг: ${serviceIds.length}`,
      movedCount: serviceIds.length,
      serviceIds,
      newServiceCategoryId,
    };
  }

  async bulkDelete(serviceIds: number[]) {
    if (serviceIds.length === 0) {
      throw new HttpException(
        'Необходимо выбрать хотя бы одну услугу',
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await this.prisma.service.deleteMany({
      where: { serviceId: { in: serviceIds } },
    });

    return {
      message: `Удалено услуг: ${result.count}`,
      deletedCount: result.count,
      serviceIds,
    };
  }

  async move(serviceId: number, direction: 'up' | 'down') {
    const current = await this.prisma.service.findUnique({
      where: { serviceId },
      select: { serviceId: true, serviceCategoryId: true },
    });
    if (!current) {
      throw new HttpException('Услуга не найдена', HttpStatus.NOT_FOUND);
    }

    const siblings = await this.prisma.service.findMany({
      where: { serviceCategoryId: current.serviceCategoryId },
      select: { serviceId: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }, { serviceId: 'asc' }],
    });

    const idx = siblings.findIndex((s) => s.serviceId === serviceId);
    if (idx === -1) return this.getById(serviceId);

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= siblings.length) {
      throw new HttpException(
        direction === 'up' ? 'Уже в начале списка' : 'Уже в конце списка',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      for (let i = 0; i < siblings.length; i++) {
        await tx.service.update({
          where: { serviceId: siblings[i].serviceId },
          data: { sortOrder: i },
        });
      }
      await tx.service.update({ where: { serviceId }, data: { sortOrder: swapIdx } });
      await tx.service.update({ where: { serviceId: siblings[swapIdx].serviceId }, data: { sortOrder: idx } });
    });

    return this.getById(serviceId);
  }

  // ——— Блоки ———

  async addBlock(serviceId: number, dto: CreateServiceBlockDto) {
    const service = await this.prisma.service.findUnique({
      where: { serviceId },
      select: { serviceId: true },
    });
    if (!service) {
      throw new HttpException('Услуга не найдена', HttpStatus.NOT_FOUND);
    }

    const maxOrder = await this.prisma.serviceBlock.aggregate({
      where: { serviceId },
      _max: { sortOrder: true },
    });

    const sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;

    return this.prisma.serviceBlock.create({
      data: {
        serviceId,
        type: dto.type,
        payload: dto.payload as Prisma.InputJsonValue,
        sortOrder,
      },
    });
  }

  async updateBlock(serviceId: number, serviceBlockId: number, dto: UpdateServiceBlockDto) {
    const block = await this.prisma.serviceBlock.findFirst({
      where: { serviceBlockId, serviceId },
      select: { serviceBlockId: true },
    });

    if (!block) {
      throw new HttpException('Блок не найден', HttpStatus.NOT_FOUND);
    }

    return this.prisma.serviceBlock.update({
      where: { serviceBlockId },
      data: { payload: dto.payload as Prisma.InputJsonValue },
    });
  }

  async deleteBlock(serviceId: number, serviceBlockId: number) {
    const block = await this.prisma.serviceBlock.findFirst({
      where: { serviceBlockId, serviceId },
      select: { serviceBlockId: true },
    });

    if (!block) {
      throw new HttpException('Блок не найден', HttpStatus.NOT_FOUND);
    }

    await this.prisma.serviceBlock.delete({
      where: { serviceBlockId },
    });

    return { message: 'Блок удалён' };
  }

  async reorderBlocks(serviceId: number, dto: ReorderServiceBlocksDto) {
    const service = await this.prisma.service.findUnique({
      where: { serviceId },
      select: { serviceId: true },
    });
    if (!service) {
      throw new HttpException('Услуга не найдена', HttpStatus.NOT_FOUND);
    }

    await this.prisma.$transaction(
      dto.blocks.map((item) =>
        this.prisma.serviceBlock.updateMany({
          where: { serviceBlockId: item.serviceBlockId, serviceId },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );

    return this.prisma.serviceBlock.findMany({
      where: { serviceId },
      select: {
        serviceBlockId: true,
        type: true,
        payload: true,
        sortOrder: true,
      },
      orderBy: { sortOrder: 'asc' },
    });
  }
}
