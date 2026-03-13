import { IsNumber, IsInt, Min } from 'class-validator';

export class CreateCategoryFilterDto {
  @IsNumber({}, { message: 'ID категории должен быть числом' })
  @IsInt({ message: 'ID категории должен быть целым числом' })
  readonly categoryId: number;

  @IsNumber({}, { message: 'ID характеристики должен быть числом' })
  @IsInt({ message: 'ID характеристики должен быть целым числом' })
  readonly characteristicNameId: number;

  @IsNumber({}, { message: 'Порядок отображения должен быть числом' })
  @IsInt({ message: 'Порядок отображения должен быть целым числом' })
  @Min(1, { message: 'Порядок отображения должен быть больше 0' })
  readonly displayOrder?: number;
}
