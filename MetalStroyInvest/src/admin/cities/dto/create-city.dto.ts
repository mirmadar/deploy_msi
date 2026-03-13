import { IsString, IsOptional, Matches } from 'class-validator';

export class CreateCityDto {
  @IsString({ message: 'Название города должно быть строкой' })
  readonly name: string;

  @IsString({ message: 'Slug должен быть строкой' })
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug может содержать только строчные латинские буквы, цифры и дефисы',
  })
  readonly slug: string;

  @IsString({ message: 'Телефон должен быть строкой' })
  readonly phone: string;

  @IsOptional()
  @IsString({ message: 'Часы работы должны быть строкой' })
  readonly workHours?: string;
}

