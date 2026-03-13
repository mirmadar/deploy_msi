import { IsArray, IsNumber, ArrayMinSize } from 'class-validator';

export class BulkDeleteServiceCategoriesDto {
  @IsArray({ message: 'Список ID категорий должен быть массивом' })
  @ArrayMinSize(1, { message: 'Необходимо выбрать хотя бы одну категорию' })
  @IsNumber({}, { each: true, message: 'Каждый ID должен быть числом' })
  readonly serviceCategoryIds: number[];
}
