import { IsString, IsNotEmpty, IsEmail, Matches, Length } from 'class-validator';

export class CreateOrderDto {
  @IsString({ message: 'Имя должно быть строкой' })
  @IsNotEmpty({ message: 'Имя обязательно для заполнения' })
  @Length(2, 100, { message: 'Имя должно содержать от 2 до 100 символов' })
  readonly clientName: string;

  @IsString({ message: 'Номер телефона должен быть строкой' })
  @IsNotEmpty({ message: 'Номер телефона обязателен для заполнения' })
  @Matches(/^[\d\s\+\-\(\)]+$/, {
    message: 'Номер телефона должен содержать только цифры и допустимые символы',
  })
  @Length(10, 20, { message: 'Номер телефона должен содержать от 10 до 20 символов' })
  readonly clientPhone: string;

  @IsEmail({}, { message: 'Email должен быть валидным адресом электронной почты' })
  @IsNotEmpty({ message: 'Email обязателен для заполнения' })
  readonly clientEmail: string;
}


