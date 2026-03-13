import { IsArray, IsNumber, IsInt, IsOptional, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFilterItem {
  @IsInt({ message: 'ID характеристики должен быть целым числом' })
  readonly characteristicNameId: number;

  @IsOptional()
  @IsInt({ message: 'Порядок отображения должен быть целым числом' })
  readonly displayOrder?: number;
}

export class UpdateFilterOrderItem {
  @IsInt({ message: 'ID фильтра должен быть целым числом' })
  readonly filterId: number;

  @IsInt({ message: 'Порядок отображения должен быть целым числом' })
  readonly displayOrder: number;
}

export class BulkUpdateCategoryFiltersDto {
  @IsInt({ message: 'ID категории должен быть целым числом' })
  readonly categoryId: number;

  @IsOptional()
  @IsArray({ message: 'Список фильтров для создания должен быть массивом' })
  @ValidateNested({ each: true })
  @Type(() => CreateFilterItem)
  readonly create?: CreateFilterItem[];

  @IsOptional()
  @IsArray({ message: 'Список ID фильтров для удаления должен быть массивом' })
  @IsInt({ each: true, message: 'Каждый ID фильтра должен быть целым числом' })
  readonly delete?: number[];

  @IsOptional()
  @IsArray({ message: 'Список фильтров для обновления порядка должен быть массивом' })
  @ValidateNested({ each: true })
  @Type(() => UpdateFilterOrderItem)
  readonly update?: UpdateFilterOrderItem[];
}

