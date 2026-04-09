import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { paginateQuery, PaginatedResult } from 'src/shared/common/utils/pagination.util';
import { Prisma } from '@prisma/client';
import { OrdersService as PublicOrdersService } from 'src/public/public-orders/public-orders.service';

@Injectable()
export class AdminOrdersService {
  constructor(
    private prisma: PrismaService,
    private publicOrdersService: PublicOrdersService,
  ) {}

  async getOrders(
    page: number = 1,
    pageSize: number = 20,
    filters?: {
      search?: string;
      clientEmail?: string;
      clientPhone?: string;
      companyEmailSent?: boolean;
      clientEmailSent?: boolean;
      bitrixSent?: boolean;
      dateFrom?: Date;
      dateTo?: Date;
    },
  ): Promise<PaginatedResult<{
    orderId: number;
    orderNumber: string;
    clientName: string;
    clientPhone: string;
    clientEmail: string;
    createdAt: Date;
    companyEmailSent: boolean;
    clientEmailSent: boolean;
    bitrixSent: boolean;
    bitrixLeadId: number | null;
    companyEmailSentAt: Date | null;
    clientEmailSentAt: Date | null;
    bitrixSentAt: Date | null;
    items: Array<{
      orderItemId: number;
      orderId: number;
      productId: number;
      productName: string;
      quantity: number;
      unitPrice: number;
      unit: string;
      product: {
        productId: number;
        name: string;
      };
    }>;
  }>> {
    const where: Prisma.OrderWhereInput = {};

    // Простой поиск по всем текстовым полям
    if (filters?.search) {
      where.OR = [
        {
          orderNumber: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          clientName: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          clientEmail: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          clientPhone: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (filters?.clientEmail) {
      where.clientEmail = {
        contains: filters.clientEmail,
        mode: 'insensitive',
      };
    }

    if (filters?.clientPhone) {
      where.clientPhone = {
        contains: filters.clientPhone,
        mode: 'insensitive',
      };
    }

    if (filters?.companyEmailSent !== undefined) {
      where.companyEmailSent = filters.companyEmailSent;
    }

    if (filters?.clientEmailSent !== undefined) {
      where.clientEmailSent = filters.clientEmailSent;
    }

    if (filters?.bitrixSent !== undefined) {
      where.bitrixSent = filters.bitrixSent;
    }

    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.createdAt.lte = filters.dateTo;
      }
    }

    const select = {
      orderId: true,
      orderNumber: true,
      clientName: true,
      clientPhone: true,
      clientEmail: true,
      createdAt: true,
      companyEmailSent: true,
      clientEmailSent: true,
      bitrixSent: true,
      bitrixLeadId: true,
      companyEmailSentAt: true,
      clientEmailSentAt: true,
      bitrixSentAt: true,
      items: {
        select: {
          orderItemId: true,
          orderId: true,
          productId: true,
          productName: true,
          quantity: true,
          unitPrice: true,
          unit: true,
          product: {
            select: {
              productId: true,
              name: true,
            },
          },
        },
      },
    } as const;

    type OrderSelect = typeof select;
    type OrderWithItems = Prisma.OrderGetPayload<{
      select: OrderSelect;
    }>;

    return paginateQuery({
      findMany: (args) => this.prisma.order.findMany(args as Prisma.OrderFindManyArgs),
      count: (args) => this.prisma.order.count(args as Prisma.OrderCountArgs | undefined),
      where,
      orderBy: {
        createdAt: 'desc',
      },
      select,
      pagination: {
        page,
        pageSize,
      },
    }) as unknown as PaginatedResult<OrderWithItems>;
  }

  async getOrderByNumber(orderNumber: string) {
    return this.publicOrdersService.getOrderByNumber(orderNumber);
  }

  async resendClientEmail(orderNumber: string): Promise<void> {
    await this.publicOrdersService.sendClientEmail(orderNumber);
  }

  async resendCompanyEmail(orderNumber: string): Promise<void> {
    await this.publicOrdersService.sendCompanyEmail(orderNumber);
  }

  async resendBitrix(orderNumber: string): Promise<void> {
    await this.publicOrdersService.sendBitrixLead(orderNumber);
  }
}
