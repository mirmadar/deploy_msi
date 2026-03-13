import { IsEnum } from 'class-validator';

export class MoveShipmentPostDto {
  @IsEnum(['up', 'down'], { message: 'direction должен быть "up" или "down"' })
  readonly direction: 'up' | 'down';
}
