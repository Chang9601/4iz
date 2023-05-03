import { IsNumber } from 'class-validator';

export class UpdateCartDto {
  @IsNumber()
  quantity: number;
}
