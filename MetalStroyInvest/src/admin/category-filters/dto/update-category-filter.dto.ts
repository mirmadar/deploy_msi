import { IsNumber, IsInt, Min, IsOptional } from 'class-validator';

export class UpdateCategoryFilterDto {
  @IsOptional()
  @IsNumber({}, { message: 'Порядок отображения должен быть числом' })
  @IsInt({ message: 'Порядок отображения должен быть целым числом' })
  @Min(1, { message: 'Порядок отображения должен быть больше 0' })
  readonly displayOrder?: number;
}
