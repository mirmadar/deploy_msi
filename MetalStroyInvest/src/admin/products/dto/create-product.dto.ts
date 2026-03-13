import { Type } from 'class-transformer';
import { IsString, IsNumber, IsOptional, IsBoolean, Min, ValidateNested, IsEnum } from 'class-validator';
import { ProductStatus, ProductUnit } from '@prisma/client';
import { CreateProductCharacteristicDto } from 'src/admin/product-characteristics/dto/create-product-characteristic.dto';

export class CreateProductDto {
  @IsString({ message: 'Название должно быть строкой' })
  readonly name: string;

  @IsNumber({}, { message: 'Цена должна быть числом' })
  @Min(0, { message: 'Цена не может быть отрицательной' })
  readonly price: number;

  @IsOptional()
  @IsString({ message: 'Ссылка на изображение должна быть строкой' })
  readonly imageUrl?: string;

  @IsOptional()
  @IsBoolean({ message: 'Новинка должна быть булевым значением' })
  readonly isNew?: boolean;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateProductCharacteristicDto)
  readonly characteristics?: CreateProductCharacteristicDto[];

  @IsOptional()
  @IsEnum(ProductStatus, { message: 'Статус должен быть IN_STOCK или OUT_OF_STOCK' })
  readonly status?: ProductStatus;

  @IsOptional()
  @IsEnum(ProductUnit, { message: 'Единица измерения должна быть одним из допустимых значений' })
  readonly unit?: ProductUnit;

  @IsOptional()
  @IsNumber({}, { message: 'ID категории должен быть числом' })
  readonly categoryId?: number;
}
