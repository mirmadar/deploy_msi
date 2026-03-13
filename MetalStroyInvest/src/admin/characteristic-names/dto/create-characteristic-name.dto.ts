import { IsEnum, IsString } from 'class-validator';
import { ValueType } from '@prisma/client';

export class CreateCharacteristicNameDto {
  @IsString({ message: 'Название характеристики должно быть строкой' })
  readonly name: string;

  @IsEnum(ValueType, { message: 'valueType должен быть number или text' })
  readonly valueType: ValueType;
}
