import { IsEnum, IsObject } from 'class-validator';
import { ServiceBlockType } from '@prisma/client';

export class CreateServiceBlockDto {
  @IsEnum(ServiceBlockType, { message: 'Недопустимый тип блока' })
  readonly type: ServiceBlockType;

  @IsObject({ message: 'payload должен быть объектом' })
  readonly payload: Record<string, unknown>;
}
