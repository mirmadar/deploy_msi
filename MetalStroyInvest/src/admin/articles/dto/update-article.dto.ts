import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateArticleDto {
  @IsOptional()
  @IsString({ message: 'Название должно быть строкой' })
  readonly title?: string;

  @IsOptional()
  @IsString({ message: 'Текст статьи должен быть строкой' })
  readonly content?: string;

  @IsOptional()
  @IsString({ message: 'Ссылка на изображение должна быть строкой' })
  readonly imageUrl?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Дата публикации должна быть валидной датой' })
  readonly publishedAt?: string | null;
}


