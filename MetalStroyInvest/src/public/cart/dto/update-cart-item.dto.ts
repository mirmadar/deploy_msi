import { IsNumber, Min } from 'class-validator';

export class UpdateCartItemDto {
  @IsNumber({}, { message: 'Количество должно быть числом' })
  @Min(1, { message: 'Количество должно быть больше 0' })
  readonly quantity: number;
}

