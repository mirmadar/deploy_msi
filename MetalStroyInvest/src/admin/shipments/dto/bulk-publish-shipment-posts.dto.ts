import { IsArray, IsNumber, ArrayMinSize } from 'class-validator';

export class BulkPublishShipmentPostsDto {
  @IsArray({ message: 'Список ID постов отгрузок должен быть массивом' })
  @IsNumber({}, { each: true, message: 'Каждый ID должен быть числом' })
  @ArrayMinSize(1, { message: 'Необходимо выбрать хотя бы один пост отгрузки' })
  readonly shipmentPostIds: number[];
}
