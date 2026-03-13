import { IsArray, IsNumber, ArrayMinSize } from 'class-validator';

export class BulkPublishArticlesDto {
  @IsArray({ message: 'Список ID статей должен быть массивом' })
  @IsNumber({}, { each: true, message: 'Каждый ID статьи должен быть числом' })
  @ArrayMinSize(1, { message: 'Необходимо выбрать хотя бы одну статью' })
  readonly articleIds: number[];
}

