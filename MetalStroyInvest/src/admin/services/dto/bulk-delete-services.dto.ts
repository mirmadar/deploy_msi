import { IsArray, IsNumber, ArrayMinSize } from 'class-validator';

export class BulkDeleteServicesDto {
  @IsArray({ message: 'Список ID услуг должен быть массивом' })
  @ArrayMinSize(1, { message: 'Необходимо выбрать хотя бы одну услугу' })
  @IsNumber({}, { each: true, message: 'Каждый ID должен быть числом' })
  readonly serviceIds: number[];
}
