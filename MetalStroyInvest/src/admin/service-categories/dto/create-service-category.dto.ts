import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateServiceCategoryDto {
  @IsString({ message: 'Название должно быть строкой' })
  readonly name: string;

  @IsOptional()
  @IsNumber({}, { message: 'ID родительской категории должен быть числом' })
  readonly parentId?: number;

  @IsOptional()
  @IsString({ message: 'Описание должно быть строкой' })
  readonly description?: string;
}
