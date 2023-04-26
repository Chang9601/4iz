import { IsNotEmpty } from 'class-validator';

export class CreateCartDto {
  @IsNotEmpty()
  itemId: number;

  @IsNotEmpty()
  options: string[];
}
