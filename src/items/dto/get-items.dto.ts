import { IsArray, IsNumber } from 'class-validator';
import { Item } from '../item.entity';

export class GetItemsDto {
  @IsNumber()
  total: number;

  @IsNumber()
  offset: number;

  @IsArray()
  items: Item[];
}
