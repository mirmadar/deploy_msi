import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AdminOrdersService } from './orders.service';
import { JwtAuthGuard } from 'src/admin/auth/guards/jwt-auth.guard';
import { parsePagination } from 'src/shared/common/utils/query-parser.util';

@UseGuards(JwtAuthGuard)
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(private readonly ordersService: AdminOrdersService) {}

  @Get()
  async getOrders(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
    @Query('search') search?: string,
    @Query('clientEmail') clientEmail?: string,
    @Query('clientPhone') clientPhone?: string,
    @Query('companyEmailSent') companyEmailSent?: string,
    @Query('clientEmailSent') clientEmailSent?: string,
    @Query('bitrixSent') bitrixSent?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const { page: pageNumber, pageSize: pageSizeNumber } = parsePagination(page, pageSize);

    const filters: {
      search?: string;
      clientEmail?: string;
      clientPhone?: string;
      companyEmailSent?: boolean;
      clientEmailSent?: boolean;
      bitrixSent?: boolean;
      dateFrom?: Date;
      dateTo?: Date;
    } = {};

    if (search) {
      filters.search = search;
    }

    if (clientEmail) filters.clientEmail = clientEmail;
    if (clientPhone) filters.clientPhone = clientPhone;
    
    if (companyEmailSent !== undefined) {
      filters.companyEmailSent = companyEmailSent === 'true';
    }
    if (clientEmailSent !== undefined) {
      filters.clientEmailSent = clientEmailSent === 'true';
    }
    if (bitrixSent !== undefined) {
      filters.bitrixSent = bitrixSent === 'true';
    }

    if (dateFrom) {
      filters.dateFrom = new Date(dateFrom);
    }
    if (dateTo) {
      filters.dateTo = new Date(dateTo);
    }

    return this.ordersService.getOrders(pageNumber, pageSizeNumber, filters);
  }

  @Get(':orderNumber')
  async getOrderByNumber(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.getOrderByNumber(orderNumber);
  }

  @Post(':orderNumber/resend-client-email')
  async resendClientEmail(@Param('orderNumber') orderNumber: string) {
    await this.ordersService.resendClientEmail(orderNumber);
    return { success: true, message: 'Email клиенту отправлен' };
  }

  @Post(':orderNumber/resend-company-email')
  async resendCompanyEmail(@Param('orderNumber') orderNumber: string) {
    await this.ordersService.resendCompanyEmail(orderNumber);
    return { success: true, message: 'Email компании отправлен' };
  }

  @Post(':orderNumber/resend-bitrix')
  async resendBitrix(@Param('orderNumber') orderNumber: string) {
    await this.ordersService.resendBitrix(orderNumber);
    return { success: true, message: 'Лид отправлен в Bitrix24' };
  }
}

