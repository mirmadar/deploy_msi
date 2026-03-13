import { ProductStatus, ProductUnit } from '@prisma/client';
import { IsString, IsNumber, IsOptional, IsBoolean, Min, IsEnum } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString({ message: 'Название должно быть строкой' })
  readonly name?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Цена должна быть числом' })
  @Min(0, { message: 'Цена не может быть отрицательной' })
  readonly price?: number;

  @IsOptional()
  @IsString({ message: 'Ссылка на изображение должна быть строкой' })
  readonly imageUrl?: string;

  @IsOptional()
  @IsBoolean({ message: 'Новинка должна быть булевым значением' })
  readonly isNew?: boolean;

  @IsOptional()
  @IsEnum(ProductStatus, { message: 'Статус должен быть IN_STOCK или OUT_OF_STOCK' })
  readonly status?: ProductStatus;

  @IsOptional()
  @IsEnum(ProductUnit, { message: 'Единица измерения должна быть одним из допустимых значений' })
  readonly unit?: ProductUnit;

  @IsOptional()
  readonly categoryId?: number;

  @IsOptional()
  @IsString({ message: 'Slug должен быть строкой' })
  readonly slug?: string;
}
