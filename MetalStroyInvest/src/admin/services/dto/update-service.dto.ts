import { IsString, IsNumber, IsOptional } from 'class-validator';

export class UpdateServiceDto {
  @IsOptional()
  @IsString({ message: 'Название должно быть строкой' })
  readonly name?: string;

  @IsOptional()
  @IsNumber({}, { message: 'ID категории услуг должен быть числом' })
  readonly serviceCategoryId?: number;
}
