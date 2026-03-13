import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Controller('public/cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  /**
   * GET /public/cart - Получение корзины
   */
  @Get()
  async getCart(@Req() req: Request) {
    const token = req.cookies?.cartToken;
    return this.cartService.getCartByToken(token);
  }

  /**
   * POST /public/cart - Добавление товара в корзину
   */
  @Post()
  async addToCart(
    @Body() addToCartDto: AddToCartDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const token = req.cookies?.cartToken;
    const result = await this.cartService.addToCart(token, addToCartDto.productId);

    // Если токен был создан, устанавливаем cookie
    if (!token && 'token' in result && result.token) {
      res.cookie('cartToken', result.token, {
        httpOnly: false, // Чтобы фронтенд мог читать
        sameSite: 'lax',
        maxAge: 90 * 24 * 60 * 60 * 1000, // 90 дней
      });
    }

    return res.json(result);
  }

  /**
   * PATCH /public/cart/:itemId - Обновление количества товара
   */
  @Patch(':itemId')
  async updateCartItem(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() updateCartItemDto: UpdateCartItemDto,
    @Req() req: Request,
  ) {
    const token = req.cookies?.cartToken;
    return this.cartService.updateCartItem(token, itemId, updateCartItemDto.quantity);
  }

  /**
   * DELETE /public/cart/:itemId - Удаление товара из корзины
   */
  @Delete(':itemId')
  async removeCartItem(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Req() req: Request,
  ) {
    const token = req.cookies?.cartToken;
    return this.cartService.removeCartItem(token, itemId);
  }
}

