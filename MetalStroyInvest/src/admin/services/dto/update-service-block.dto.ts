import { IsObject } from 'class-validator';

export class UpdateServiceBlockDto {
  @IsObject({ message: 'payload должен быть объектом' })
  readonly payload: Record<string, unknown>;
}
