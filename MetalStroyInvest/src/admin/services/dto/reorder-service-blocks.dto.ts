import { IsArray, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ReorderBlockItemDto {
  @IsNumber()
  @Type(() => Number)
  serviceBlockId: number;

  @IsNumber()
  @Type(() => Number)
  sortOrder: number;
}

export class ReorderServiceBlocksDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderBlockItemDto)
  readonly blocks: ReorderBlockItemDto[];
}
