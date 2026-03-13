import { IsArray, IsNumber, IsOptional, ArrayMinSize } from 'class-validator';

export class BulkMoveServiceCategoriesDto {
  @IsArray({ message: 'Список ID категорий должен быть массивом' })
  @ArrayMinSize(1, { message: 'Необходимо выбрать хотя бы одну категорию' })
  @IsNumber({}, { each: true, message: 'Каждый ID должен быть числом' })
  readonly serviceCategoryIds: number[];

  @IsOptional()
  @IsNumber({}, { message: 'ID родительской категории должен быть числом' })
  readonly newParentId?: number | null;
}
