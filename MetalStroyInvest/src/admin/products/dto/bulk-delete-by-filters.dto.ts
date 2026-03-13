import { IsOptional, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductFiltersDto } from './bulk-update-by-filters.dto';

export class BulkDeleteByFiltersDto {
  @ValidateNested()
  @Type(() => ProductFiltersDto)
  readonly filters: ProductFiltersDto;

  @IsOptional()
  @IsNumber({}, { message: 'confirmCount должен быть числом' })
  readonly confirmCount?: number;
}

