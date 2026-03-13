import { ProductStatus, ProductUnit } from '@prisma/client';
import { IsArray, IsEnum, IsBoolean, IsString, IsNumber, Min, ArrayMinSize, IsOptional } from 'class-validator';

export class BulkUpdateProductsDto {
  @IsArray({ message: 'productIds должен быть массивом' })
  @ArrayMinSize(1, { message: 'Необходимо указать хотя бы один ID товара' })
  readonly productIds: number[];

  @IsOptional()
  @IsEnum(ProductStatus, { message: 'Статус должен быть IN_STOCK или OUT_OF_STOCK' })
  readonly status?: ProductStatus;

  @IsOptional()
  @IsBoolean({ message: 'isNew должен быть булевым значением' })
  readonly isNew?: boolean;

  @IsOptional()
  @IsString({ message: 'imageUrl должен быть строкой' })
  readonly imageUrl?: string;

  @IsOptional()
  @IsNumber({}, { message: 'categoryId должен быть числом' })
  readonly categoryId?: number;

  @IsOptional()
  @IsEnum(ProductUnit, { message: 'Единица измерения должна быть одним из допустимых значений' })
  readonly unit?: ProductUnit;
}

