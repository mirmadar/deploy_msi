import { IsString, IsNotEmpty, Matches, Length } from 'class-validator';

export class CreateCallbackRequestDto {
  @IsString({ message: 'Имя должно быть строкой' })
  @IsNotEmpty({ message: 'Имя обязательно для заполнения' })
  @Length(2, 100, { message: 'Имя должно содержать от 2 до 100 символов' })
  readonly name: string;

  @IsString({ message: 'Номер телефона должен быть строкой' })
  @IsNotEmpty({ message: 'Номер телефона обязателен для заполнения' })
  @Matches(/^[\d\s\+\-\(\)]+$/, {
    message: 'Номер телефона должен содержать только цифры и допустимые символы',
  })
  @Length(10, 20, { message: 'Номер телефона должен содержать от 10 до 20 символов' })
  readonly phone: string;
}
