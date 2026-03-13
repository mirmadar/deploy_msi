import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { ProductStatus } from '@prisma/client';
import { randomUUID } from 'crypto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCartByToken(token: string | undefined) {
    if (!token) {
      return {
        totalAmount: 0,
        items: [],
      };
    }

    const cart = await this.prisma.cart.findUnique({
      where: { token },
      include: {
        items: {
          include: {
            product: {
              select: {
                productId: true,
                name: true,
                price: true,
                imageUrl: true,
                status: true,
                unit: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!cart) {
      return {
        totalAmount: 0,
        items: [],
      };
    }

    return this.formatCartResponse(cart);
  }

  async addToCart(token: string | undefined, productId: number) {
    const product = await this.prisma.product.findUnique({
      where: { productId },
      select: {
        productId: true,
        name: true,
        price: true,
        unit: true,
        status: true,
      },
    });

    if (!product) {
      throw new HttpException('Товар не найден', HttpStatus.NOT_FOUND);
    }

    if (product.status !== ProductStatus.IN_STOCK) {
      throw new HttpException(
        'Товар недоступен для заказа',
        HttpStatus.BAD_REQUEST,
      );
    }

    let cartToken = token;
    if (!cartToken) {
      cartToken = this.generateCartToken();
    }

    const updatedCart = await this.prisma.$transaction(async (tx) => {
      let cart = await tx.cart.findUnique({
        where: { token: cartToken },
      });

      if (!cart) {
        cart = await tx.cart.create({
          data: {
            token: cartToken,
            totalAmount: 0,
          },
        });
      }

      const existingItem = await tx.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId: productId,
        },
      });

      if (existingItem) {
        await tx.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: existingItem.quantity + 1,
          },
        });
      } else {
        await tx.cartItem.create({
          data: {
            cartId: cart.id,
            productId: productId,
            quantity: 1,
            price: product.price,
          },
        });
      }

      const items = await tx.cartItem.findMany({
        where: { cartId: cart.id },
      });

      const totalAmount = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      await tx.cart.update({
        where: { id: cart.id },
        data: { totalAmount },
      });

      return await tx.cart.findUnique({
        where: { token: cartToken },
        include: {
          items: {
            include: {
              product: {
                select: {
                  productId: true,
                  name: true,
                  price: true,
                  imageUrl: true,
                  status: true,
                  unit: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });
    });

    return this.formatCartResponse(updatedCart!);
  }

  async updateCartItem(
    token: string | undefined,
    itemId: number,
    quantity: number,
  ) {
    if (!token) {
      throw new HttpException('Корзина не найдена', HttpStatus.NOT_FOUND);
    }

    if (quantity < 1) {
      throw new HttpException(
        'Количество должно быть больше 0',
        HttpStatus.BAD_REQUEST,
      );
    }

    const updatedCart = await this.prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { token },
      });

      if (!cart) {
        throw new HttpException('Корзина не найдена', HttpStatus.NOT_FOUND);
      }

      const cartItem = await tx.cartItem.findFirst({
        where: {
          id: itemId,
          cartId: cart.id,
        },
      });

      if (!cartItem) {
        throw new HttpException(
          'Элемент корзины не найден',
          HttpStatus.NOT_FOUND,
        );
      }

      await tx.cartItem.update({
        where: { id: itemId },
        data: { quantity },
      });

      const items = await tx.cartItem.findMany({
        where: { cartId: cart.id },
      });
      const totalAmount = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      await tx.cart.update({
        where: { id: cart.id },
        data: { totalAmount },
      });

      return tx.cart.findUnique({
        where: { token },
        include: {
          items: {
            include: {
              product: {
                select: {
                  productId: true,
                  name: true,
                  price: true,
                  imageUrl: true,
                  status: true,
                  unit: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' as const },
          },
        },
      });
    });

    return this.formatCartResponse(updatedCart!);
  }

  async removeCartItem(token: string | undefined, itemId: number) {
    if (!token) {
      throw new HttpException('Корзина не найдена', HttpStatus.NOT_FOUND);
    }

    const updatedCart = await this.prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { token },
      });

      if (!cart) {
        throw new HttpException('Корзина не найдена', HttpStatus.NOT_FOUND);
      }

      const cartItem = await tx.cartItem.findFirst({
        where: {
          id: itemId,
          cartId: cart.id,
        },
      });

      if (!cartItem) {
        throw new HttpException(
          'Элемент корзины не найден',
          HttpStatus.NOT_FOUND,
        );
      }

      await tx.cartItem.delete({
        where: { id: itemId },
      });

      const items = await tx.cartItem.findMany({
        where: { cartId: cart.id },
      });
      const totalAmount = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      await tx.cart.update({
        where: { id: cart.id },
        data: { totalAmount },
      });

      return tx.cart.findUnique({
        where: { token },
        include: {
          items: {
            include: {
              product: {
                select: {
                  productId: true,
                  name: true,
                  price: true,
                  imageUrl: true,
                  status: true,
                  unit: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' as const },
          },
        },
      });
    });

    return this.formatCartResponse(updatedCart!);
  }

  private async recalculateCartTotal(cartId: number): Promise<number> {
    const items = await this.prisma.cartItem.findMany({
      where: { cartId },
    });

    if (items.length === 0) {
      await this.prisma.cart.update({
        where: { id: cartId },
        data: { totalAmount: 0 },
      });
      return 0;
    }

    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    await this.prisma.cart.update({
      where: { id: cartId },
      data: { totalAmount },
    });

    return totalAmount;
  }

  //Генерация UUID токена для корзины
  private generateCartToken(): string {
    return randomUUID();
  }

  //Форматирование ответа корзины
  private formatCartResponse(cart: {
    id: number;
    token: string;
    totalAmount: number;
    createdAt: Date;
    updatedAt: Date;
    items: Array<{
      id: number;
      cartId: number;
      productId: number;
      quantity: number;
      price: number;
      createdAt: Date;
      product: {
        productId: number;
        name: string;
        imageUrl: string | null;
        price: number;
        status: string;
        unit: string;
      };
    }>;
  }) {
    return {
      id: cart.id,
      token: cart.token,
      totalAmount: cart.totalAmount,
      createdAt: cart.createdAt.toISOString(),
      updatedAt: cart.updatedAt.toISOString(),
      items: cart.items.map((item) => ({
        id: item.id,
        cartId: item.cartId,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        createdAt: item.createdAt.toISOString(),
        product: {
          productId: item.product.productId,
          name: item.product.name,
          imageUrl: item.product.imageUrl,
          price: item.product.price,
          status: item.product.status,
          unit: item.product.unit,
        },
      })),
    };
  }

  async clearCart(token: string | undefined) {
    if (!token) {
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { token },
      });

      if (!cart) {
        return;
      }

      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      await tx.cart.update({
        where: { id: cart.id },
        data: { totalAmount: 0 },
      });
    });
  }
}
