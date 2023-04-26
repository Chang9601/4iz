import { IsNotEmpty } from 'class-validator';
import { Item } from '../item.entity';

export class GetItemsDto {
  @IsNotEmpty()
  total: number;

  @IsNotEmpty()
  offset: number;

  @IsNotEmpty()
  items: Item[];
}
