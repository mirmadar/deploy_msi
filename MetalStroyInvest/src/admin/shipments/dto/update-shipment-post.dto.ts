import { IsString, IsNumber, IsOptional, IsDateString, ValidateIf } from 'class-validator';

export class UpdateShipmentPostDto {
  @IsOptional()
  @IsString({ message: 'Название должно быть строкой' })
  readonly title?: string;

  @IsOptional()
  @IsString({ message: 'Ссылка на изображение должна быть строкой' })
  readonly imageUrl?: string;

  @IsOptional()
  @IsNumber({}, { message: 'ID категории должен быть числом' })
  readonly categoryId?: number;

  @IsOptional()
  @IsString({ message: 'Описание должно быть строкой' })
  readonly description?: string;

  /** null — снять с публикации (черновик) */
  @IsOptional()
  @ValidateIf((o) => o.publishedAt != null)
  @IsDateString({}, { message: 'Дата публикации должна быть валидной датой' })
  readonly publishedAt?: string | null;
}
