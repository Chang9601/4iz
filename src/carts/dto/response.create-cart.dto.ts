import { IsNotEmpty, IsNumber } from 'class-validator';
import { Option } from 'src/items/option.entity';

export class ResponseCreateCartDto {
  @IsNumber()
  totalPrice: number;

  @IsNumber()
  totalQuantity: number;

  @IsNotEmpty()
  option: Option;
}
