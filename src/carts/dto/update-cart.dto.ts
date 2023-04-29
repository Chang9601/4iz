import { IsNotEmpty } from 'class-validator';

export class UpdateCartDto {
  // Number Validator
  @IsNotEmpty()
  quantity: number;
}
