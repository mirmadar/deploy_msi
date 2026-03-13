import { IsString, IsNumber } from 'class-validator';

export class CreateShipmentPostDto {
  @IsString({ message: 'Название должно быть строкой' })
  readonly title: string;

  @IsString({ message: 'Ссылка на изображение должна быть строкой' })
  readonly imageUrl: string;

  @IsNumber({}, { message: 'ID категории должен быть числом' })
  readonly categoryId: number;

  @IsString({ message: 'Описание должно быть строкой' })
  readonly description: string;
}
