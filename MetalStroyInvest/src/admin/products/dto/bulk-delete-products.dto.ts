import { IsArray, IsNumber, ArrayMinSize } from 'class-validator';

export class BulkDeleteProductsDto {
  @IsArray({ message: 'Список ID товаров должен быть массивом' })
  @ArrayMinSize(1, { message: 'Необходимо выбрать хотя бы один товар' })
  @IsNumber({}, { each: true, message: 'Каждый ID товара должен быть числом' })
  readonly productIds: number[];
}



