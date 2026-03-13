import { IsString, IsNumber } from 'class-validator';

export class CreateServiceDto {
  @IsString({ message: 'Название должно быть строкой' })
  readonly name: string;

  @IsNumber({}, { message: 'ID категории услуг должен быть числом' })
  readonly serviceCategoryId: number;
}
