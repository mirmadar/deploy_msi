import { IsNumber, Min } from 'class-validator';

export class AddToCartDto {
  @IsNumber({}, { message: 'ID товара должен быть числом' })
  @Min(1, { message: 'ID товара должен быть больше 0' })
  readonly productId: number;
}

