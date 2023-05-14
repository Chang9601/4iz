import { IsArray, IsNumber } from 'class-validator';

export class RequestCreateCartDto {
  @IsNumber()
  itemId: number;

  @IsArray()
  options: string[];
}
