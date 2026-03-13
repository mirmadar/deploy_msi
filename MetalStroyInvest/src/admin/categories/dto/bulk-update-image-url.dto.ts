import { IsArray, IsNumber, IsString, IsOptional, ArrayMinSize } from 'class-validator';

export class BulkUpdateImageUrlDto {
  @IsArray({ message: 'Список ID категорий должен быть массивом' })
  @ArrayMinSize(1, { message: 'Необходимо выбрать хотя бы одну категорию' })
  @IsNumber({}, { each: true, message: 'Каждый ID категории должен быть числом' })
  readonly categoryIds: number[];

  @IsOptional()
  @IsString({ message: 'Ссылка на изображение должна быть строкой' })
  readonly imageUrl?: string | null;
}



