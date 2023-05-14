import { IsArray, IsNumber } from 'class-validator';
import { Cart } from '../cart.entity';

export class GetCartsDto {
  @IsNumber()
  total: number;

  @IsNumber()
  offset: number;

  @IsArray()
  carts: Cart[];
}
