import { ProductStatus, ProductUnit } from '@prisma/client';
import { IsArray, IsEnum, IsBoolean, IsString, IsNumber, IsOptional, ValidateNested, ArrayMaxSize, Min } from 'class-validator';
import { Type } from 'class-transformer';

const MAX_CATEGORY_IDS = 200;

export class ProductFiltersDto {
  @IsOptional()
  @IsArray({ message: 'categories должен быть массивом' })
  @IsString({ each: true, message: 'Каждая категория должна быть строкой' })
  readonly categories?: string[];

  @IsOptional()
  @IsNumber({}, { message: 'minPrice должен быть числом' })
  readonly minPrice?: number;

  @IsOptional()
  @IsNumber({}, { message: 'maxPrice должен быть числом' })
  readonly maxPrice?: number;

  @IsOptional()
  @IsEnum(ProductStatus, { message: 'Статус должен быть IN_STOCK или OUT_OF_STOCK' })
  readonly status?: ProductStatus;

  @IsOptional()
  @IsBoolean({ message: 'isNew должен быть булевым значением' })
  readonly isNew?: boolean;

  @IsOptional()
  @IsEnum(ProductUnit, { message: 'Единица измерения должна быть одним из допустимых значений' })
  readonly unit?: ProductUnit;

  @IsOptional()
  @IsNumber({}, { message: 'categoryId должен быть числом' })
  readonly categoryId?: number;

  @IsOptional()
  @IsArray({ message: 'categoryIds должен быть массивом' })
  @IsNumber({}, { each: true, message: 'Каждый элемент categoryIds должен быть числом' })
  @Min(1, { each: true, message: 'categoryIds: каждый id должен быть ≥ 1' })
  @ArrayMaxSize(MAX_CATEGORY_IDS, { message: `categoryIds: не более ${MAX_CATEGORY_IDS} элементов` })
  readonly categoryIds?: number[];
}

export class BulkUpdateByFiltersDto {
  @ValidateNested()
  @Type(() => ProductFiltersDto)
  readonly filters: ProductFiltersDto;

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

  @IsOptional()
  @IsNumber({}, { message: 'confirmCount должен быть числом' })
  readonly confirmCount?: number;
}

