import { IsArray, IsNumber } from 'class-validator';

export class BulkDeleteShipmentPostsDto {
  @IsArray({ message: 'Список ID должен быть массивом' })
  @IsNumber({}, { each: true, message: 'Каждый ID должен быть числом' })
  readonly shipmentPostIds: number[];
}


