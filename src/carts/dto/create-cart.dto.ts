import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateCartDto {
  @IsNumber()
  itemId: number;

  @IsNotEmpty()
  options: string[];
}
