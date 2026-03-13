import { IsString, IsOptional } from 'class-validator';

export class CreateArticleDto {
  @IsString({ message: 'Название должно быть строкой' })
  readonly title: string;

  @IsString({ message: 'Текст статьи должен быть строкой' })
  readonly content: string;

  @IsOptional()
  @IsString({ message: 'Ссылка на изображение должна быть строкой' })
  readonly imageUrl?: string;
}


